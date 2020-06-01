import { lowerbound, upperbound } from '../helpers/algorithms';
import { assert, ensureNotNull } from '../helpers/assertions';
;
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
        this._private__items = [];
        // some PlotList instances are just readonly views of sub-range of data stored in another PlotList
        // _start and _end fields are used to implement such views
        this._private__start = 0;
        // end is an after-last index
        this._private__end = 0;
        this._private__shareRead = false;
        this._private__minMaxCache = new Map();
        this._private__rowSearchCache = new Map();
        this._private__rowSearchCacheWithoutEmptyValues = new Map();
        this._private__plotFunctions = plotFunctions || new Map();
        this._private__emptyValuePredicate = emptyValuePredicate;
    }
    PlotList.prototype._internal_clear = function () {
        this._private__items = [];
        this._private__start = 0;
        this._private__end = 0;
        this._private__shareRead = false;
        this._private__minMaxCache.clear();
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
    };
    // @returns First row
    PlotList.prototype._internal_first = function () {
        return this._internal_size() > 0 ? this._private__items[this._private__start] : null;
    };
    // @returns Last row
    PlotList.prototype._internal_last = function () {
        return this._internal_size() > 0 ? this._private__items[(this._private__end - 1)] : null;
    };
    PlotList.prototype._internal_firstIndex = function () {
        return this._internal_size() > 0 ? this._private__indexAt(this._private__start) : null;
    };
    PlotList.prototype._internal_lastIndex = function () {
        return this._internal_size() > 0 ? this._private__indexAt((this._private__end - 1)) : null;
    };
    PlotList.prototype._internal_size = function () {
        return this._private__end - this._private__start;
    };
    PlotList.prototype._internal_isEmpty = function () {
        return this._internal_size() === 0;
    };
    PlotList.prototype._internal_contains = function (index) {
        return this._private__search(index, 0 /* Exact */) !== null;
    };
    PlotList.prototype._internal_valueAt = function (index) {
        return this._internal_search(index);
    };
    /**
     * @returns true if new index is added or false if existing index is updated
     */
    PlotList.prototype._internal_add = function (index, time, value) {
        if (this._private__shareRead) {
            return false;
        }
        var row = { _internal_index: index, _internal_value: value, _internal_time: time };
        var pos = this._private__search(index, 0 /* Exact */);
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
        if (pos === null) {
            this._private__items.splice(this._private__lowerbound(index), 0, row);
            this._private__start = 0;
            this._private__end = this._private__items.length;
            return true;
        }
        else {
            this._private__items[pos] = row;
            return false;
        }
    };
    PlotList.prototype._internal_search = function (index, searchMode, skipEmptyValues) {
        if (searchMode === void 0) { searchMode = 0 /* Exact */; }
        var pos = this._private__search(index, searchMode, skipEmptyValues);
        if (pos === null) {
            return null;
        }
        var item = this._private__valueAt(pos);
        return {
            _internal_index: this._private__indexAt(pos),
            _internal_time: item._internal_time,
            _internal_value: item._internal_value,
        };
    };
    /**
     * Execute fun on each element.
     * Stops iteration if callback function returns true.
     * @param fun - Callback function on each element function(index, value): boolean
     */
    PlotList.prototype._internal_each = function (fun) {
        for (var i = this._private__start; i < this._private__end; ++i) {
            var index = this._private__indexAt(i);
            var item = this._private__valueAt(i);
            if (fun(index, item)) {
                break;
            }
        }
    };
    /**
     * @returns Readonly collection of elements in range
     */
    PlotList.prototype._internal_range = function (start, end) {
        var copy = new PlotList(this._private__plotFunctions, this._private__emptyValuePredicate);
        copy._private__items = this._private__items;
        copy._private__start = this._private__lowerbound(start);
        copy._private__end = this._private__upperbound(end);
        copy._private__shareRead = true;
        return copy;
    };
    PlotList.prototype._internal_minMaxOnRangeCached = function (start, end, plots) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this._internal_isEmpty()) {
            return null;
        }
        var result = null;
        for (var _i = 0, plots_1 = plots; _i < plots_1.length; _i++) {
            var plot = plots_1[_i];
            var plotMinMax = this._private__minMaxOnRangeCachedImpl(start, end, plot);
            result = mergeMinMax(result, plotMinMax);
        }
        return result;
    };
    PlotList.prototype._internal_merge = function (plotRows) {
        if (this._private__shareRead) {
            return null;
        }
        if (plotRows.length === 0) {
            return null;
        }
        // if we get a bunch of history - just prepend it
        if (this._internal_isEmpty() || plotRows[plotRows.length - 1]._internal_index < this._private__items[0]._internal_index) {
            return this._private__prepend(plotRows);
        }
        // if we get new rows - just append it
        if (plotRows[0]._internal_index > this._private__items[this._private__items.length - 1]._internal_index) {
            return this._private__append(plotRows);
        }
        // if we get update for the last row - just replace it
        if (plotRows.length === 1 && plotRows[0]._internal_index === this._private__items[this._private__items.length - 1]._internal_index) {
            this._private__updateLast(plotRows[0]);
            return plotRows[0];
        }
        return this._private__merge(plotRows);
    };
    PlotList.prototype._internal_remove = function (start) {
        if (this._private__shareRead) {
            return null;
        }
        var startOffset = this._private__search(start, 1 /* NearestRight */);
        if (startOffset === null) {
            return null;
        }
        var removedPlotRows = this._private__items.splice(startOffset);
        // _start should never be modified in this method
        this._private__end = this._private__items.length;
        this._private__minMaxCache.clear();
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
        return removedPlotRows.length > 0 ? removedPlotRows[0] : null;
    };
    PlotList.prototype._private__indexAt = function (offset) {
        return this._private__items[offset]._internal_index;
    };
    PlotList.prototype._private__valueAt = function (offset) {
        return this._private__items[offset];
    };
    PlotList.prototype._private__search = function (index, searchMode, skipEmptyValues) {
        var exactPos = this._private__bsearch(index);
        if (exactPos === null && searchMode !== 0 /* Exact */) {
            switch (searchMode) {
                case -1 /* NearestLeft */:
                    return this._private__searchNearestLeft(index, skipEmptyValues);
                case 1 /* NearestRight */:
                    return this._private__searchNearestRight(index, skipEmptyValues);
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
                return this._private__nonEmptyNearestLeft(exactPos);
            case 1 /* NearestRight */:
                return this._private__nonEmptyNearestRight(exactPos);
            default:
                throw new TypeError('Unknown search mode');
        }
    };
    PlotList.prototype._private__nonEmptyNearestRight = function (index) {
        var predicate = ensureNotNull(this._private__emptyValuePredicate);
        while (index < this._private__end && predicate(this._private__valueAt(index)._internal_value)) {
            index = index + 1;
        }
        return index === this._private__end ? null : index;
    };
    PlotList.prototype._private__nonEmptyNearestLeft = function (index) {
        var predicate = ensureNotNull(this._private__emptyValuePredicate);
        while (index >= this._private__start && predicate(this._private__valueAt(index)._internal_value)) {
            index = index - 1;
        }
        return index < this._private__start ? null : index;
    };
    PlotList.prototype._private__searchNearestLeft = function (index, skipEmptyValues) {
        var nearestLeftPos = this._private__lowerbound(index);
        if (nearestLeftPos > this._private__start) {
            nearestLeftPos = nearestLeftPos - 1;
        }
        var result = (nearestLeftPos !== this._private__end && this._private__indexAt(nearestLeftPos) < index) ? nearestLeftPos : null;
        if (skipEmptyValues && result !== null) {
            return this._private__nonEmptyNearestLeft(result);
        }
        return result;
    };
    PlotList.prototype._private__searchNearestRight = function (index, skipEmptyValues) {
        var nearestRightPos = this._private__upperbound(index);
        var result = (nearestRightPos !== this._private__end && index < this._private__indexAt(nearestRightPos)) ? nearestRightPos : null;
        if (skipEmptyValues && result !== null) {
            return this._private__nonEmptyNearestRight(result);
        }
        return result;
    };
    PlotList.prototype._private__bsearch = function (index) {
        var start = this._private__lowerbound(index);
        if (start !== this._private__end && !(index < this._private__items[start]._internal_index)) {
            return start;
        }
        return null;
    };
    PlotList.prototype._private__lowerbound = function (index) {
        return lowerbound(this._private__items, index, function (a, b) { return a._internal_index < b; }, this._private__start, this._private__end);
    };
    PlotList.prototype._private__upperbound = function (index) {
        return upperbound(this._private__items, index, function (a, b) { return b._internal_index > a; }, this._private__start, this._private__end);
    };
    /**
     * @param endIndex - Non-inclusive end
     */
    PlotList.prototype._private__plotMinMax = function (startIndex, endIndex, plot) {
        var result = null;
        var func = this._private__plotFunctions.get(plot._internal_name);
        if (func === undefined) {
            throw new Error("Plot \"" + plot._internal_name + "\" is not registered");
        }
        for (var i = startIndex; i < endIndex; i++) {
            var values = this._private__items[i]._internal_value;
            var v = func(values);
            if (v === undefined || v === null || Number.isNaN(v)) {
                continue;
            }
            if (result === null) {
                result = { _internal_min: v, _internal_max: v };
            }
            else {
                if (v < result._internal_min) {
                    result._internal_min = v;
                }
                if (v > result._internal_max) {
                    result._internal_max = v;
                }
            }
        }
        return result;
    };
    PlotList.prototype._private__invalidateCacheForRow = function (row) {
        var chunkIndex = Math.floor(row._internal_index / CHUNK_SIZE);
        this._private__minMaxCache.forEach(function (cacheItem) { return cacheItem.delete(chunkIndex); });
    };
    PlotList.prototype._private__prepend = function (plotRows) {
        assert(!this._private__shareRead, 'collection should not be readonly');
        assert(plotRows.length !== 0, 'plotRows should not be empty');
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
        this._private__minMaxCache.clear();
        this._private__items = plotRows.concat(this._private__items);
        this._private__start = 0;
        this._private__end = this._private__items.length;
        return plotRows[0];
    };
    PlotList.prototype._private__append = function (plotRows) {
        assert(!this._private__shareRead, 'collection should not be readonly');
        assert(plotRows.length !== 0, 'plotRows should not be empty');
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
        this._private__minMaxCache.clear();
        this._private__items = this._private__items.concat(plotRows);
        this._private__start = 0;
        this._private__end = this._private__items.length;
        return plotRows[0];
    };
    PlotList.prototype._private__updateLast = function (plotRow) {
        assert(!this._internal_isEmpty(), 'plot list should not be empty');
        var currentLastRow = this._private__items[this._private__end - 1];
        assert(currentLastRow._internal_index === plotRow._internal_index, 'last row index should match new row index');
        this._private__invalidateCacheForRow(plotRow);
        this._private__rowSearchCache.delete(plotRow._internal_index);
        this._private__rowSearchCacheWithoutEmptyValues.delete(plotRow._internal_index);
        this._private__items[this._private__end - 1] = plotRow;
    };
    PlotList.prototype._private__merge = function (plotRows) {
        assert(plotRows.length !== 0, 'plot rows should not be empty');
        this._private__rowSearchCache.clear();
        this._private__rowSearchCacheWithoutEmptyValues.clear();
        this._private__minMaxCache.clear();
        this._private__items = mergePlotRows(this._private__items, plotRows);
        this._private__start = 0;
        this._private__end = this._private__items.length;
        return plotRows[0];
    };
    PlotList.prototype._private__minMaxOnRangeCachedImpl = function (start, end, plotInfo) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this._internal_isEmpty()) {
            return null;
        }
        var result = null;
        // assume that bar indexes only increase
        var firstIndex = ensureNotNull(this._internal_firstIndex());
        var lastIndex = ensureNotNull(this._internal_lastIndex());
        var s = start - plotInfo._internal_offset;
        var e = end - plotInfo._internal_offset;
        s = Math.max(s, firstIndex);
        e = Math.min(e, lastIndex);
        var cachedLow = Math.ceil(s / CHUNK_SIZE) * CHUNK_SIZE;
        var cachedHigh = Math.max(cachedLow, Math.floor(e / CHUNK_SIZE) * CHUNK_SIZE);
        {
            var startIndex = this._private__lowerbound(s);
            var endIndex = this._private__upperbound(Math.min(e, cachedLow, end)); // non-inclusive end
            var plotMinMax = this._private__plotMinMax(startIndex, endIndex, plotInfo);
            result = mergeMinMax(result, plotMinMax);
        }
        var minMaxCache = this._private__minMaxCache.get(plotInfo._internal_name);
        if (minMaxCache === undefined) {
            minMaxCache = new Map();
            this._private__minMaxCache.set(plotInfo._internal_name, minMaxCache);
        }
        // now go cached
        for (var c = Math.max(cachedLow + 1, s); c < cachedHigh; c += CHUNK_SIZE) {
            var chunkIndex = Math.floor(c / CHUNK_SIZE);
            var chunkMinMax = minMaxCache.get(chunkIndex);
            if (chunkMinMax === undefined) {
                var chunkStart = this._private__lowerbound(chunkIndex * CHUNK_SIZE);
                var chunkEnd = this._private__upperbound((chunkIndex + 1) * CHUNK_SIZE - 1);
                chunkMinMax = this._private__plotMinMax(chunkStart, chunkEnd, plotInfo);
                minMaxCache.set(chunkIndex, chunkMinMax);
            }
            result = mergeMinMax(result, chunkMinMax);
        }
        // tail
        {
            var startIndex = this._private__lowerbound(cachedHigh);
            var endIndex = this._private__upperbound(e); // non-inclusive end
            var plotMinMax = this._private__plotMinMax(startIndex, endIndex, plotInfo);
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
            var min = Math.min(first._internal_min, second._internal_min);
            var max = Math.max(first._internal_max, second._internal_max);
            return { _internal_min: min, _internal_max: max };
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
        if (originalPlotRows[originalRowsIndex]._internal_index < newPlotRows[newRowsIndex]._internal_index) {
            result[resultRowsIndex] = originalPlotRows[originalRowsIndex];
            originalRowsIndex++;
        }
        else if (originalPlotRows[originalRowsIndex]._internal_index > newPlotRows[newRowsIndex]._internal_index) {
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
        if (firstPlotRows[firstIndex]._internal_index < secondPlotRows[secondIndex]._internal_index) {
            firstIndex++;
        }
        else if (firstPlotRows[firstIndex]._internal_index > secondPlotRows[secondIndex]._internal_index) {
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
