import invariant from 'invariant';

const checkWindowExists = (name = '') => {
    invariant(
        typeof window === 'object',
        `Expected ${name} method should not be called on the server side`,
    );
};

/**
 * Возвращает размер элемента и позицию относительно верхнего левого угла окна.
 * В Opera 12 не ребатает, если css-свойство display у элемента установлено в inline или inline-block.
 * @param {HTMLElement} elem
 * @returns {Object}
 */
export const getClientRect = (elem) => {
    checkWindowExists('getClientRect');
    invariant(
        elem instanceof HTMLElement,
        'Expected "elem" argument provided to getClientRect to be an HTMLElement instnce. Instead, received %s.',
        elem,
    );

    if (elem === document.body) {
        return {left: 0, top: 0, width: window.innerWidth, height: window.innerHeight};
    }
    const {left, top, width = elem.offsetWidth, height = elem.offsetHeight} = elem.getBoundingClientRect();
    return {left, top, width, height};
};

/**
 * Возвращает значение вертикального и горизонтального скрола.
 * @param {HTMLElement} [elem] Элемент, для которого вычисляется значение скрола.
 *   Если не указан, вычисляется скролл окна.
 * @returns {{top: number, left: number}}
 */
export const getScroll = (elem) => {
    checkWindowExists('getScroll');
    invariant(
        typeof elem === 'undefined' || elem instanceof HTMLElement,
        'Expected "elem" argument provided to getScroll to be an HTMLElement instnce. Instead, received %s.',
        elem,
    );
    const docElem = document.documentElement;
    const body = document.body;
    let scroll = {top: 0, left: 0};

    if (elem === body || !elem) {
        scroll.top = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        scroll.left = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    } else {
        scroll.top = elem.scrollTop;
        scroll.left = elem.scrollLeft;
    }

    // Correct negative scroll value on Safari
    scroll.top = Math.max(scroll.top, 0);
    scroll.left = Math.max(scroll.left, 0);

    return scroll;
};

/**
 * Рассчитывает значение скрола, при котором lazy-элемент находится во вьюпорте.
 * По каждой оси рассчитывается минимальный (in) и максимальный (out) скролл.
 * @param {HTMLElement} elem Lazy element
 * @param {HTMLElement} vpRect
 * @param {{top: number, left: number}} scroll
 * @returns {Object}
 */
export const calculateLazyMetrics = ({elem, vpRect, scroll}) => {
    let rect = getClientRect(elem);

    // Расстояния элемента от границы вьюпорта
    let left = rect.left - vpRect.left;
    let right = left + rect.width;
    let top = rect.top - vpRect.top;
    let bottom = top + rect.height;

    // Диапазоны скрола вьюпорта, при которых элемент хотя бы частично виден во вьюпорте
    let widthIn = left - vpRect.width + scroll.left;
    let widthOut = right + scroll.left;
    let heightIn = top - vpRect.height + scroll.top;
    let heightOut = bottom + scroll.top;

    // Скорректировать отрицательный скролл и скролл больше максимально возможного
    widthIn = Math.max(widthIn, 0);
    widthOut = Math.min(widthOut, vpRect.scrollWidth);
    heightIn = Math.max(heightIn, 0);
    heightOut = Math.min(heightOut, vpRect.scrollHeight);

    return {widthIn, widthOut, heightIn, heightOut};
};

export const getVisibility = ({item, vpRect, outdent, scroll}) => {
    let visibility = {
        isVisible: false,
        isPrecede: false,
        proportion: {},
    };

    if (item.width || item.height) {
        let precedWidth = item.precede * vpRect.width;
        let precedHeight = item.precede * vpRect.height;

        // Рассчитать границы скрола с учетом заступов вьюпорта за границы окна
        let widthIn = item.widthIn - outdent.right;
        let widthOut = item.widthOut + outdent.left;
        let heightIn = item.heightIn - outdent.bottom;
        let heightOut = item.heightOut + outdent.top;

        let isVisible = scroll.left >= widthIn
            && scroll.left <= widthOut
            && scroll.top >= heightIn
            && scroll.top <= heightOut;

        let isPrecede = isVisible
            || (scroll.left + precedWidth) >= widthIn
            && (scroll.left - precedWidth) <= widthOut
            && (scroll.top + precedHeight) >= heightIn
            && (scroll.top - precedHeight) <= heightOut;

        visibility.isVisible = isVisible;
        visibility.isPrecede = isPrecede;

        // Рассчитать пропорцию вхождения по x и y: насколько элемент находится в окне -
        // от 0 при входе до 1 при выходе
        if (isVisible || isPrecede) {
            let propX = widthOut !== widthIn ?
                (scroll.left - widthIn) / (widthOut - widthIn) :
                0.5;

            let propY = heightOut !== heightIn ?
                (scroll.top - heightIn) / (heightOut - heightIn) :
                0.5;

            visibility.proportion.x = Math.max(0, Math.min(1, propX));
            visibility.proportion.y = Math.max(0, Math.min(1, propY));
        }
    }

    return visibility;
};

/**
 * Вычисляет заступы вьюпорта за границы окна. Если вьюпорт – это окно, заступы равны нулю.
 * @returns {{left: number, right: number, top: number, bottom: number}}
 * @private
 */
export const getOutdent = (viewport) => {
    checkWindowExists('getOutdent');
    invariant(
        viewport instanceof HTMLElement,
        'Expected "viewport" argument provided to getScroll to be an HTMLElement instnce. Instead, received %s.',
        viewport,
    );

    if (viewport === document.body) {
        return {left: 0, right: 0, top: 0, bottom: 0};
    }
    const rect = getClientRect(viewport);
    return {
        left: Math.min(0, rect.left),
        right: Math.min(0, window.innerWidth - rect.left - rect.width),
        top: Math.min(0, rect.top),
        bottom: Math.min(0, window.innerHeight - rect.top - rect.height),
    };
};
