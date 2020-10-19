const _HELP_TEXT = `The right panel contains the items you found.
You can drag the items from right panel to the board and try to merge with other items.
Merging items create new items.
To remove the item from board drag the item to x mark.
Pressing the x button clears the board.
You start with 4 items and Your goal is the find all items. Good Luck.`;

const STATS_TEXT = (stats) => `You have found ${stats['foundItems']} out of ${stats['totalItems']} items`;

const HELP_TEXT = `${_HELP_TEXT}
<br>
<br>“Sound effects obtained from <a href='https://www.zapsplat.com'>zapsplat.com</a>“
<br>“white icons PNG Designed By flat**** from <a href="https://pngtree.com/">Pngtree.com</a>“`

const RESET_GAME_TEXT = `All game progress will be cleared. Do you want to reset the game?`;
const CLEAR_BOARD_TEXT = `Do you want to clear the board?`;
const WIN_TEXT = `Congratulations, You found all items. Now you can reset the game and start over.`;

const ITEM_FOUND_TEXT = (items) => {
    if (items.length === 1) {
        return `You have found ${items[0]}`;
    }
    else {
        return `You have found ${items.length} new items. ${items.reduce((a, b, i, r) => a + (i < r.length - 1 ? ', ' : ' and ') + b)}.`;
    }
}

const BOARD_CLEARED_SPEECH = "Board Cleared";
const GAME_RESET_SPEECH = "Your progress has been deleted."
const WIN_SPEECH  = `<amazon:emotion name="excited" intensity="medium">Congratulations, You found all items.</amazon:emotion> <break time="3s"/> Now you can reset the game and start over.`;
const CLEAR_BOARD_SPEECH  = CLEAR_BOARD_TEXT;
const RESET_GAME_SPEECH  = RESET_GAME_TEXT;
const HELP_SPEECH  = `<amazon:domain name="long-form">${_HELP_TEXT}</amazon:domain>`;

export {
    HELP_TEXT,
    STATS_TEXT,
    ITEM_FOUND_TEXT,
    WIN_TEXT,
    RESET_GAME_TEXT,
    CLEAR_BOARD_TEXT,

    BOARD_CLEARED_SPEECH,
    GAME_RESET_SPEECH,
    WIN_SPEECH,
    CLEAR_BOARD_SPEECH,
    RESET_GAME_SPEECH,
    HELP_SPEECH
}