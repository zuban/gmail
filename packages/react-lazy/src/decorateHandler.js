import {debounce} from 'lodash';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';
import React, {Component, isValidElement} from 'react';

import shallowEqual from './utils/shallowEqual';
import shallowEqualScalar from './utils/shallowEqualScalar';
import cloneWithRef from './utils/cloneWithRef';
import {
    throwIfCompositeComponentElement,
    isNodeListEqual,
} from './utils/checkElement';
import {
    getClientRect,
    calculateLazyMetrics,
    getOutdent,
    getVisibility,
} from './utils/domCalculation';

const VIEW_STATE = {
    out: 0,             // за пределами зоны слежения
    precedeEnter: 1,    // вошел в зону предзагрузки
    precedeMove: 2,     // движется по зоне предзагрузки
    viewportEnter: 4,   // вошел во вьюпорт
    viewportMove: 8,    // движется по вьюпорту
};

export default function decorateHandler({
    DecoratedComponent,
    arePropsEqual = shallowEqualScalar,
    preload,
    display,
    precedeLeave,
    viewportLeave,
    getScroll,
    options,
}) {
    const displayName = DecoratedComponent.displayName ||
        DecoratedComponent.name ||
        'Component';

    class Lazy extends Component {
        static displayName = `Lazy(${displayName})`

        static contextTypes = {
            lazyManager: PropTypes.object,
        }

        state = {
            metrics: [],
            vpRect: {},
            viewport: null,
            prevViewport: null,
            content: null,
            decoratedComponentInstance: null,
        }

        constructor(...args) {
            super(...args);

            if (typeof window === 'undefined') {
                return;
            }
            invariant(
                typeof this.context.lazyManager === 'object',
                'Could not find the lazy manager in the context of %s. ' +
                'Make sure to wrap the top-level component of your app with LazyProvider.',
                displayName,
            );
            this.registerViewport = debounce(this.registerViewport, 30);
        }

        componentDidMount() {
            this.isCurrentlyMounted = true;

            // Define viewport and content if they are not defined
            // in wrapped component by `connectViewport` and `connectContent` methods
            const {viewport, content} = this.state;
            this.state.viewport = viewport || document.body;
            this.state.content = content || viewport || document.body;

            this.registerViewport();
        }

        componentWillUnmount() {
            this.isCurrentlyMounted = false;
            this.unregister();
        }

        shouldComponentUpdate(nextProps, nextState) {
            return !arePropsEqual(nextProps, this.props) ||
                !shallowEqual(nextState, this.state);
        }

        onScroll = () => {
            if (this.isCurrentlyMounted) {
                this.checkMetrics();
            }
        }

        onResize = () => {
            if (this.isCurrentlyMounted) {
                this.recalcViewportMetrics();
                this.recalcLazyMetrics();
                this.checkMetrics();
            }
        }

        handleChildRef = (component) => {
            this.state.decoratedComponentInstance = component;
            this.registerViewport();
        }

        connectViewport = (element) => {
            if (!isValidElement(element)) {
                return;
            }
            throwIfCompositeComponentElement(element);

            return cloneWithRef(element, (node) => {
                this.state.viewport = node;
                this.registerViewport();
            });
        }

        connectContent = (element) => {
            if (!isValidElement(element)) {
                return;
            }
            throwIfCompositeComponentElement(element);

            return cloneWithRef(element, (node) => {
                this.state.content = node;
                this.registerViewport();
            });
        }

        registerViewport = () => {
            if (typeof window === 'undefined') {
                return;
            }
            this.unregister = this.context.lazyManager.register({
                onScroll: this.onScroll,
                onResize: this.onResize,
                viewport: this.state.viewport,
            });
            this.restartWatch();
        }

        restartWatch() {
            const {viewport, vpRect, prevViewport, metrics} = this.state;
            const {width, height} = getClientRect(viewport);

            const elems = this.getElemsFromDom();
            const isElemsEqual = isNodeListEqual(elems, metrics.map(({elem}) => elem));

            // Check if viewport size or viewport itself is changed. It always happens at first time
            if (prevViewport !== viewport ||
                width !== vpRect.width || height !== vpRect.height ||
                !isElemsEqual
            ) {
                this.state.prevViewport = viewport;
                this.addElems(elems);
                this.recalcViewportMetrics();
                this.recalcLazyMetrics();
                this.checkMetrics();
            }
        }

        getElemsFromDom() {
            const {lazyClass, completeClass} = options;
            const {viewport} = this.state;

            const elems = viewport.querySelectorAll(`.${lazyClass}`);
            return [].slice.call(elems)
                .filter(({classList}) => !classList.contains(completeClass));
        }

        addElems(elems) {
            const {precede, immediate} = options;

            // Calculate lazy elements metrics
            this.state.metrics = elems.map((elem) => ({
                elem,
                precede,
                immediate,
                state: VIEW_STATE.out,
                ...getClientRect(elem),
            }));
        }

        recalcViewportMetrics() {
            const {viewport, content} = this.state;

            this.state.vpRect = {
                ...getClientRect(viewport),
                // Максимальный скролл по ширине и высоте
                scrollWidth: content.scrollWidth,
                scrollHeight: content.scrollHeight,
            };
        }

        recalcLazyMetrics() {
            const {viewport, vpRect} = this.state;
            const scroll = getScroll(viewport);

            // update lazy metrics
            this.state.metrics = this.state.metrics.map((item) => ({
                ...item,
                ...calculateLazyMetrics({elem: item.elem, vpRect, scroll}),
            }));
        }

        checkMetrics() {
            const VST = VIEW_STATE;
            const {viewport, vpRect, decoratedComponentInstance: inst} = this.state;

            if (!inst) {
                return;
            }
            const scroll = getScroll(viewport);
            const outdent = getOutdent(viewport);   // заступы вьюпорта за границы окна

            this.state.metrics = this.state.metrics.filter(item => {
                const {isVisible, isPrecede, proportion} = getVisibility({item, scroll, outdent, vpRect});
                // Аргументы келбеков
                const args = {
                    item: {...item},
                    proportion,
                    options,
                    getScroll,
                };

                if (isVisible) {
                    // Вхождение во вьюпорт
                    let fromPrecede = item.state & VST.precedeMove || item.state & VST.precedeEnter;

                    item.state = item.state & VST.viewportEnter || item.state & VST.viewportMove ?
                        VST.viewportMove :
                        VST.viewportEnter;

                    return do {
                        if (fromPrecede) {
                            if (precedeLeave.call(inst, args)) {
                                display.call(inst, args);
                            }
                        } else {
                            display.call(inst, args);
                        }
                    };
                } else if (!isVisible && !isPrecede &&
                    item.state & VST.viewportEnter || item.state & VST.viewportMove
                ) {
                    // Покидание вьюпорта (зона предзагрузки не задана)
                    item.state = VST.out;
                    return viewportLeave.call(inst, args);
                } else if (isPrecede) {
                    // Вхождение в зону предзагрузки
                    let fromViewport = item.state & VST.viewportMove || item.state & VST.viewportEnter;

                    item.state = item.state & VST.precedeEnter || item.state & VST.precedeMove ?
                        VST.precedeMove :
                        VST.precedeEnter;

                    return do {
                        if (fromViewport) {
                            if (viewportLeave.call(inst, args)) {
                                item.immediate ?
                                    display.call(inst, args) :
                                    preload.call(inst, args);
                            }
                        } else {
                            item.immediate ?
                                display.call(inst, args) :
                                preload.call(inst, args);
                        }
                    };
                } else if (item.state & VST.precedeMove || item.state & VST.precedeEnter) {
                    // Покидание зоны предзагрузки
                    item.state = VST.out;
                    return precedeLeave.call(inst, args);
                } else {
                    // Движение за пределами зоны предзагрузки
                    item.state = VST.out;
                    return true;
                }
            });
        }

        render() {
            return (
                <DecoratedComponent
                    {...this.props}
                    connectViewport={this.connectViewport}
                    connectContent={this.connectContent}
                    ref={this.handleChildRef}
                />
            );
        }
    }

    return hoistStatics(Lazy, DecoratedComponent);
}
