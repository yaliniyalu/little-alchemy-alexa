<template>
    <div class="item" @mousedown="$emit('mousedown', $event)">
        <img class="image" :src="require(`./../assets/img/${item}.png`)" :alt="item">
        <span class="name" v-if="displayName">{{ item }}</span>
    </div>
</template>

<script>
export default {
    name: "Item",
    props: {
        item: {
            type: String,
            required: true
        },
        displayName: {
            type: Boolean,
            default: true
        }
    }
}
</script>

<style lang="scss">
.item {
    padding: 5px;
    text-align: center;
    width: 50px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    transition: transform .2s;
    cursor: pointer;

    /*&:hover {
        transform: scale(1.2);
    }*/

    .image {
        width: 100%;
        pointer-events: none;
    }

    .name {
        color: var(--primary-color);
        margin-top: 5px;
        pointer-events: none;
    }
}
</style>