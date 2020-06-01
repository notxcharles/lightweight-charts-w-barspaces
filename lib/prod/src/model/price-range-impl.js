import { isNumber } from '../helpers/strict-type-checks';
var PriceRangeImpl = /** @class */ (function () {
    function PriceRangeImpl(minValue, maxValue) {
        this._private__minValue = minValue;
        this._private__maxValue = maxValue;
    }
    PriceRangeImpl.prototype._internal_equals = function (pr) {
        if (pr === null) {
            return false;
        }
        return this._private__minValue === pr._private__minValue && this._private__maxValue === pr._private__maxValue;
    };
    PriceRangeImpl.prototype._internal_clone = function () {
        return new PriceRangeImpl(this._private__minValue, this._private__maxValue);
    };
    PriceRangeImpl.prototype._internal_minValue = function () {
        return this._private__minValue;
    };
    PriceRangeImpl.prototype._internal_setMinValue = function (v) {
        this._private__minValue = v;
    };
    PriceRangeImpl.prototype._internal_maxValue = function () {
        return this._private__maxValue;
    };
    PriceRangeImpl.prototype._internal_setMaxValue = function (v) {
        this._private__maxValue = v;
    };
    PriceRangeImpl.prototype._internal_length = function () {
        return this._private__maxValue - this._private__minValue;
    };
    PriceRangeImpl.prototype._internal_isEmpty = function () {
        return this._private__maxValue === this._private__minValue || Number.isNaN(this._private__maxValue) || Number.isNaN(this._private__minValue);
    };
    PriceRangeImpl.prototype._internal_merge = function (anotherRange) {
        if (anotherRange === null) {
            return this;
        }
        return new PriceRangeImpl(Math.min(this._internal_minValue(), anotherRange._internal_minValue()), Math.max(this._internal_maxValue(), anotherRange._internal_maxValue()));
    };
    PriceRangeImpl.prototype._internal_apply = function (min, max) {
        this._private__minValue = Math.min(this._private__minValue, min);
        this._private__maxValue = Math.max(this._private__maxValue, max);
    };
    PriceRangeImpl.prototype._internal_set = function (min, max) {
        this._private__minValue = min;
        this._private__maxValue = max;
    };
    PriceRangeImpl.prototype._internal_scaleAroundCenter = function (coeff) {
        if (!isNumber(coeff)) {
            return;
        }
        var delta = this._private__maxValue - this._private__minValue;
        if (delta === 0) {
            return;
        }
        var center = (this._private__maxValue + this._private__minValue) * 0.5;
        var maxDelta = this._private__maxValue - center;
        var minDelta = this._private__minValue - center;
        maxDelta *= coeff;
        minDelta *= coeff;
        this._private__maxValue = center + maxDelta;
        this._private__minValue = center + minDelta;
    };
    PriceRangeImpl.prototype._internal_shift = function (delta) {
        if (!isNumber(delta)) {
            return;
        }
        this._private__maxValue += delta;
        this._private__minValue += delta;
    };
    PriceRangeImpl.prototype._internal_containsStrictly = function (priceRange) {
        return priceRange._internal_minValue() > this._private__minValue &&
            priceRange._internal_maxValue() < this._private__maxValue;
    };
    PriceRangeImpl.prototype._internal_toRaw = function () {
        return {
            minValue: this._private__minValue,
            maxValue: this._private__maxValue,
        };
    };
    PriceRangeImpl._internal_fromRaw = function (raw) {
        return (raw === null) ? null : new PriceRangeImpl(raw.minValue, raw.maxValue);
    };
    return PriceRangeImpl;
}());
export { PriceRangeImpl };
