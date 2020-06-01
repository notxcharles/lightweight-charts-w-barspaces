import { assert } from '../helpers/assertions';
var RangeImpl = /** @class */ (function () {
    function RangeImpl(left, right) {
        assert(left <= right, 'right should be >= left');
        this._left = left;
        this._right = right;
    }
    RangeImpl.prototype.left = function () {
        return this._left;
    };
    RangeImpl.prototype.right = function () {
        return this._right;
    };
    RangeImpl.prototype.count = function () {
        return this._right - this._left + 1;
    };
    RangeImpl.prototype.contains = function (index) {
        return this._left <= index && index <= this._right;
    };
    RangeImpl.prototype.equals = function (other) {
        return this._left === other.left() && this._right === other.right();
    };
    return RangeImpl;
}());
export { RangeImpl };
export function areRangesEqual(first, second) {
    if (first === null || second === null) {
        return first === second;
    }
    return first.equals(second);
}
