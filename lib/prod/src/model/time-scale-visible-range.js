import { RangeImpl } from './range-impl';
var TimeScaleVisibleRange = /** @class */ (function () {
    function TimeScaleVisibleRange(logicalRange) {
        this._private__logicalRange = logicalRange;
    }
    TimeScaleVisibleRange.prototype._internal_strictRange = function () {
        if (this._private__logicalRange === null) {
            return null;
        }
        return new RangeImpl(Math.floor(this._private__logicalRange._internal_left()), Math.ceil(this._private__logicalRange._internal_right()));
    };
    TimeScaleVisibleRange.prototype._internal_logicalRange = function () {
        return this._private__logicalRange;
    };
    TimeScaleVisibleRange.prototype._internal_isValid = function () {
        return this._private__logicalRange !== null;
    };
    TimeScaleVisibleRange._internal_invalid = function () {
        return new TimeScaleVisibleRange(null);
    };
    return TimeScaleVisibleRange;
}());
export { TimeScaleVisibleRange };
