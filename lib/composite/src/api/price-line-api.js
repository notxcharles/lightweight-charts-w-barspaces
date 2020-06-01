var PriceLine = /** @class */ (function () {
    function PriceLine(priceLine) {
        this._priceLine = priceLine;
    }
    PriceLine.prototype.applyOptions = function (options) {
        this._priceLine.applyOptions(options);
    };
    PriceLine.prototype.options = function () {
        return this._priceLine.options();
    };
    PriceLine.prototype.priceLine = function () {
        return this._priceLine;
    };
    return PriceLine;
}());
export { PriceLine };
