/** @type Array */
const recipes = require('./recipies.json');

const combinations = recipes.reduce((comb, [first, second]) => {
    if (!comb.hasOwnProperty(second)) comb[second] = [];
    comb[second].push(first);
    return comb;
}, {});

const combine = (el1, el2) => {
    let recipe = [el1, el2].sort().join(',');
    return combinations[recipe];
}

const initialItems = () => {
    return ["fire", "water", "earth", "air"]
}

const allItems = () => {
    const items = [];

    initialItems().forEach(v => {
        if (items.indexOf(v) === -1) {
            items.push(v);
        }
    });

    recipes.forEach(v => {
        if (items.indexOf(v[0]) === -1) {
            items.push(v[0]);
        }
    });

    return items;
}

const allItemsCount = () => {
    return 100;
}

export {
    recipes,
    combinations,
    combine,
    initialItems,
    allItems,
    allItemsCount
}
