import { PriceRangeImpl } from './price-range-impl';
var AutoscaleInfoImpl = /** @class */ (function () {
    function AutoscaleInfoImpl(priceRange, margins) {
        this._private__priceRange = priceRange;
        this._private__margins = margins || null;
    }
    AutoscaleInfoImpl.prototype._internal_priceRange = function () {
        return this._private__priceRange;
    };
    AutoscaleInfoImpl.prototype._internal_margins = function () {
        return this._private__margins;
    };
    AutoscaleInfoImpl.prototype._internal_toRaw = function () {
        if (this._private__priceRange === null) {
            return null;
        }
        return {
            priceRange: this._private__priceRange._internal_toRaw(),
            margins: this._private__margins || undefined,
        };
    };
    AutoscaleInfoImpl._internal_fromRaw = function (raw) {
        return (raw === null) ? null : new AutoscaleInfoImpl(PriceRangeImpl._internal_fromRaw(raw.priceRange), raw.margins);
    };
    return AutoscaleInfoImpl;
}());
export { AutoscaleInfoImpl };
