
import {allItemsCount, combine, initialItems} from './recipies'
import Events from "@/js/events";
import GameEventsEnum from "@/js/game-events"

class Game extends Events {
    constructor() {
        super();

        this.foundItems = initialItems();
        this.board = [];

        this.totalItems = allItemsCount();

        this.stats = {
            allItemsFound: false,
            lastId: 0
        }
    }

    getFoundItems() {
        return this.foundItems;
    }

    getBoard() {
        return this.board;
    }

    getStats() {
        return this.stats;
    }

    setFoundItems(items) {
        this.foundItems = items;
    }

    setBoard(board) {
        this.board = board;
    }

    setStats(stats) {
        this.stats = stats;
    }

    getTotalItems() {
        return this.totalItems;
    }

    addToBoard(item, x, y) {
        const id = ++ this.stats.lastId;
        this.board.push({ id, item, x, y});
        const index = this.board.length - 1;

        this.emit(GameEventsEnum.ITEM_ADDED, { id, item, x, y}, index);
        return index;
    }

    removeFromBoard(index) {
        const item = this.board.splice(index, 1);

        this.emit(GameEventsEnum.ITEM_REMOVED, item, index)
    }

    updateBoardItem(index, item, x, y) {
        const id = this.board[index].id;
        this.board[index] = { id, item, x, y };

        this.emit(GameEventsEnum.ITEM_UPDATED, { id, item, x, y }, index)
    }

    clearBoard() {
        this.board = [];
        this.stats.lastId = 0;

        this.emit(GameEventsEnum.BOARD_CLEARED)
    }

    reset() {
        this.board = [];
        this.stats.lastId = 0;
        this.foundItems = initialItems();
        this.stats.allItemsFound = false;

        this.emit(GameEventsEnum.GAME_RESET)
    }

    merge(item1, item2) {
        const createdItems = combine(item1, item2);
        if (!createdItems) {
            this.emit(GameEventsEnum.MERGE_FAILED, item1, item2);
            return null;
        }

        let items = [];

        let newItems = [];

        createdItems.forEach(v => {
            if (this.foundItems.indexOf(v) === -1) {
                this.foundItems.push(v);

                items.push({ type: 'new', item: v});
                newItems.push(v);
            }
            else {
                items.push({ type: 'existing', item: v});
            }
        });

        if (newItems.length) {
            this.emit(GameEventsEnum.ITEM_FOUND, newItems);
        }

        this.emit(GameEventsEnum.ITEM_CREATED, createdItems);

        this.emit(GameEventsEnum.MERGE_COMPLETED, items, newItems);

        if (this.totalItems <= this.foundItems.length && !this.stats.allItemsFound) {
            this.stats.allItemsFound = true;
            this.emit(GameEventsEnum.FOUND_ALL);
        }

        return items
    }
}

export default new Game();