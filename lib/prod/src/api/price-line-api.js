var PriceLine = /** @class */ (function () {
    function PriceLine(priceLine) {
        this._private__priceLine = priceLine;
    }
    PriceLine.prototype.applyOptions = function (options) {
        this._private__priceLine._internal_applyOptions(options);
    };
    PriceLine.prototype.options = function () {
        return this._private__priceLine._internal_options();
    };
    PriceLine.prototype._internal_priceLine = function () {
        return this._private__priceLine;
    };
    return PriceLine;
}());
export { PriceLine };
