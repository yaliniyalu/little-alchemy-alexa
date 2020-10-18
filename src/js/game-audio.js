

/*const audioItemFound = new Audio(require('@/assets/audio/item_found.mp3'));
const audioItemCreated = new Audio(require('@/assets/audio/item_created.mp3'));
const audioMergeFailed = new Audio(require('@/assets/audio/merge_failed.mp3'));*/

async function play(id) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(require(`@/assets/audio/${id}.mp3`));
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', () => reject());
        audio.play().catch(e => reject(e))
    })
}

const GameAudioIdEnum = {
    ITEM_FOUND: 'item_found',
    ITEM_CREATED: 'item_created',
    MERGE_FAILED: 'merge_failed',
    APPLAUSE: 'applause'
}


export {
    play,
    GameAudioIdEnum
}