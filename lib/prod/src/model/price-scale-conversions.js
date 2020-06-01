import { log10 } from '../helpers/mathex';
import { PriceRangeImpl } from './price-range-impl';
;
export function fromPercent(value, baseValue) {
    if (baseValue < 0) {
        value = -value;
    }
    return (value / 100) * baseValue + baseValue;
}
export function toPercent(value, baseValue) {
    var result = 100 * (value - baseValue) / baseValue;
    return (baseValue < 0 ? -result : result);
}
export function toPercentRange(priceRange, baseValue) {
    var minPercent = toPercent(priceRange._internal_minValue(), baseValue);
    var maxPercent = toPercent(priceRange._internal_maxValue(), baseValue);
    return new PriceRangeImpl(minPercent, maxPercent);
}
export function fromIndexedTo100(value, baseValue) {
    value -= 100;
    if (baseValue < 0) {
        value = -value;
    }
    return (value / 100) * baseValue + baseValue;
}
export function toIndexedTo100(value, baseValue) {
    var result = 100 * (value - baseValue) / baseValue + 100;
    return (baseValue < 0 ? -result : result);
}
export function toIndexedTo100Range(priceRange, baseValue) {
    var minPercent = toIndexedTo100(priceRange._internal_minValue(), baseValue);
    var maxPercent = toIndexedTo100(priceRange._internal_maxValue(), baseValue);
    return new PriceRangeImpl(minPercent, maxPercent);
}
export function toLog(price) {
    var m = Math.abs(price);
    if (m < 1e-8) {
        return 0;
    }
    var res = log10(m + 0.0001 /* CoordOffset */) + 4 /* LogicalOffset */;
    return ((price < 0) ? -res : res);
}
export function fromLog(logical) {
    var m = Math.abs(logical);
    if (m < 1e-8) {
        return 0;
    }
    var res = Math.pow(10, m - 4 /* LogicalOffset */) - 0.0001 /* CoordOffset */;
    return (logical < 0) ? -res : res;
}
export function convertPriceRangeToLog(priceRange) {
    if (priceRange === null) {
        return null;
    }
    var min = toLog(priceRange._internal_minValue());
    var max = toLog(priceRange._internal_maxValue());
    return new PriceRangeImpl(min, max);
}
export function canConvertPriceRangeFromLog(priceRange) {
    if (priceRange === null) {
        return false;
    }
    var min = fromLog(priceRange._internal_minValue());
    var max = fromLog(priceRange._internal_maxValue());
    return isFinite(min) && isFinite(max);
}
export function convertPriceRangeFromLog(priceRange) {
    if (priceRange === null) {
        return null;
    }
    var min = fromLog(priceRange._internal_minValue());
    var max = fromLog(priceRange._internal_maxValue());
    return new PriceRangeImpl(min, max);
}
