import Events from "@/js/events";

class AlexaWeb extends Events {
    constructor() {
        super();

        this.alexa = null;
        this._openMicAfterSpeech = false;

        this.scheduledSaveMessages = [];
        setInterval(this.onSaveInterval.bind(this), 1750)

        Alexa.create({version: '1.0'})
            .then((args) => {
                const { alexa, message } = args;
                this.alexa = alexa;
                this.init();
                this.processMessage(message['intent'], message)
            })
            .catch(error => {
                console.log(error)
            });
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
}

export default new AlexaWeb();