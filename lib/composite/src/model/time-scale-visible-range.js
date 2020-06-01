import { RangeImpl } from './range-impl';
var TimeScaleVisibleRange = /** @class */ (function () {
    function TimeScaleVisibleRange(logicalRange) {
        this._logicalRange = logicalRange;
    }
    TimeScaleVisibleRange.prototype.strictRange = function () {
        if (this._logicalRange === null) {
            return null;
        }
        return new RangeImpl(Math.floor(this._logicalRange.left()), Math.ceil(this._logicalRange.right()));
    };
    TimeScaleVisibleRange.prototype.logicalRange = function () {
        return this._logicalRange;
    };
    TimeScaleVisibleRange.prototype.isValid = function () {
        return this._logicalRange !== null;
    };
    TimeScaleVisibleRange.invalid = function () {
        return new TimeScaleVisibleRange(null);
    };
    return TimeScaleVisibleRange;
}());
export { TimeScaleVisibleRange };
