import { __spreadArrays } from "tslib";
// tslint:disable-next-line:invalid-void
var Delegate = /** @class */ (function () {
    function Delegate() {
        this._listeners = [];
    }
    Delegate.prototype.subscribe = function (callback, linkedObject, singleshot) {
        var listener = {
            callback: callback,
            linkedObject: linkedObject,
            singleshot: singleshot === true,
        };
        this._listeners.push(listener);
    };
    Delegate.prototype.unsubscribe = function (callback) {
        var index = this._listeners.findIndex(function (listener) { return callback === listener.callback; });
        if (index > -1) {
            this._listeners.splice(index, 1);
        }
    };
    Delegate.prototype.unsubscribeAll = function (linkedObject) {
        this._listeners = this._listeners.filter(function (listener) { return listener.linkedObject === linkedObject; });
    };
    Delegate.prototype.fire = function (param1, param2) {
        var listenersSnapshot = __spreadArrays(this._listeners);
        this._listeners = this._listeners.filter(function (listener) { return !listener.singleshot; });
        listenersSnapshot.forEach(function (listener) { return listener.callback(param1, param2); });
    };
    Delegate.prototype.hasListeners = function () {
        return this._listeners.length > 0;
    };
    Delegate.prototype.destroy = function () {
        this._listeners = [];
    };
    return Delegate;
}());
export { Delegate };
