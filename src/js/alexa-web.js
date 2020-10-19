import Events from "@/js/events";

import {
    load,
    store,
    storeAddItems,
    storeBoardClear, storeFoundItem, storeGameReset,
    storeRemoveItems,
    storeStats, storeUpdateItems
} from "@/js/game-store-alexa";
import game from "@/js/game";
import GameEventsEnum from "@/js/game-events";

class AlexaWeb extends Events {
    constructor() {
        super();

        this.alexa = null;
        this._openMicAfterSpeech = false;

        this.scheduledSaveMessages = [];
        setInterval(this.onSaveInterval.bind(this), 1750)
    }

    async create() {
        return new Promise(((resolve, reject) => {
            if (this.alexa) {
                resolve(this.alexa);
                return;
            }

            Alexa.create({version: '1.0'})
                .then((args) => {
                    const { alexa, message } = args;
                    this.alexa = alexa;
                    this.init();
                    this.processMessage(message['intent'], message);

                    resolve(alexa);
                })
                .catch(error => {
                    reject(error)
                });
        }))
    }

    init() {
        this.alexa.skill.onMessage((message) => this.processMessage(message['intent'], message))
        this.alexa.speech.onStopped(() => {
            if (this._openMicAfterSpeech) {
                this._openMicAfterSpeech = false;
                this.openMic();
            }
        });
    }

    openMicAfterSpeech() {
        this._openMicAfterSpeech = true;
        return this;
    }

    processMessage(intent, message) {
        this.emit(intent, message);
    }

    speak(text) {
        this.sendIntent('SpeakMessage', { speak: text });
    }

    speakWithRePrompt(text) {
        this.sendIntent('SpeakMessage', { speak: text, reprompt: text });
    }

    onSaveInterval() {
        if (this.scheduledSaveMessages.length) {
            this.sendIntent('SaveGameMessage', {
                store: this.scheduledSaveMessages
            });

            this.scheduledSaveMessages = [];
        }
    }

    saveGame(message) {
        this.scheduledSaveMessages.push(...message);
    }

    sendIntent(intent, message) {
        // console.log({ intent: intent, ...message })

        if (!this.alexa) {
            return;
        }

        this.alexa.skill.sendMessage({
            intent: intent,
            ...message
        });
    }

    openMic() {
        if (!(this.alexa && this.alexa.capabilities.microphone.supportsWakeWord)) {
            return;
        }

        this.alexa.voice.requestMicrophoneOpen({
            onError: (reason) => {
                console.log("Microphone open error: " + reason);
            }
        });
    }

    setStoreListeners() {
        // Save
        game.on(GameEventsEnum.ITEM_FOUND, items => store(storeFoundItem(items)));
        game.on(GameEventsEnum.ITEM_ADDED   , item => store(storeAddItems([item]), storeStats()));
        game.on(GameEventsEnum.ITEM_REMOVED , (_, index) => store(storeRemoveItems([index])));
        game.on(GameEventsEnum.ITEM_UPDATED, (item, index) => store(storeUpdateItems([{ index, item }])));
        game.on(GameEventsEnum.BOARD_CLEARED, _ => store(storeBoardClear(), storeStats()));
        game.on(GameEventsEnum.GAME_RESET, _ => store(storeGameReset()));
        game.on(GameEventsEnum.FOUND_ALL, _ => store(storeStats()));
    }
}

export default new AlexaWeb();