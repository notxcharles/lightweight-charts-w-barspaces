import { ensureDefined } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
function sortByIndexAsc(a, b) {
    return a._internal_index - b._internal_index;
}
var TickMarks = /** @class */ (function () {
    function TickMarks() {
        this._private__minIndex = Infinity;
        this._private__maxIndex = -Infinity;
        // Hash of tick marks
        this._private__marksByIndex = new Map();
        // Sparse array with ordered arrays of tick marks
        this._private__marksBySpan = [];
        this._private__changed = new Delegate();
        this._private__cache = null;
        this._private__maxBar = NaN;
    }
    TickMarks.prototype._internal_reset = function () {
        this._private__marksByIndex.clear();
        this._private__marksBySpan = [];
        this._private__minIndex = Infinity;
        this._private__maxIndex = -Infinity;
        this._private__cache = null;
        this._private__changed._internal_fire();
    };
    // tslint:disable-next-line:cyclomatic-complexity
    TickMarks.prototype._internal_merge = function (tickMarks) {
        var marksBySpan = this._private__marksBySpan;
        var unsortedSpans = {};
        for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
            var tickMark = tickMarks_1[_i];
            var index = tickMark._internal_index;
            var span = tickMark._internal_span;
            var existingTickMark = this._private__marksByIndex.get(tickMark._internal_index);
            if (existingTickMark) {
                if (existingTickMark._internal_index === tickMark._internal_index && existingTickMark._internal_span === tickMark._internal_span) {
                    // We don't need to do anything, just update time (if it differs)
                    existingTickMark._internal_time = tickMark._internal_time;
                    continue;
                }
                // TickMark exists, but it differs. We need to remove it first
                this._private__removeTickMark(existingTickMark);
            }
            // Set into hash
            this._private__marksByIndex.set(index, tickMark);
            if (this._private__minIndex > index) { // It's not the same as `this.minIndex > index`, mind the NaN
                this._private__minIndex = index;
            }
            if (this._private__maxIndex < index) {
                this._private__maxIndex = index;
            }
            // Store it in span arrays
            var marks = marksBySpan[span];
            if (marks === undefined) {
                marks = [];
                marksBySpan[span] = marks;
            }
            marks.push(tickMark);
            unsortedSpans[span] = true;
        }
        // Clean up and sort arrays
        for (var span = marksBySpan.length; span--;) {
            var marks = marksBySpan[span];
            if (marks === undefined) {
                continue;
            }
            if (marks.length === 0) {
                delete marksBySpan[span];
            }
            if (unsortedSpans[span]) {
                marks.sort(sortByIndexAsc);
            }
        }
        this._private__cache = null;
        this._private__changed._internal_fire();
    };
    TickMarks.prototype._internal_indexToTime = function (index) {
        var tickMark = this._private__marksByIndex.get(index);
        if (tickMark === undefined) {
            return null;
        }
        return tickMark._internal_time;
    };
    TickMarks.prototype._internal_nearestIndex = function (time) {
        var left = this._private__minIndex;
        var right = this._private__maxIndex;
        while (right - left > 2) {
            if (ensureDefined(this._private__marksByIndex.get(left))._internal_time.timestamp * 1000 === time) {
                return left;
            }
            if (ensureDefined(this._private__marksByIndex.get(right))._internal_time.timestamp * 1000 === time) {
                return right;
            }
            var center = Math.round((left + right) / 2);
            if (ensureDefined(this._private__marksByIndex.get(center))._internal_time.timestamp * 1000 > time) {
                right = center;
            }
            else {
                left = center;
            }
        }
        return left;
    };
    TickMarks.prototype._internal_build = function (spacing, maxWidth) {
        var maxBar = Math.ceil(maxWidth / spacing);
        if (this._private__maxBar === maxBar && this._private__cache) {
            return this._private__cache;
        }
        this._private__maxBar = maxBar;
        var marks = [];
        for (var span = this._private__marksBySpan.length; span--;) {
            if (!this._private__marksBySpan[span]) {
                continue;
            }
            // Built tickMarks are now prevMarks, and marks it as new array
            var prevMarks = marks;
            marks = [];
            var prevMarksLength = prevMarks.length;
            var prevMarksPointer = 0;
            var currentSpan = ensureDefined(this._private__marksBySpan[span]);
            var currentSpanLength = currentSpan.length;
            var rightIndex = Infinity;
            var leftIndex = -Infinity;
            for (var i = 0; i < currentSpanLength; i++) {
                var mark = currentSpan[i];
                var currentIndex = mark._internal_index;
                // Determine indexes with which current index will be compared
                // All marks to the right is moved to new array
                while (prevMarksPointer < prevMarksLength) {
                    var lastMark = prevMarks[prevMarksPointer];
                    var lastIndex = lastMark._internal_index;
                    if (lastIndex < currentIndex) {
                        prevMarksPointer++;
                        marks.push(lastMark);
                        leftIndex = lastIndex;
                        rightIndex = Infinity;
                    }
                    else {
                        rightIndex = lastIndex;
                        break;
                    }
                }
                if (rightIndex - currentIndex >= maxBar && currentIndex - leftIndex >= maxBar) {
                    // TickMark fits. Place it into new array
                    marks.push(mark);
                    leftIndex = currentIndex;
                }
            }
            // Place all unused tickMarks into new array;
            for (; prevMarksPointer < prevMarksLength; prevMarksPointer++) {
                marks.push(prevMarks[prevMarksPointer]);
            }
        }
        this._private__cache = marks;
        return this._private__cache;
    };
    TickMarks.prototype._private__removeTickMark = function (tickMark) {
        var index = tickMark._internal_index;
        if (this._private__marksByIndex.get(index) !== tickMark) {
            return;
        }
        this._private__marksByIndex.delete(index);
        if (index <= this._private__minIndex) {
            this._private__minIndex++;
        }
        if (index >= this._private__maxIndex) {
            this._private__maxIndex--;
        }
        if (this._private__maxIndex < this._private__minIndex) {
            this._private__minIndex = Infinity;
            this._private__maxIndex = -Infinity;
        }
        var spanArray = ensureDefined(this._private__marksBySpan[tickMark._internal_span]);
        var position = spanArray.indexOf(tickMark);
        if (position !== -1) {
            // Keeps array sorted
            spanArray.splice(position, 1);
        }
    };
    return TickMarks;
}());
export { TickMarks };
