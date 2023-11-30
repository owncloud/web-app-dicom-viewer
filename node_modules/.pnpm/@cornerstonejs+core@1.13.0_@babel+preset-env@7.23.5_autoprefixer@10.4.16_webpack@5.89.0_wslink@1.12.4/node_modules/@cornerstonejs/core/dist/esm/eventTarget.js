class CornerstoneEventTarget {
    constructor() {
        this.listeners = {};
    }
    reset() {
        this.listeners = {};
    }
    addEventListener(type, callback) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        if (this.listeners[type].indexOf(callback) !== -1) {
            return;
        }
        this.listeners[type].push(callback);
    }
    removeEventListener(type, callback) {
        if (!this.listeners[type]) {
            return;
        }
        const stack = this.listeners[type];
        const stackLength = stack.length;
        for (let i = 0; i < stackLength; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }
    dispatchEvent(event) {
        if (!this.listeners[event.type]) {
            return;
        }
        const stack = this.listeners[event.type].slice();
        const stackLength = stack.length;
        for (let i = 0; i < stackLength; i++) {
            stack[i].call(this, event);
        }
        return !event.defaultPrevented;
    }
}
const eventTarget = new CornerstoneEventTarget();
export default eventTarget;
//# sourceMappingURL=eventTarget.js.map