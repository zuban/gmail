import invariant from 'invariant';
import raf from './utils/requestAnimationFrame';

let instance;

export default class LazyManager {
    // Scroll listeners
    scrollListeners = new Map();
    resizeListeners = new Set();

    constructor(...args) {
        if (!(this instanceof LazyManager)) {
            return new LazyManager(...args);
        }
        // be singletone
        if (instance) {
            instance.destroy();
        }
        instance = this;

        if (typeof window === 'object') {
            this.onWindowScroll = raf.bind(null, this.onWindowScroll);
            this.onWindowResize = raf.bind(null, this.onWindowResize);
            this.addWindowListeners();
        }
        return {
            register: this.register,
        };
    }

    addWindowListeners() {
        if (typeof window === 'object') {
            window.addEventListener('scroll', this.onWindowScroll, {passive: true});
            window.addEventListener('resize', this.onWindowResize, {passive: true});
        }
    }

    removeWindowListeners() {
        if (typeof window === 'object') {
            window.removeEventListener('scroll', this.onWindowScroll, {passive: true});
            window.removeEventListener('resize', this.onWindowResize, {passive: true});
        }
    }

    onWindowScroll = () => {
        for (const onScroll of this.scrollListeners.keys()) {
            onScroll();
        }
    }

    onWindowResize = () => {
        for (const onResize of this.resizeListeners.values()) {
            onResize();
        }
    }

    register = ({onScroll, onResize, viewport: nextViewport}) => {
        invariant(
            typeof window === 'object',
            'Expected "register" method of LazyManager to not calls on server side',
        );
        invariant(
            typeof onScroll === 'function',
            'Expected "onScroll" provided as an argument to register ' +
            'to be a function. Instead, received %s. ',
            onScroll,
        );
        invariant(
            typeof onResize === 'function',
            'Expected "onResize" provided as an argument to register ' +
            'to be a function. Instead, received %s. ',
            onResize,
        );
        invariant(
            !nextViewport || nextViewport instanceof HTMLElement,
            'Expected "viewport" provided as an argument to register ' +
            'to be a HTMLElement or undefined. Instead, received %s. ',
            nextViewport,
        );

        // Previously stored viewport and listener
        let {viewport, onViewportScroll} = this.scrollListeners.get(onScroll) || {};

        // Remove old listener if viewport changes
        if (viewport && viewport !== nextViewport) {
            viewport.removeEventListener('scroll', onViewportScroll, {passive: true});
        }

        // add scroll listener
        if (nextViewport && nextViewport !== document.body) {
            onViewportScroll = raf.bind(null, onScroll);

            this.scrollListeners.set(onScroll, {
                onViewportScroll,
                viewport: nextViewport,
            });
            nextViewport.addEventListener('scroll', onViewportScroll, {passive: true});
        } else {
            this.scrollListeners.set(onScroll, {});
        }

        // add resize listener
        this.resizeListeners.add(onResize);

        // return unsubscribe function
        const unregister = () => {
            const {viewport, onViewportScroll} = this.scrollListeners.get(onScroll) || {};

            if (viewport) {
                viewport.removeEventListener('scroll', onViewportScroll, {passive: true});
            }
            this.scrollListeners.delete(onScroll);
            this.resizeListeners.delete(onResize);
        };
        return unregister;
    }

    destroy() {
        if (this._destroyed) {
            return;
        }
        this._destroyed = true;

        this.removeWindowListeners();
    }
}
