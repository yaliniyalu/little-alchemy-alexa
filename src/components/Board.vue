<template>
    <div id="board" ref="board" @mousemove="onDrag" @mouseup="dragFinish">
        <div id="btn-remove" :class="{ active: removeBtnActive }" ref="removeBtn" @click="$emit('action-clear-board')">
            <font-awesome-icon icon="times" />
        </div>
        <div id="btn-help" class="btn" ref="helpBtn" @click="$emit('show-help')">
            <font-awesome-icon icon="question" size="2x" fixed-width />
            <i>Help</i>
        </div>
        <div id="btn-stats" class="btn" ref="statsBtn" @click="$emit('show-stats')">
            <font-awesome-icon icon="chart-line" size="2x" fixed-width />
            <i>Stats</i>
        </div>
        <div id="btn-reset" class="btn" ref="resetBtn" @click="$emit('action-reset-game')">
            <font-awesome-icon icon="redo-alt" size="2x" fixed-width />
            <i>Reset</i>
        </div>
        <transition-group name="fade">
        <Item
            :style="{ position: 'absolute', left: item.x + 'px', top: item.y + 'px', 'z-index': item.zIndex ? item.zIndex : 1 }"
            v-for="(item, index) in items"
            :item="item.item"
            :display-name="false"
            :key="item.id"
            @mousedown.stop="dragStart($event, index)"
            :data-board-item="index"
        />
        </transition-group>
    </div>
</template>

<script>
import Item from "@/components/Item";
import game from "@/js/game";
export default {
    name: "Board",
    components: {Item},
    props: {
        items: {
            type: Array,
            required: true
        }
    },

    data() {
        return {
            dragItem: null,
            myBounds: null,
            removeBtnBounds: null,
            removeBtnActive: false,
            itemBounds: {
                width: 60,
                height: 60
            }
        }
    },

    methods: {
        dragStart(e, index) {
            const item = this.items[index];

            this.dragItem = {
                itemIndex: index,
                origX: item.x,
                origY: item.y,
                mx: e.x - item.x,
                my: e.y - item.y
            };

            this.$set(item, 'zIndex', 5)
        },

        dragFinish(e) {
            if (!this.dragItem) {
                return;
            }

            e.stopPropagation();

            const item = this.items[this.dragItem.itemIndex];

            if ((e.x >= this.removeBtnBounds.x && e.x <= this.removeBtnBounds.right) &&
                (e.y >= this.removeBtnBounds.y && e.y <= this.removeBtnBounds.bottom)) {
                this.removeBtnActive = false;
                game.removeFromBoard(this.dragItem.itemIndex);
            }
            else {
                game.updateBoardItem(this.dragItem.itemIndex, item['item'], item.x, item.y)
                this.items.some((value, index) => {
                    if (index === this.dragItem.itemIndex) {
                        return false;
                    }

                    if (e.x >= value.x && e.x <= (value.x + this.itemBounds.width) && e.y >= value.y && e.y <= (value.y + this.itemBounds.height)) {
                        this.merge(index, this.dragItem.itemIndex);
                        return true;
                    }
                    return false;
                });
            }

            delete item.zIndex;
            this.dragItem = null;
        },

        onDrag(e) {
            if (!this.dragItem) {
                return;
            }
            e.stopPropagation();

            if ((e.x >= this.myBounds.x && e.x <= this.myBounds.right) &&
                (e.y >= this.myBounds.y && e.y <= this.myBounds.bottom)) {
                const item = this.items[this.dragItem.itemIndex];
                item.x = e.x - this.dragItem.mx;
                item.y = e.y - this.dragItem.my;

                if ((e.x >= this.removeBtnBounds.x && e.x <= this.removeBtnBounds.right) &&
                    (e.y >= this.removeBtnBounds.y && e.y <= this.removeBtnBounds.bottom)) {
                    this.removeBtnActive = true;
                    return;
                }
            }

            this.removeBtnActive = false;
        },

        addItem(item, x, y, mx, my) {
            const i = game.addToBoard(item, x, y);

            this.items.some((value, index) => {
                if (index === i) {
                    return false;
                }

                if (mx >= value.x && mx <= (value.x + this.itemBounds.width) && my >= value.y && my <= (value.y + this.itemBounds.height)) {
                    this.merge(index, i);
                    return true;
                }
                return false;
            });
        },

        resize() {
            this.myBounds = this.$refs.board.getBoundingClientRect();
            this.removeBtnBounds = this.$refs.removeBtn.getBoundingClientRect();
        },

        dragCancel() {
            if (!this.dragItem) {
                return;
            }

            const item = this.items[this.dragItem.itemIndex];
            item.x = this.dragItem.origX;
            item.y = this.dragItem.origY;
            delete item.zIndex;

            this.dragItem = null;
        },

        merge(x, y) {
            const item1 = this.items[x];
            const item2 = this.items[y];

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
    },

    mounted() {
        this.resize();
    }
}
</script>

<style lang="scss">
#board {
    border: 1px solid var(--primary-color);
    border-radius: 5px;
    height: 100%;
    position: relative;

    .btn {
        padding: 10px 4px;
        display: table;
        cursor: pointer;
        color: var(--primary-color);

        i {
            display: block;
            text-align: center;
            font-size: 12px;
        }
    }
}

#btn-remove {
    position: absolute;
    right: 0;
    padding: 5px 10px;
    font-size: 35px;
    color: #808080;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;

    &.active {
        color: #b71c1c;
    }
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}

/* Standard syntax */
@keyframes shake {
    10%, 90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%, 80% {
        transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
        transform: translate3d(4px, 0, 0);
    }
}

.shake-animation {
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
}

</style>