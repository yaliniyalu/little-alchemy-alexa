import game from "@/js/game";
import alexaWeb from "@/js/alexa-web";


function load(store) {
    const found = store.found;
    if (found) {
        game.setFoundItems(found);
    }

    const board = store.board;
    if (board) {
        game.setBoard(board);
    }

    const stats = store.stats;
    if (stats) {
        game.setStats(stats);
    }
}


function store(...arr) {
    alexaWeb.saveGame(arr);
}

function storeStats() {
    return {
        type: StoreTypeEnum.GAME_STATS,
        stats: game.getStats()
    }
}

function storeFoundItem(items) {
    return {
        type: StoreTypeEnum.ITEM_FOUND,
        items: items
    }
}

function storeBoardClear() {
    return {
        type: StoreTypeEnum.BOARD_CLEAR
    }
}

function storeGameReset() {
    return {
        type: StoreTypeEnum.GAME_RESET
    }
}

function storeAddItems(items) {
    return {
        type: StoreTypeEnum.BOARD_ADD_ITEMS,
        items: items
    }
}

function storeRemoveItems(items) {
    return {
        type: StoreTypeEnum.BOARD_REMOVE_ITEMS,
        items: items
    }
}

function storeUpdateItems(items) {
    return {
        type: StoreTypeEnum.BOARD_UPDATE_ITEMS,
        items: items
    }
}

const StoreTypeEnum = {
    BOARD_ADD_ITEMS: 'BOARD::ADD_ITEMS',
    BOARD_REMOVE_ITEMS: 'BOARD::REMOVE_ITEMS',
    BOARD_UPDATE_ITEMS: 'BOARD::UPDATE_ITEMS',
    BOARD_CLEAR: 'BOARD::CLEAR',
    ITEM_FOUND: 'ITEM::FOUND',
    GAME_STATS: 'GAME::STATS',
    GAME_RESET: 'GAME::RESET'
}

export {
    load,
    store,
    storeAddItems,
    storeRemoveItems,
    storeFoundItem,
    storeUpdateItems,
    storeBoardClear,
    storeStats,
    storeGameReset,
    StoreTypeEnum
}