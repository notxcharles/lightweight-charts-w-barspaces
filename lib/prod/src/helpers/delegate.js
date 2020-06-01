import { __spreadArrays } from "tslib";
// tslint:disable-next-line:invalid-void
var Delegate = /** @class */ (function () {
    function Delegate() {
        this._private__listeners = [];
    }
    Delegate.prototype._internal_subscribe = function (callback, linkedObject, singleshot) {
        var listener = {
            _internal_callback: callback,
            _internal_linkedObject: linkedObject,
            _internal_singleshot: singleshot === true,
        };
        this._private__listeners.push(listener);
    };
    Delegate.prototype._internal_unsubscribe = function (callback) {
        var index = this._private__listeners.findIndex(function (listener) { return callback === listener._internal_callback; });
        if (index > -1) {
            this._private__listeners.splice(index, 1);
        }
    };
    Delegate.prototype._internal_unsubscribeAll = function (linkedObject) {
        this._private__listeners = this._private__listeners.filter(function (listener) { return listener._internal_linkedObject === linkedObject; });
    };
    Delegate.prototype._internal_fire = function (param1, param2) {
        var listenersSnapshot = __spreadArrays(this._private__listeners);
        this._private__listeners = this._private__listeners.filter(function (listener) { return !listener._internal_singleshot; });
        listenersSnapshot.forEach(function (listener) { return listener._internal_callback(param1, param2); });
    };
    Delegate.prototype._internal_hasListeners = function () {
        return this._private__listeners.length > 0;
    };
    Delegate.prototype._internal_destroy = function () {
        this._private__listeners = [];
    };
    return Delegate;
}());
export { Delegate };
