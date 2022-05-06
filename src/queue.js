// :(
/** 
    * one day I'll fix this
*/ 


class ActionQueue {
    #pendingActions;
    #timeToWait;
    constructor() {
        this.#pendingActions = []
        this.#timeToWait = 0
    }

    setTimeout(time) {
        this.#timeToWait = time;
    }

    getTimeout() {
        return this.#timeToWait;
    }

    size() {
        return this.#pendingActions.length
    }

    empty() {
        return (this.#pendingActions.length == 0)
    }

    performNextAction() {
        const actionToPerform = this.#pendingActions[0];
        this.#pendingActions.shift()
        actionToPerform()
    }

    addAction( action ) {
        this.#pendingActions.push( action )
    }

}

exports.ActionQueue = ActionQueue; 