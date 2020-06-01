export function clamp(value, minVal, maxVal) {
    return Math.min(Math.max(value, minVal), maxVal);
}
export function isBaseDecimal(value) {
    if (value < 0) {
        return false;
    }
    for (var current = value; current > 1; current /= 10) {
        if ((current % 10) !== 0) {
            return false;
        }
    }
    return true;
}
export function greaterOrEqual(x1, x2, epsilon) {
    return (x2 - x1) <= epsilon;
}
export function equal(x1, x2, epsilon) {
    return Math.abs(x1 - x2) < epsilon;
}
export function log10(x) {
    if (x <= 0) {
        return NaN;
    }
    return Math.log(x) / Math.log(10);
}
export function min(arr) {
    if (arr.length < 1) {
        throw Error('array is empty');
    }
    var minVal = arr[0];
    for (var i = 1; i < arr.length; ++i) {
        if (arr[i] < minVal) {
            minVal = arr[i];
        }
    }
    return minVal;
}
export function ceiledEven(x) {
    var ceiled = Math.ceil(x);
    return (ceiled % 2 !== 0) ? ceiled - 1 : ceiled;
}
export function ceiledOdd(x) {
    var ceiled = Math.ceil(x);
    return (ceiled % 2 === 0) ? ceiled - 1 : ceiled;
}
