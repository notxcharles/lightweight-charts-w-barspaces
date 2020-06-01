import { isNumber } from '../helpers/strict-type-checks';
var PriceRangeImpl = /** @class */ (function () {
    function PriceRangeImpl(minValue, maxValue) {
        this._minValue = minValue;
        this._maxValue = maxValue;
    }
    PriceRangeImpl.prototype.equals = function (pr) {
        if (pr === null) {
            return false;
        }
        return this._minValue === pr._minValue && this._maxValue === pr._maxValue;
    };
    PriceRangeImpl.prototype.clone = function () {
        return new PriceRangeImpl(this._minValue, this._maxValue);
    };
    PriceRangeImpl.prototype.minValue = function () {
        return this._minValue;
    };
    PriceRangeImpl.prototype.setMinValue = function (v) {
        this._minValue = v;
    };
    PriceRangeImpl.prototype.maxValue = function () {
        return this._maxValue;
    };
    PriceRangeImpl.prototype.setMaxValue = function (v) {
        this._maxValue = v;
    };
    PriceRangeImpl.prototype.length = function () {
        return this._maxValue - this._minValue;
    };
    PriceRangeImpl.prototype.isEmpty = function () {
        return this._maxValue === this._minValue || Number.isNaN(this._maxValue) || Number.isNaN(this._minValue);
    };
    PriceRangeImpl.prototype.merge = function (anotherRange) {
        if (anotherRange === null) {
            return this;
        }
        return new PriceRangeImpl(Math.min(this.minValue(), anotherRange.minValue()), Math.max(this.maxValue(), anotherRange.maxValue()));
    };
    PriceRangeImpl.prototype.apply = function (min, max) {
        this._minValue = Math.min(this._minValue, min);
        this._maxValue = Math.max(this._maxValue, max);
    };
    PriceRangeImpl.prototype.set = function (min, max) {
        this._minValue = min;
        this._maxValue = max;
    };
    PriceRangeImpl.prototype.scaleAroundCenter = function (coeff) {
        if (!isNumber(coeff)) {
            return;
        }
        var delta = this._maxValue - this._minValue;
        if (delta === 0) {
            return;
        }
        var center = (this._maxValue + this._minValue) * 0.5;
        var maxDelta = this._maxValue - center;
        var minDelta = this._minValue - center;
        maxDelta *= coeff;
        minDelta *= coeff;
        this._maxValue = center + maxDelta;
        this._minValue = center + minDelta;
    };
    PriceRangeImpl.prototype.shift = function (delta) {
        if (!isNumber(delta)) {
            return;
        }
        this._maxValue += delta;
        this._minValue += delta;
    };
    PriceRangeImpl.prototype.containsStrictly = function (priceRange) {
        return priceRange.minValue() > this._minValue &&
            priceRange.maxValue() < this._maxValue;
    };
    PriceRangeImpl.prototype.toRaw = function () {
        return {
            minValue: this._minValue,
            maxValue: this._maxValue,
        };
    };
    PriceRangeImpl.fromRaw = function (raw) {
        return (raw === null) ? null : new PriceRangeImpl(raw.minValue, raw.maxValue);
    };
    return PriceRangeImpl;
}());
export { PriceRangeImpl };
