import game from "@/js/game";

function storeFoundItems() {
    const items = game.getFoundItems();
    localStorage.setItem('found-items', JSON.stringify(items));
}

function storeBoard() {
    const items = game.getBoard();
    localStorage.setItem('board', JSON.stringify(items));
}

function store() {
    storeFoundItems();
    storeBoard();
}

function load() {
    const found = localStorage.getItem('found-items');
    if (found) {
        game.setFoundItems(JSON.parse(found));
    }

    const board = localStorage.getItem('board');
    if (board) {
        game.setBoard(JSON.parse(board));
    }

    const stats = localStorage.getItem('stats');
    if (stats) {
        game.setStats(JSON.parse(stats));
    }
}

function storeStats() {
    const stats = game.getStats();
    localStorage.setItem('stats', JSON.stringify(stats));
}

export {
    storeFoundItems,
    storeBoard,
    storeStats,
    store,
    load
}