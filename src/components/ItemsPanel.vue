<template>
    <div id="items-panel" ref="itemsPanel">
        <vue-scroll :ops="scrollOptions">
            <div class="items" v-for="i in rowCount">
                <item :item="item" v-for="item in itemCountInRow(i)" :key="item" :data-item="item" />
            </div>
        </vue-scroll>
    </div>
</template>

<script>
import Item from "@/components/Item";
export default {
    name: "ItemsPanel",
    components: {Item},
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            itemsPerRow: 3,
            scrollOptions: {
                vuescroll: {
                    mode: 'native'
                },
                scrollPanel: {
                    scrollingX: false,
                    easing: 'easeInQuad'
                },
                rail: {},
                bar: {
                    background: 'var(--primary-color)'
                }
            }
        }
    },
    computed:{
        rowCount() {
            return Math.ceil(this.items.length / this.itemsPerRow);
        },
    },
    methods:{
        itemCountInRow:function(index){
            return this.items.slice((index - 1) * this.itemsPerRow, index * this.itemsPerRow)
        },

        resize() {
            const panelWidth = this.$refs.itemsPanel.offsetWidth;
            const itemWidth = 60;
            this.itemsPerRow = Math.floor(panelWidth / itemWidth);
        }
    }
}
</script>

<style lang="scss">
#items-panel {
    border: 1px solid var(--primary-color);
    border-radius: 5px;
    height: 100%;
    overflow: hidden;

    .items {
        display: flex;
        flex-direction: row;
        align-content: normal;
        justify-content: space-evenly;

        &:last-child {
            justify-content: space-evenly;
        }
    }
}
</style>