<template>
    <div class="game" v-recognizer:pan.start="onPanStart" v-recognizer:pan.move="onPanMove" v-recognizer:pan.end="onPanEnd" v-recognizer:pan.cancel="onPanCancel">
        <div class="board-container" ref="boardContainer">
            <Board :items="boardItems" ref="board" @show-help="showHelp" @show-stats="showStats" @action-reset-game="resetGame" @action-clear-board="clearBoard" />
        </div>
        <div class="items-panel-container">
            <ItemsPanel :items="foundItems" ref="itemsPanel"/>
        </div>
        <Item
            :style="{position: 'absolute', left: dragItem.x + 'px', top:dragItem.y + 'px', 'z-index': dragItem.zIndex }"
            :item="dragItem.item"
            v-if="dragItem && dragItem.item"

            :display-name="false"
        />

        <v-dialog />
    </div>
</template>

<script>
import game from "@/js/game";
import GameEventsEnum from "@/js/game-events"
import alexaWeb from "@/js/alexa-web";

import ItemsPanel from "@/components/ItemsPanel";
import Board from "@/components/Board";
import Item from "@/components/Item";

import { cloneDeep } from 'lodash'
import {
    load,
    store,
    storeAddItems,
    storeBoardClear, storeFoundItem, storeGameReset,
    storeRemoveItems,
    storeStats, storeUpdateItems
} from "@/js/game-store-alexa";
import {play, GameAudioIdEnum} from "@/js/game-audio";
import {
    BOARD_CLEARED_SPEECH, CLEAR_BOARD_SPEECH,
    CLEAR_BOARD_TEXT, GAME_RESET_SPEECH, HELP_SPEECH,
    HELP_TEXT, ITEM_FOUND_TEXT, RESET_GAME_SPEECH,
    RESET_GAME_TEXT,
    STATS_TEXT, WIN_SPEECH,
    WIN_TEXT
} from "@/js/const-text";

export default {
    name: "Game",
    components: {Item, Board, ItemsPanel},
    data() {
        return {
            foundItems: [],
            boardItems: [],

            dragItem: null,
            boardBounds: null,

            openedDialog: null,

            itemBounds: {
                width: 60,
                height: 60
            }
        }
    },

    methods: {
        onPanStart(e) {
            const target = e.target;

            if (target.classList.contains('item')) {
                const rect = target.getBoundingClientRect();
                const item = target.getAttribute('data-item');
                const index = target.getAttribute('data-board-item');

                this.dragItem = {
                    item: item,
                    index: index !== null ? parseInt(index) : null,
                    x: rect.left,
                    y: rect.top,
                    centerX: (rect.width / 2),
                    centerY: (rect.height / 2),
                    origX: rect.left,
                    origY: rect.top,
                    zIndex: 5
                }

                if (index) {
                    const item = this.boardItems[index];
                    this.$set(item, 'zIndex', 5)
                }
            }
        },
        onPanMove(e) {
            if (!this.dragItem) {
                return;
            }

            const item = (this.dragItem.index !== null) ? this.boardItems[this.dragItem.index] : this.dragItem;
            item.x = e.center.x - this.dragItem.centerX;
            item.y = e.center.y - this.dragItem.centerY;
        },

        onPanCancel() {
            if (!this.dragItem) {
                return;
            }

            if (this.dragItem.index === null) {
                this.dragItem = null;
                return;
            }

            const item = this.boardItems[this.dragItem.index];
            item.x = this.dragItem.origX;
            item.y = this.dragItem.origY;
            delete item.zIndex;
            this.dragItem = null;
        },

        onPanEnd(e) {
            if (!this.dragItem) {
                return;
            }

            this.onPanMove(e);

            // if not inside board bounds
            if (!((e.center.x >= this.boardBounds.x && e.center.x <= this.boardBounds.right) &&
                (e.center.y >= this.boardBounds.y && e.center.y <= this.boardBounds.bottom))) {
                return this.onPanCancel(e);
            }

            const x = e.center.x - this.dragItem.centerX;
            const y = e.center.y - this.dragItem.centerY;

            if (this.$refs.board.isDeletable({ x1: x, y1: y, x2: x + 60, y2: y + 60 })) {
                game.removeFromBoard(this.dragItem.index);
                this.dragItem = null;
                return;
            }

            if (this.dragItem.index === null) {
                this.dragItem.index = game.addToBoard(this.dragItem.item,  x, y);
            }
            else {
                game.updateBoardItem(this.dragItem.index, this.dragItem.item, x, y)
            }

            const item = this.boardItems[this.dragItem.index];
            const rect = { x1: x + 15, y1: y + 15, x2: x + 35, y2: y + 35 };

            this.boardItems.some((value, index) => {
                if (index === this.dragItem.index) {
                    return false;
                }

                const rect2 = { x1: value.x, x2: value.x + 60, y1: value.y, y2: value.y + 60}

                if (this.overlaps(rect2, rect)) {
                    this.merge(index, this.dragItem.index);
                    return true;
                }
                return false;
            });

            delete item.zIndex;
            this.dragItem = null;
        },

        overlaps(a, b) {
            return (a.x1 < b.x2) && (a.x2 > b.x1) && (a.y1 < b.y2) && (a.y2 > b.y1);
        },

        merge(x, y) {
            const item1 = this.boardItems[x];
            const item2 = this.boardItems[y];

            const items = game.merge(item1.item, item2.item);

            if (!items) {
                const elItem = document.querySelector(`[data-board-item="${y}"]`);

                if (!elItem) return;
                const fn = () => {
                    elItem.removeEventListener('animationend', fn)
                    elItem.classList.remove('shake-animation');
                }

                elItem.addEventListener('animationend', fn)
                elItem.classList.add('shake-animation');

                return;
            }

            let inX = (items.length/2) * 25;

            items.forEach(v => {
                game.addToBoard(v.item, item1.x + inX, item1.y);
                inX -= 25;
            });

            if (y > x) {
                [x, y] = [y, x];
            }

            game.removeFromBoard(x);
            game.removeFromBoard(y);
        },

        onWindowResize() {
            this.boardBounds = this.$refs.boardContainer.getBoundingClientRect();
            this.$refs.itemsPanel.resize();
            this.$refs.board.resize();
        },

        prepareStage() {
            this.foundItems = game.getFoundItems().slice();
            this.boardItems = cloneDeep(game.getBoard());
        },

        closeOpenedDialog() {
            this.openedDialog = null;
            this.$modal.hide('dialog')
        },

        showHelp() {
            alexaWeb.speak(HELP_SPEECH);
            this.openedDialog = 'help';
            this.$modal.show('dialog', {
                title: 'Help',
                text: HELP_TEXT,
                buttons: [
                    {
                        title: 'Close',
                        handler: () => {
                            this.closeOpenedDialog()
                        }
                    }
                ]
            })
        },

        showStats() {
            const text = STATS_TEXT({ foundItems: game.getFoundItems().length, totalItems: game.getTotalItems() });
            alexaWeb.speak(text);

            this.openedDialog = 'stats';
            this.$modal.show('dialog', {
                title: 'Progress',
                text: text,
                buttons: [
                    {
                        title: 'Close',
                        handler: () => this.closeOpenedDialog()
                    }
                ]
            })
        },

        showWin() {
            alexaWeb.speak(WIN_SPEECH);
            this.openedDialog = 'won';
            this.$modal.show('dialog', {
                title: 'Congratulations',
                text: WIN_TEXT,
                buttons: [
                    {
                        title: 'Close',
                        handler: () => this.closeOpenedDialog()
                    }
                ]
            })
        },

        resetGame() {
            alexaWeb
                .openMicAfterSpeech()
                .speakWithRePrompt(RESET_GAME_SPEECH);

            this.openedDialog = 'reset-game';

            this.$modal.show('dialog', {
                title: 'Reset Game?',
                text: RESET_GAME_TEXT,
                buttons: [
                    {
                        title: 'No',
                        handler: () => this.closeOpenedDialog()
                    },
                    {
                        title: 'Yes',
                        handler: () => {
                            game.reset();
                            this.closeOpenedDialog();
                        }
                    }
                ]
            })
        },

        clearBoard() {
            alexaWeb
                .openMicAfterSpeech()
                .speakWithRePrompt(CLEAR_BOARD_SPEECH);

            this.openedDialog = 'clear-board';

            this.$modal.show('dialog', {
                title: 'Clear Board?',
                text: CLEAR_BOARD_TEXT,
                buttons: [
                    {
                        title: 'No',
                        handler: () => this.closeOpenedDialog()
                    },
                    {
                        title: 'Yes',
                        handler: () => {
                            game.clearBoard();
                            this.closeOpenedDialog();
                        }
                    }
                ]
            })
        },
    },

    mounted() {
        window.addEventListener("resize", this.onWindowResize);
        this.onWindowResize();

        game.on(GameEventsEnum.ITEM_ADDED, item => this.boardItems.push(item));
        game.on(GameEventsEnum.ITEM_REMOVED, (_, index) => this.boardItems.splice(index, 1));
        game.on(GameEventsEnum.BOARD_CLEARED, _ => this.boardItems = []);
        game.on(GameEventsEnum.ITEM_FOUND, item => this.foundItems.push(...item));
        game.on(GameEventsEnum.FOUND_ALL, _ => this.showWin());
        game.on(GameEventsEnum.GAME_RESET, _ => this.prepareStage());

        // Sound Effects
        game.on(GameEventsEnum.MERGE_FAILED, _ => play(GameAudioIdEnum.MERGE_FAILED));
        game.on(GameEventsEnum.FOUND_ALL, _ => play(GameAudioIdEnum.APPLAUSE));
        game.on(GameEventsEnum.MERGE_COMPLETED, (items, newItems) => newItems.length ? play(GameAudioIdEnum.ITEM_FOUND) : play(GameAudioIdEnum.ITEM_CREATED));

        // Save
        game.on(GameEventsEnum.ITEM_FOUND, items => store(storeFoundItem(items)));
        game.on(GameEventsEnum.ITEM_ADDED   , item => store(storeAddItems([item]), storeStats()));
        game.on(GameEventsEnum.ITEM_REMOVED , (_, index) => store(storeRemoveItems([index])));
        game.on(GameEventsEnum.ITEM_UPDATED, (item, index) => store(storeUpdateItems([{ index, item }])));
        game.on(GameEventsEnum.BOARD_CLEARED, _ => store(storeBoardClear(), storeStats()));
        game.on(GameEventsEnum.GAME_RESET, _ => store(storeGameReset()));
        game.on(GameEventsEnum.FOUND_ALL, _ => store(storeStats()));

        this.prepareStage();

        alexaWeb.on('MergeItems', ({ items }) => {
            const found = game.getFoundItems();

            if (found.indexOf(items[0]) === -1) {
                alexaWeb.speak(`${items[0]} is unavailable yet`);
                return;
            }

            if (found.indexOf(items[1]) === -1) {
                alexaWeb.speak(`${items[1]} is unavailable yet`);
                return
            }

            const created = game.merge(items[0], items[1]);

            if (!created) {
                alexaWeb.speak(`Cannot merge ${items[0]} and ${items[1]}`);
            }
            else {
                if (!created.find(e => e.type === 'new')) {
                    const i = [];
                    created.forEach(v => i.push(v.item));
                    alexaWeb.speak(`Merging ${items[0]} and ${items[1]} Created ${i.length} item.`);
                }
            }
        });

        alexaWeb.on('LoadGame', (message) => load(message.store));
        alexaWeb.on('ClearBoard', () => this.clearBoard());
        alexaWeb.on('ResetGame', () => this.resetGame());
        alexaWeb.on('GameStats', () => this.showStats());
        alexaWeb.on('Help', () => this.showHelp());
        alexaWeb.on('Close Cancel No', () => {
            if (this.openedDialog) {
                this.closeOpenedDialog();
            }
        });
        alexaWeb.on('Yes', () => {
            switch (this.openedDialog) {
                case 'clear-board':
                    game.clearBoard();
                    break;

                case 'reset-game':
                    game.reset();
                    break;
            }
            this.closeOpenedDialog();
        })

        // Speech
        game.on(GameEventsEnum.BOARD_CLEARED, _ => alexaWeb.speak(BOARD_CLEARED_SPEECH));
        game.on(GameEventsEnum.ITEM_FOUND, items => alexaWeb.speak(ITEM_FOUND_TEXT(items)));
        game.on(GameEventsEnum.GAME_RESET, _ => alexaWeb.speak(GAME_RESET_SPEECH));

        window.emulate = message => {
            alexaWeb.processMessage(message['intent'], message)
        }
    },

    destroyed() {
        window.removeEventListener("resize", this.onWindowResize);
    }
}
</script>

<style lang="scss" scoped>

.game {
    padding: 5px;
    display: flex;
    height: calc(100vh - 10px);
    width: calc(100vw - 10px);
    user-select: none;

    .board-container {
        width: 70%;
    }

    .items-panel-container {
        width: 30%;
    }
}
</style>