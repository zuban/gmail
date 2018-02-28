import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Children} from 'react';

import isBrowser from 'packages/utils/isBrowser';
import {userAgentAction} from 'packages/redux';
import {mobileBreakpoint} from 'packages/enum';

const checkMobile = () => isBrowser ?
    window.innerWidth < mobileBreakpoint.thin :
    undefined;

export default class Layout extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,

        // For storybook usage
        isMobile: PropTypes.bool,
    };

    static defaultProps = {
        isMobile: undefined,
    };

    static contextTypes = {
        store: PropTypes.object,
    };

    static childContextTypes = {
        userAgent: PropTypes.object,
    };

    /**
     * Puts userAgent in context.
     */
    getChildContext() {
        const {store} = this.context;

        if (store) {
            // normal usage
            return {
                userAgent: store.getState().getIn(['userAgent']).toJS(),
            };
        } else {
            // storybook usage
            let {isMobile} = this.props;
            return {
                userAgent: {
                    isMobile: _.isUndefined(isMobile) ? checkMobile() : isMobile,
                },
            };
        }
    }

    constructor(...args) {
        super(...args);
        this.onResize = _.debounce(this.onResize, 200);
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    componentDidCatch(error, info) {
        // catch errors
    }

    /**
     * Update `isMobile` in redux after resize
     */
    onResize = () => {
        const {store} = this.context;
        if (store) {
            store.dispatch(userAgentAction({
                isMobile: checkMobile(),
            }));
        }
        this.forceUpdate(); // under storybook
    };

    render() {
        return Children.only(this.props.children);
    }
}
