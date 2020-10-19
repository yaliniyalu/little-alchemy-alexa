import game from "@/js/game";

const saveQueue = [];

function init() {
    setInterval(() => {
        save();
    }, 1500)
}

function save() {
    if (saveQueue.includes(StoreTypeEnum.FOUND)) {
        localStorage.setItem('found', JSON.stringify(game.getFoundItems()));
    }

    if (saveQueue.includes(StoreTypeEnum.STATS)) {
        localStorage.setItem('stats', JSON.stringify(game.getStats()));
    }

    if (saveQueue.includes(StoreTypeEnum.BOARD)) {
        localStorage.setItem('board', JSON.stringify(game.getBoard()));
    }
}

function load() {
    const found = localStorage.getItem('found');
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

function store(...arr) {
    saveQueue.push(...arr);
}

function storeStats() {
    return StoreTypeEnum.STATS
}

function storeFoundItem() {
    return StoreTypeEnum.FOUND
}

function storeBoard() {
    return StoreTypeEnum.BOARD
}

const StoreTypeEnum = {
    BOARD: 'BOARD',
    STATS: 'STATS',
    FOUND: 'FOUND',
}

export {
    init,
    load,
    store,
    storeFoundItem,
    storeStats,
    storeBoard,
    StoreTypeEnum
}