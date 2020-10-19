<template>
    <div class="game" @mousemove="itemDrag" @mouseup="itemDragFinish">
        <div class="board-container" ref="boardContainer">
            <Board :items="boardItems" ref="board" @show-help="showHelp" @show-stats="showStats" @action-reset-game="resetGame" @action-clear-board="clearBoard" />
        </div>
        <div class="items-panel-container">
            <ItemsPanel :items="foundItems" @drag-start="itemDragStart" @drag-cancel="itemDragCancel" ref="itemsPanel"/>
        </div>
        <Item
            :style="{position: 'absolute', left: dragItem.left + 'px', top:dragItem.top + 'px', 'z-index': dragItem.zIndex }"
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

            openedDialog: null
        }
    },

    methods: {
        itemDragStart(e, item) {
            const position = e.target.getBoundingClientRect();
            this.dragItem = {
                item: item,
                left: position.left,
                top: position.top,
                x: e.x - position.left,
                y: e.y - position.top,
                zIndex: 5
            }
        },

        itemDragCancel() {
            this.dragItem = null;
        },

        itemDrag(e) {
            if (!this.dragItem) {
                return;
            }

            this.dragItem.left = e.x - this.dragItem.x;
            this.dragItem.top = e.y - this.dragItem.y;
        },

        itemDragFinish(e) {
            if (!this.dragItem) {
                this.cancelDrags();
                return;
            }

            if ((e.x >= this.boardBounds.x && e.x <= this.boardBounds.right) &&
                (e.y >= this.boardBounds.y && e.y <= this.boardBounds.bottom)) {
                this.$refs.board.addItem(this.dragItem.item, e.x - this.dragItem.x, e.y - this.dragItem.y, e.x, e.y)
            }

            this.dragItem = null;
        },

        onWindowResize() {
            this.boardBounds = this.$refs.boardContainer.getBoundingClientRect();
            this.$refs.itemsPanel.resize();
            this.$refs.board.resize();
        },

        cancelDrags() {
            this.dragItem = null;
            this.$refs.board.dragCancel();
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

        document.body.addEventListener('onmouseup', this.cancelDrags);

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
        document.body.removeEventListener('onmouseup', this.cancelDrags)
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