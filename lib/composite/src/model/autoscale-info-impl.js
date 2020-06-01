import { PriceRangeImpl } from './price-range-impl';
var AutoscaleInfoImpl = /** @class */ (function () {
    function AutoscaleInfoImpl(priceRange, margins) {
        this._priceRange = priceRange;
        this._margins = margins || null;
    }
    AutoscaleInfoImpl.prototype.priceRange = function () {
        return this._priceRange;
    };
    AutoscaleInfoImpl.prototype.margins = function () {
        return this._margins;
    };
    AutoscaleInfoImpl.prototype.toRaw = function () {
        if (this._priceRange === null) {
            return null;
        }
        return {
            priceRange: this._priceRange.toRaw(),
            margins: this._margins || undefined,
        };
    };
    AutoscaleInfoImpl.fromRaw = function (raw) {
        return (raw === null) ? null : new AutoscaleInfoImpl(PriceRangeImpl.fromRaw(raw.priceRange), raw.margins);
    };
    return AutoscaleInfoImpl;
}());
export { AutoscaleInfoImpl };
