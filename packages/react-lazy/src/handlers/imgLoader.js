import {getScroll as getDomScroll, getClientRect} from '../utils/domCalculation';

export const options = {
    // Class to find lazy elements
    lazyClass: 'lazy',

    // Class to set on lazy elements when precede area is reached
    pendingClass: 'lazy-pending',

    // Class to set on lazy elements when it visible first time
    completeClass: 'lazy-complete',

    // Precede area size in terms of window width and height.
    // For instance, 1 means that the precede area is to equal
    // one window height below and above (and same to the width).
    precede: 0,

    // Call `display` immediate as the item is reached precede area (no preload phase)
    immediate: false,

    // Attribute where image url is initially stored
    srcAttribute: 'data-src',
};

/**
 * Обрабатывает вхождение в зону предзагрузки - предварительно загружает изображение.
 * @param {HTMLElement} elem Lazy-элемент.
 * @private
 */
export const preload = ({elem}, options) => {
    const {pendingClass, srcAttribute} = options;

    if (elem.classList.contains(pendingClass)) {
        return true;
    }
    elem.classList.add(pendingClass);

    switch (elem.tagName) {
        case 'IMG':
            let src = elem.getAttribute(srcAttribute);

            if (src) {
                let img = new Image();
                img.src = src;
            }
    }
    return true;
};

/**
 * Обрабатывает вхождение во вьюпорт - помещает урл картинки в атрибут src.
 * @param {Object} item Метрики lazy-элемента.
 * @param {HTMLElement} item.elem Lazy-элемент.
 * @private
 */
export const display = (item, options) => {
    const {pendingClass, srcAttribute} = options;
    const elem = item.elem;
    let src;

    switch (elem.tagName) {
        case 'IMG':
            src = elem.getAttribute(srcAttribute);

            if (src) {
                elem.classList.add(pendingClass);
                elem.setAttribute('src', src);
                elem.removeAttribute(srcAttribute);

                const onDone = done(item, options);
                elem.onload = onDone;
                elem.onerror = onDone;
            }
    }
};

export const precedeLeave = () => {
    return true;
};

export const viewportLeave = () => {
    return true;
};

export const getScroll = (elem) => {
    return getDomScroll(elem);
};

const done = (item, options) => {
    const {lazyClass, pendingClass, completeClass} = options;
    const {elem} = item;

    return () => {
        if (elem) {
            elem.classList.add(completeClass);
            elem.classList.remove(pendingClass);
            elem.classList.remove(lazyClass);

            checkElemSize(item);
        }
    };
};

/**
 * Fires `resize` event if img sizes are changed
 * @param item
 */
const checkElemSize = ({elem, width, height}) => {
    let rect = getClientRect(elem);

    if (rect.width !== width || rect.height !== height) {
        let evt = document.createEvent('HTMLEvents');
        evt.initEvent('resize', true, false);
        window.dispatchEvent(evt);
    }
};
