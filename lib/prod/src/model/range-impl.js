import { assert } from '../helpers/assertions';
var RangeImpl = /** @class */ (function () {
    function RangeImpl(left, right) {
        assert(left <= right, 'right should be >= left');
        this._private__left = left;
        this._private__right = right;
    }
    RangeImpl.prototype._internal_left = function () {
        return this._private__left;
    };
    RangeImpl.prototype._internal_right = function () {
        return this._private__right;
    };
    RangeImpl.prototype._internal_count = function () {
        return this._private__right - this._private__left + 1;
    };
    RangeImpl.prototype._internal_contains = function (index) {
        return this._private__left <= index && index <= this._private__right;
    };
    RangeImpl.prototype._internal_equals = function (other) {
        return this._private__left === other._internal_left() && this._private__right === other._internal_right();
    };
    return RangeImpl;
}());
export { RangeImpl };
export function areRangesEqual(first, second) {
    if (first === null || second === null) {
        return first === second;
    }
    return first._internal_equals(second);
}
