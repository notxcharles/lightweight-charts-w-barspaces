import { ensureDefined } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
function sortByIndexAsc(a, b) {
    return a.index - b.index;
}
var TickMarks = /** @class */ (function () {
    function TickMarks() {
        this._minIndex = Infinity;
        this._maxIndex = -Infinity;
        // Hash of tick marks
        this._marksByIndex = new Map();
        // Sparse array with ordered arrays of tick marks
        this._marksBySpan = [];
        this._changed = new Delegate();
        this._cache = null;
        this._maxBar = NaN;
    }
    TickMarks.prototype.reset = function () {
        this._marksByIndex.clear();
        this._marksBySpan = [];
        this._minIndex = Infinity;
        this._maxIndex = -Infinity;
        this._cache = null;
        this._changed.fire();
    };
    // tslint:disable-next-line:cyclomatic-complexity
    TickMarks.prototype.merge = function (tickMarks) {
        var marksBySpan = this._marksBySpan;
        var unsortedSpans = {};
        for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
            var tickMark = tickMarks_1[_i];
            var index = tickMark.index;
            var span = tickMark.span;
            var existingTickMark = this._marksByIndex.get(tickMark.index);
            if (existingTickMark) {
                if (existingTickMark.index === tickMark.index && existingTickMark.span === tickMark.span) {
                    // We don't need to do anything, just update time (if it differs)
                    existingTickMark.time = tickMark.time;
                    continue;
                }
                // TickMark exists, but it differs. We need to remove it first
                this._removeTickMark(existingTickMark);
            }
            // Set into hash
            this._marksByIndex.set(index, tickMark);
            if (this._minIndex > index) { // It's not the same as `this.minIndex > index`, mind the NaN
                this._minIndex = index;
            }
            if (this._maxIndex < index) {
                this._maxIndex = index;
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
        this._cache = null;
        this._changed.fire();
    };
    TickMarks.prototype.indexToTime = function (index) {
        var tickMark = this._marksByIndex.get(index);
        if (tickMark === undefined) {
            return null;
        }
        return tickMark.time;
    };
    TickMarks.prototype.nearestIndex = function (time) {
        var left = this._minIndex;
        var right = this._maxIndex;
        while (right - left > 2) {
            if (ensureDefined(this._marksByIndex.get(left)).time.timestamp * 1000 === time) {
                return left;
            }
            if (ensureDefined(this._marksByIndex.get(right)).time.timestamp * 1000 === time) {
                return right;
            }
            var center = Math.round((left + right) / 2);
            if (ensureDefined(this._marksByIndex.get(center)).time.timestamp * 1000 > time) {
                right = center;
            }
            else {
                left = center;
            }
        }
        return left;
    };
    TickMarks.prototype.build = function (spacing, maxWidth) {
        var maxBar = Math.ceil(maxWidth / spacing);
        if (this._maxBar === maxBar && this._cache) {
            return this._cache;
        }
        this._maxBar = maxBar;
        var marks = [];
        for (var span = this._marksBySpan.length; span--;) {
            if (!this._marksBySpan[span]) {
                continue;
            }
            // Built tickMarks are now prevMarks, and marks it as new array
            var prevMarks = marks;
            marks = [];
            var prevMarksLength = prevMarks.length;
            var prevMarksPointer = 0;
            var currentSpan = ensureDefined(this._marksBySpan[span]);
            var currentSpanLength = currentSpan.length;
            var rightIndex = Infinity;
            var leftIndex = -Infinity;
            for (var i = 0; i < currentSpanLength; i++) {
                var mark = currentSpan[i];
                var currentIndex = mark.index;
                // Determine indexes with which current index will be compared
                // All marks to the right is moved to new array
                while (prevMarksPointer < prevMarksLength) {
                    var lastMark = prevMarks[prevMarksPointer];
                    var lastIndex = lastMark.index;
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
        this._cache = marks;
        return this._cache;
    };
    TickMarks.prototype._removeTickMark = function (tickMark) {
        var index = tickMark.index;
        if (this._marksByIndex.get(index) !== tickMark) {
            return;
        }
        this._marksByIndex.delete(index);
        if (index <= this._minIndex) {
            this._minIndex++;
        }
        if (index >= this._maxIndex) {
            this._maxIndex--;
        }
        if (this._maxIndex < this._minIndex) {
            this._minIndex = Infinity;
            this._maxIndex = -Infinity;
        }
        var spanArray = ensureDefined(this._marksBySpan[tickMark.span]);
        var position = spanArray.indexOf(tickMark);
        if (position !== -1) {
            // Keeps array sorted
            spanArray.splice(position, 1);
        }
    };
    return TickMarks;
}());
export { TickMarks };
