<template>
    <div id="board" ref="board" >
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
            removeBtnBounds: null,
            removeBtnActive: false,
        }
    },

    methods: {
        resize() {
            this.removeBtnBounds = this.$refs.removeBtn.getBoundingClientRect();
        },

        isDeletable(rect) {
            const s = this.removeBtnBounds;
            const r = { x1: s.left, x2: s.right, y1: s.top, y2: s.bottom };
            return this.overlaps(rect, r);
        },

        overlaps(a, b) {
            return (a.x1 < b.x2) && (a.x2 > b.x1) && (a.y1 < b.y2) && (a.y2 > b.y1);
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

    &.active, &:hover {
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