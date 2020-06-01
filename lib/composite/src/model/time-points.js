/**
 * This is the collection of time points, that allows to store and find the every time point using it's index.
 */
var TimePoints = /** @class */ (function () {
    function TimePoints() {
        this._items = [];
    }
    TimePoints.prototype.clear = function () {
        this._items = [];
    };
    TimePoints.prototype.size = function () {
        return this._items.length;
    };
    TimePoints.prototype.firstIndex = function () {
        return this._offsetToIndex(0);
    };
    TimePoints.prototype.lastIndex = function () {
        return this._offsetToIndex(this._items.length - 1);
    };
    TimePoints.prototype.merge = function (index, values) {
        if (values.length === 0) {
            return;
        }
        // assume that 'values' contains at least one TimePoint
        if (this._items.length === 0) {
            this._items = values;
            return;
        }
        var start = index;
        if (start < 0) {
            var n = Math.abs(start);
            if (values.length < n) {
                return;
            }
            // tslint:disable-next-line:prefer-array-literal
            this._items = new Array(n).concat(this._items);
            // tslint:disable-next-line:no-shadowed-variable
            for (var i_1 = 0; i_1 < values.length; ++i_1) {
                this._items[index + i_1] = values[i_1];
            }
            return;
        }
        var i = start;
        for (; i < this._items.length && (i - start) < values.length; ++i) {
            this._items[i] = values[i - start];
        }
        var end = start + values.length;
        if (end > this._items.length) {
            var n = end - this._items.length;
            for (var j = i; j < i + n; ++j) {
                this._items.push(values[j - start]);
            }
        }
    };
    TimePoints.prototype.valueAt = function (index) {
        var offset = this._indexToOffset(index);
        if (offset !== null) {
            return this._items[offset];
        }
        return null;
    };
    TimePoints.prototype.indexOf = function (time, findNearest) {
        if (this._items.length < 1) {
            // no time points available
            return null;
        }
        if (time > this._items[this._items.length - 1].timestamp) {
            // special case
            return findNearest ? this._items.length - 1 : null;
        }
        for (var i = 0; i < this._items.length; ++i) {
            if (time === this._items[i].timestamp) {
                return i;
            }
            if (time < this._items[i].timestamp) {
                return findNearest ? i : null;
            }
        }
        // in fact, this code is unreachable because we already
        // have special case for time > this._items[this._items.length - 1]
        return null;
    };
    TimePoints.prototype.closestIndexLeft = function (time) {
        var items = this._items;
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
    TimePoints.prototype._offsetToIndex = function (offset) {
        if (0 <= offset && offset < this.size()) {
            return offset;
        }
        return null;
    };
    TimePoints.prototype._indexToOffset = function (index) {
        if (0 <= index && index < this.size()) {
            return index;
        }
        return null;
    };
    return TimePoints;
}());
export { TimePoints };
