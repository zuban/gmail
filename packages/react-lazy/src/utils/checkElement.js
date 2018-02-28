import invariant from 'invariant';

export const throwIfCompositeComponentElement = (element) => {
    // Custom components can not be wrapped directly
    // so that we don't need to depend on findDOMNode() from react-dom.
    if (typeof element.type === 'string') {
        return;
    }
    const displayName = element.type.displayName ||
        element.type.name ||
        'the component';

    throw new Error(
        'Only native element nodes can be passed to Lazy connectors.' +
        `You can wrap ${displayName} into a <div>`
    );
};

export const isNodeListEqual = (list1, list2) => {
    invariant(
        Array.isArray(list1) || list1 instanceof NodeList,
        'Expected "list1" argument provided to isNodeListEquel to be ' +
        'NodeList or array of HTMLElement instnces. Instead, received %s.',
        list1,
    );
    invariant(
        Array.isArray(list2) || list2 instanceof NodeList,
        'Expected "list2" argument provided to isNodeListEquel to be ' +
        'NodeList or array of HTMLElement instnces. Instead, received %s.',
        list2,
    );

    list1 = [].slice.call(list1);
    list2 = [].slice.call(list2);

    // Check that previous and current laze elements are same
    const set1 = new Set(list1);
    const size = set1.size;
    const set2 = new Set(list2);

    let isEqual = size === set2.size;

    if (isEqual) {
        for (const elem of set2.values()) {
            set1.add(elem);
        }
        isEqual = size === set1.size;
    }
    return isEqual;
};
