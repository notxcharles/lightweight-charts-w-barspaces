/**
 * This is the collection of time points, that allows to store and find the every time point using it's index.
 */
var TimePoints = /** @class */ (function () {
    function TimePoints() {
        this._private__items = [];
    }
    TimePoints.prototype._internal_clear = function () {
        this._private__items = [];
    };
    TimePoints.prototype._internal_size = function () {
        return this._private__items.length;
    };
    TimePoints.prototype._internal_firstIndex = function () {
        return this._private__offsetToIndex(0);
    };
    TimePoints.prototype._internal_lastIndex = function () {
        return this._private__offsetToIndex(this._private__items.length - 1);
    };
    TimePoints.prototype._internal_merge = function (index, values) {
        if (values.length === 0) {
            return;
        }
        // assume that 'values' contains at least one TimePoint
        if (this._private__items.length === 0) {
            this._private__items = values;
            return;
        }
        var start = index;
        if (start < 0) {
            var n = Math.abs(start);
            if (values.length < n) {
                return;
            }
            // tslint:disable-next-line:prefer-array-literal
            this._private__items = new Array(n).concat(this._private__items);
            // tslint:disable-next-line:no-shadowed-variable
            for (var i_1 = 0; i_1 < values.length; ++i_1) {
                this._private__items[index + i_1] = values[i_1];
            }
            return;
        }
        var i = start;
        for (; i < this._private__items.length && (i - start) < values.length; ++i) {
            this._private__items[i] = values[i - start];
        }
        var end = start + values.length;
        if (end > this._private__items.length) {
            var n = end - this._private__items.length;
            for (var j = i; j < i + n; ++j) {
                this._private__items.push(values[j - start]);
            }
        }
    };
    TimePoints.prototype._internal_valueAt = function (index) {
        var offset = this._private__indexToOffset(index);
        if (offset !== null) {
            return this._private__items[offset];
        }
        return null;
    };
    TimePoints.prototype._internal_indexOf = function (time, findNearest) {
        if (this._private__items.length < 1) {
            // no time points available
            return null;
        }
        if (time > this._private__items[this._private__items.length - 1].timestamp) {
            // special case
            return findNearest ? this._private__items.length - 1 : null;
        }
        for (var i = 0; i < this._private__items.length; ++i) {
            if (time === this._private__items[i].timestamp) {
                return i;
            }
            if (time < this._private__items[i].timestamp) {
                return findNearest ? i : null;
            }
        }
        // in fact, this code is unreachable because we already
        // have special case for time > this._items[this._items.length - 1]
        return null;
    };
    TimePoints.prototype._internal_closestIndexLeft = function (time) {
        var items = this._private__items;
        if (!items.length) {
            return null;
        }
        if (Number.isNaN(time.timestamp)) {
            return null;
        }
        var maxOffset = items.length - 1;
        var maxTime = items[maxOffset];
        if (time >= maxTime) {
            return maxOffset;
        }
        var minOffset = 0;
        var minTime = items[minOffset];
        if (time < minTime) {
            return null;
        }
        else if (time === minTime) {
            return minOffset;
        }
        // binary search
        while (maxOffset > minOffset + 1) {
            var testOffset = (minOffset + maxOffset) >> 1;
            var testValue = items[testOffset];
            if (testValue.timestamp > time.timestamp) {
                maxOffset = testOffset;
            }
            else if (testValue.timestamp < time.timestamp) {
                minOffset = testOffset;
            }
            else if (testValue.timestamp === time.timestamp) {
                return testOffset;
            }
            else {
                return null;
            }
        }
        return minOffset;
    };
    TimePoints.prototype._private__offsetToIndex = function (offset) {
        if (0 <= offset && offset < this._internal_size()) {
            return offset;
        }
        return null;
    };
    TimePoints.prototype._private__indexToOffset = function (index) {
        if (0 <= index && index < this._internal_size()) {
            return index;
        }
        return null;
    };
    return TimePoints;
}());
export { TimePoints };
