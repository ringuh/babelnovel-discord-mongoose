
import { config } from "../models";

declare global {
    interface Array<T> {
        last(): T;
    }
}

Object.defineProperty(Array.prototype, 'last', {
    value: function() {
        if (!this.length) return null
        return this.slice(-1)[0]
    },
    enumerable: false
})