import PropTypes from 'prop-types';
import {Component, Children} from 'react';

import LazyManager from './Manager';

export default class LazyProvider extends Component {
    static displayName = 'LazyProvider'

    static propTypes = {
        children: PropTypes.element.isRequired,
    }

    static childContextTypes = {
        lazyManager: PropTypes.object,
    }

    state = {
        lazyManager: new LazyManager(),
    }

    getChildContext() {
        return {
            lazyManager: this.state.lazyManager,
        };
    }

    render() {
        return Children.only(this.props.children);
    }
}
