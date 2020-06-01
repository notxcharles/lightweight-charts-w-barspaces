import { lowerbound, upperbound } from '../helpers/algorithms';
import { assert, ensureNotNull } from '../helpers/assertions';
export var PlotRowSearchMode;
(function (PlotRowSearchMode) {
    PlotRowSearchMode[PlotRowSearchMode["NearestLeft"] = -1] = "NearestLeft";
    PlotRowSearchMode[PlotRowSearchMode["Exact"] = 0] = "Exact";
    PlotRowSearchMode[PlotRowSearchMode["NearestRight"] = 1] = "NearestRight";
})(PlotRowSearchMode || (PlotRowSearchMode = {}));
// TODO: think about changing it dynamically
var CHUNK_SIZE = 30;
/**
 * PlotList is an array of plot rows
 * each plot row consists of key (index in timescale) and plot value map
 */
var PlotList = /** @class */ (function () {
    function PlotList(plotFunctions, emptyValuePredicate) {
        if (plotFunctions === void 0) { plotFunctions = null; }
        if (emptyValuePredicate === void 0) { emptyValuePredicate = null; }
        // TODO: should be renamed to _rows, but the current name is frozen because of myriads of references to it
        this._items = [];
        // some PlotList instances are just readonly views of sub-range of data stored in another PlotList
        // _start and _end fields are used to implement such views
        this._start = 0;
        // end is an after-last index
        this._end = 0;
        this._shareRead = false;
        this._minMaxCache = new Map();
        this._rowSearchCache = new Map();
        this._rowSearchCacheWithoutEmptyValues = new Map();
        this._plotFunctions = plotFunctions || new Map();
        this._emptyValuePredicate = emptyValuePredicate;
    }
    PlotList.prototype.clear = function () {
        this._items = [];
        this._start = 0;
        this._end = 0;
        this._shareRead = false;
        this._minMaxCache.clear();
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
    };
    // @returns First row
    PlotList.prototype.first = function () {
        return this.size() > 0 ? this._items[this._start] : null;
    };
    // @returns Last row
    PlotList.prototype.last = function () {
        return this.size() > 0 ? this._items[(this._end - 1)] : null;
    };
    PlotList.prototype.firstIndex = function () {
        return this.size() > 0 ? this._indexAt(this._start) : null;
    };
    PlotList.prototype.lastIndex = function () {
        return this.size() > 0 ? this._indexAt((this._end - 1)) : null;
    };
    PlotList.prototype.size = function () {
        return this._end - this._start;
    };
    PlotList.prototype.isEmpty = function () {
        return this.size() === 0;
    };
    PlotList.prototype.contains = function (index) {
        return this._search(index, 0 /* Exact */) !== null;
    };
    PlotList.prototype.valueAt = function (index) {
        return this.search(index);
    };
    /**
     * @returns true if new index is added or false if existing index is updated
     */
    PlotList.prototype.add = function (index, time, value) {
        if (this._shareRead) {
            return false;
        }
        var row = { index: index, value: value, time: time };
        var pos = this._search(index, 0 /* Exact */);
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
        if (pos === null) {
            this._items.splice(this._lowerbound(index), 0, row);
            this._start = 0;
            this._end = this._items.length;
            return true;
        }
        else {
            this._items[pos] = row;
            return false;
        }
    };
    PlotList.prototype.search = function (index, searchMode, skipEmptyValues) {
        if (searchMode === void 0) { searchMode = 0 /* Exact */; }
        var pos = this._search(index, searchMode, skipEmptyValues);
        if (pos === null) {
            return null;
        }
        var item = this._valueAt(pos);
        return {
            index: this._indexAt(pos),
            time: item.time,
            value: item.value,
        };
    };
    /**
     * Execute fun on each element.
     * Stops iteration if callback function returns true.
     * @param fun - Callback function on each element function(index, value): boolean
     */
    PlotList.prototype.each = function (fun) {
        for (var i = this._start; i < this._end; ++i) {
            var index = this._indexAt(i);
            var item = this._valueAt(i);
            if (fun(index, item)) {
                break;
            }
        }
    };
    /**
     * @returns Readonly collection of elements in range
     */
    PlotList.prototype.range = function (start, end) {
        var copy = new PlotList(this._plotFunctions, this._emptyValuePredicate);
        copy._items = this._items;
        copy._start = this._lowerbound(start);
        copy._end = this._upperbound(end);
        copy._shareRead = true;
        return copy;
    };
    PlotList.prototype.minMaxOnRangeCached = function (start, end, plots) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this.isEmpty()) {
            return null;
        }
        var result = null;
        for (var _i = 0, plots_1 = plots; _i < plots_1.length; _i++) {
            var plot = plots_1[_i];
            var plotMinMax = this._minMaxOnRangeCachedImpl(start, end, plot);
            result = mergeMinMax(result, plotMinMax);
        }
        return result;
    };
    PlotList.prototype.merge = function (plotRows) {
        if (this._shareRead) {
            return null;
        }
        if (plotRows.length === 0) {
            return null;
        }
        // if we get a bunch of history - just prepend it
        if (this.isEmpty() || plotRows[plotRows.length - 1].index < this._items[0].index) {
            return this._prepend(plotRows);
        }
        // if we get new rows - just append it
        if (plotRows[0].index > this._items[this._items.length - 1].index) {
            return this._append(plotRows);
        }
        // if we get update for the last row - just replace it
        if (plotRows.length === 1 && plotRows[0].index === this._items[this._items.length - 1].index) {
            this._updateLast(plotRows[0]);
            return plotRows[0];
        }
        return this._merge(plotRows);
    };
    PlotList.prototype.remove = function (start) {
        if (this._shareRead) {
            return null;
        }
        var startOffset = this._search(start, 1 /* NearestRight */);
        if (startOffset === null) {
            return null;
        }
        var removedPlotRows = this._items.splice(startOffset);
        // _start should never be modified in this method
        this._end = this._items.length;
        this._minMaxCache.clear();
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
        return removedPlotRows.length > 0 ? removedPlotRows[0] : null;
    };
    PlotList.prototype._indexAt = function (offset) {
        return this._items[offset].index;
    };
    PlotList.prototype._valueAt = function (offset) {
        return this._items[offset];
    };
    PlotList.prototype._search = function (index, searchMode, skipEmptyValues) {
        var exactPos = this._bsearch(index);
        if (exactPos === null && searchMode !== 0 /* Exact */) {
            switch (searchMode) {
                case -1 /* NearestLeft */:
                    return this._searchNearestLeft(index, skipEmptyValues);
                case 1 /* NearestRight */:
                    return this._searchNearestRight(index, skipEmptyValues);
                default:
                    throw new TypeError('Unknown search mode');
            }
        }
        // there is a found value or search mode is Exact
        if (!skipEmptyValues || exactPos === null || searchMode === 0 /* Exact */) {
            return exactPos;
        }
        // skipEmptyValues is true, additionally check for emptiness
        switch (searchMode) {
            case -1 /* NearestLeft */:
                return this._nonEmptyNearestLeft(exactPos);
            case 1 /* NearestRight */:
                return this._nonEmptyNearestRight(exactPos);
            default:
                throw new TypeError('Unknown search mode');
        }
    };
    PlotList.prototype._nonEmptyNearestRight = function (index) {
        var predicate = ensureNotNull(this._emptyValuePredicate);
        while (index < this._end && predicate(this._valueAt(index).value)) {
            index = index + 1;
        }
        return index === this._end ? null : index;
    };
    PlotList.prototype._nonEmptyNearestLeft = function (index) {
        var predicate = ensureNotNull(this._emptyValuePredicate);
        while (index >= this._start && predicate(this._valueAt(index).value)) {
            index = index - 1;
        }
        return index < this._start ? null : index;
    };
    PlotList.prototype._searchNearestLeft = function (index, skipEmptyValues) {
        var nearestLeftPos = this._lowerbound(index);
        if (nearestLeftPos > this._start) {
            nearestLeftPos = nearestLeftPos - 1;
        }
        var result = (nearestLeftPos !== this._end && this._indexAt(nearestLeftPos) < index) ? nearestLeftPos : null;
        if (skipEmptyValues && result !== null) {
            return this._nonEmptyNearestLeft(result);
        }
        return result;
    };
    PlotList.prototype._searchNearestRight = function (index, skipEmptyValues) {
        var nearestRightPos = this._upperbound(index);
        var result = (nearestRightPos !== this._end && index < this._indexAt(nearestRightPos)) ? nearestRightPos : null;
        if (skipEmptyValues && result !== null) {
            return this._nonEmptyNearestRight(result);
        }
        return result;
    };
    PlotList.prototype._bsearch = function (index) {
        var start = this._lowerbound(index);
        if (start !== this._end && !(index < this._items[start].index)) {
            return start;
        }
        return null;
    };
    PlotList.prototype._lowerbound = function (index) {
        return lowerbound(this._items, index, function (a, b) { return a.index < b; }, this._start, this._end);
    };
    PlotList.prototype._upperbound = function (index) {
        return upperbound(this._items, index, function (a, b) { return b.index > a; }, this._start, this._end);
    };
    /**
     * @param endIndex - Non-inclusive end
     */
    PlotList.prototype._plotMinMax = function (startIndex, endIndex, plot) {
        var result = null;
        var func = this._plotFunctions.get(plot.name);
        if (func === undefined) {
            throw new Error("Plot \"" + plot.name + "\" is not registered");
        }
        for (var i = startIndex; i < endIndex; i++) {
            var values = this._items[i].value;
            var v = func(values);
            if (v === undefined || v === null || Number.isNaN(v)) {
                continue;
            }
            if (result === null) {
                result = { min: v, max: v };
            }
            else {
                if (v < result.min) {
                    result.min = v;
                }
                if (v > result.max) {
                    result.max = v;
                }
            }
        }
        return result;
    };
    PlotList.prototype._invalidateCacheForRow = function (row) {
        var chunkIndex = Math.floor(row.index / CHUNK_SIZE);
        this._minMaxCache.forEach(function (cacheItem) { return cacheItem.delete(chunkIndex); });
    };
    PlotList.prototype._prepend = function (plotRows) {
        assert(!this._shareRead, 'collection should not be readonly');
        assert(plotRows.length !== 0, 'plotRows should not be empty');
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
        this._minMaxCache.clear();
        this._items = plotRows.concat(this._items);
        this._start = 0;
        this._end = this._items.length;
        return plotRows[0];
    };
    PlotList.prototype._append = function (plotRows) {
        assert(!this._shareRead, 'collection should not be readonly');
        assert(plotRows.length !== 0, 'plotRows should not be empty');
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
        this._minMaxCache.clear();
        this._items = this._items.concat(plotRows);
        this._start = 0;
        this._end = this._items.length;
        return plotRows[0];
    };
    PlotList.prototype._updateLast = function (plotRow) {
        assert(!this.isEmpty(), 'plot list should not be empty');
        var currentLastRow = this._items[this._end - 1];
        assert(currentLastRow.index === plotRow.index, 'last row index should match new row index');
        this._invalidateCacheForRow(plotRow);
        this._rowSearchCache.delete(plotRow.index);
        this._rowSearchCacheWithoutEmptyValues.delete(plotRow.index);
        this._items[this._end - 1] = plotRow;
    };
    PlotList.prototype._merge = function (plotRows) {
        assert(plotRows.length !== 0, 'plot rows should not be empty');
        this._rowSearchCache.clear();
        this._rowSearchCacheWithoutEmptyValues.clear();
        this._minMaxCache.clear();
        this._items = mergePlotRows(this._items, plotRows);
        this._start = 0;
        this._end = this._items.length;
        return plotRows[0];
    };
    PlotList.prototype._minMaxOnRangeCachedImpl = function (start, end, plotInfo) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this.isEmpty()) {
            return null;
        }
        var result = null;
        // assume that bar indexes only increase
        var firstIndex = ensureNotNull(this.firstIndex());
        var lastIndex = ensureNotNull(this.lastIndex());
        var s = start - plotInfo.offset;
        var e = end - plotInfo.offset;
        s = Math.max(s, firstIndex);
        e = Math.min(e, lastIndex);
        var cachedLow = Math.ceil(s / CHUNK_SIZE) * CHUNK_SIZE;
        var cachedHigh = Math.max(cachedLow, Math.floor(e / CHUNK_SIZE) * CHUNK_SIZE);
        {
            var startIndex = this._lowerbound(s);
            var endIndex = this._upperbound(Math.min(e, cachedLow, end)); // non-inclusive end
            var plotMinMax = this._plotMinMax(startIndex, endIndex, plotInfo);
            result = mergeMinMax(result, plotMinMax);
        }
        var minMaxCache = this._minMaxCache.get(plotInfo.name);
        if (minMaxCache === undefined) {
            minMaxCache = new Map();
            this._minMaxCache.set(plotInfo.name, minMaxCache);
        }
        // now go cached
        for (var c = Math.max(cachedLow + 1, s); c < cachedHigh; c += CHUNK_SIZE) {
            var chunkIndex = Math.floor(c / CHUNK_SIZE);
            var chunkMinMax = minMaxCache.get(chunkIndex);
            if (chunkMinMax === undefined) {
                var chunkStart = this._lowerbound(chunkIndex * CHUNK_SIZE);
                var chunkEnd = this._upperbound((chunkIndex + 1) * CHUNK_SIZE - 1);
                chunkMinMax = this._plotMinMax(chunkStart, chunkEnd, plotInfo);
                minMaxCache.set(chunkIndex, chunkMinMax);
            }
            result = mergeMinMax(result, chunkMinMax);
        }
        // tail
        {
            var startIndex = this._lowerbound(cachedHigh);
            var endIndex = this._upperbound(e); // non-inclusive end
            var plotMinMax = this._plotMinMax(startIndex, endIndex, plotInfo);
            result = mergeMinMax(result, plotMinMax);
        }
        return result;
    };
    return PlotList;
}());
export { PlotList };
export function mergeMinMax(first, second) {
    if (first === null) {
        return second;
    }
    else {
        if (second === null) {
            return first;
        }
        else {
            // merge MinMax values
            var min = Math.min(first.min, second.min);
            var max = Math.max(first.max, second.max);
            return { min: min, max: max };
        }
    }
}
/**
 * Merges two ordered plot row arrays and returns result (ordered plot row array).
 *
 * BEWARE: If row indexes from plot rows are equal, the new plot row is used.
 *
 * NOTE: Time and memory complexity are O(N+M).
 */
export function mergePlotRows(originalPlotRows, newPlotRows) {
    var newArraySize = calcMergedArraySize(originalPlotRows, newPlotRows);
    // tslint:disable-next-line:prefer-array-literal
    var result = new Array(newArraySize);
    var originalRowsIndex = 0;
    var newRowsIndex = 0;
    var originalRowsSize = originalPlotRows.length;
    var newRowsSize = newPlotRows.length;
    var resultRowsIndex = 0;
    while (originalRowsIndex < originalRowsSize && newRowsIndex < newRowsSize) {
        if (originalPlotRows[originalRowsIndex].index < newPlotRows[newRowsIndex].index) {
            result[resultRowsIndex] = originalPlotRows[originalRowsIndex];
            originalRowsIndex++;
        }
        else if (originalPlotRows[originalRowsIndex].index > newPlotRows[newRowsIndex].index) {
            result[resultRowsIndex] = newPlotRows[newRowsIndex];
            newRowsIndex++;
        }
        else {
            result[resultRowsIndex] = newPlotRows[newRowsIndex];
            originalRowsIndex++;
            newRowsIndex++;
        }
        resultRowsIndex++;
    }
    while (originalRowsIndex < originalRowsSize) {
        result[resultRowsIndex] = originalPlotRows[originalRowsIndex];
        originalRowsIndex++;
        resultRowsIndex++;
    }
    while (newRowsIndex < newRowsSize) {
        result[resultRowsIndex] = newPlotRows[newRowsIndex];
        newRowsIndex++;
        resultRowsIndex++;
    }
    return result;
}
function calcMergedArraySize(firstPlotRows, secondPlotRows) {
    var firstPlotsSize = firstPlotRows.length;
    var secondPlotsSize = secondPlotRows.length;
    // new plot rows size is (first plot rows size) + (second plot rows size) - common part size
    // in this case we can just calculate common part size
    var result = firstPlotsSize + secondPlotsSize;
    // TODO: we can move first/second indexes to the right and first/second size to lower/upper bound of opposite array
    // to skip checking uncommon parts
    var firstIndex = 0;
    var secondIndex = 0;
    while (firstIndex < firstPlotsSize && secondIndex < secondPlotsSize) {
        if (firstPlotRows[firstIndex].index < secondPlotRows[secondIndex].index) {
            firstIndex++;
        }
        else if (firstPlotRows[firstIndex].index > secondPlotRows[secondIndex].index) {
            secondIndex++;
        }
        else {
            firstIndex++;
            secondIndex++;
            result--;
        }
    }
    return result;
}
