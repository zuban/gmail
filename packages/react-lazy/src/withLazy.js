import invariant from 'invariant';

import decorateHandler from './decorateHandler';
import * as defaultHandler from './handlers/imgLoader';

const checkArgType = (arg, val, type = 'function') => {
    invariant(
        typeof val === type, // eslint-disable-line
        'Expected "%s" provided as an argument to LazyLoad to be a %s. Instead, received %s.',
        arg,
        type,
        val,
    );
};
const checkOptionType = (opt, val, type) => {
    invariant(
        typeof val === type, // eslint-disable-line
        'Expected "%s" option provided to LazyLoad to be a %s. Instead, received %s.',
        opt,
        type,
        val,
    );
};

export default function LazyLoad(spec = {}) {
    let {
        preload = defaultHandler.preload,
        display = defaultHandler.display,
        precedeLeave = defaultHandler.precedeLeave,
        viewportLeave = defaultHandler.viewportLeave,
        getScroll = defaultHandler.getScroll,
        options = {},
    } = spec;

    // Check arguments type
    checkArgType('preload', preload);
    checkArgType('display', display);
    checkArgType('precedeLeave', precedeLeave);
    checkArgType('viewportLeave', viewportLeave);
    checkArgType('getScroll', viewportLeave);

    options = {
        ...defaultHandler.options,
        ...options,
    };
    // Check required options type
    checkOptionType('lazyClass', options.lazyClass, 'string');
    checkOptionType('pendingClass', options.pendingClass, 'string');
    checkOptionType('completeClass', options.completeClass, 'string');
    checkOptionType('precede', options.precede, 'number');
    checkOptionType('immediate', options.immediate, 'boolean');

    return function decorate(DecoratedComponent) {
        return decorateHandler({
            DecoratedComponent,
            preload,
            display,
            precedeLeave,
            viewportLeave,
            getScroll,
            options,
        });
    };
}
