import { Nominal } from '../helpers/nominal';
import { PlotRow, PlotValue } from '../model/plot-data';
import { TimePointIndex } from '../model/time-data';
export declare const enum PlotRowSearchMode {
    NearestLeft = -1,
    Exact = 0,
    NearestRight = 1
}
export declare type EnumeratingFunction<TimeType, PlotValueTuple extends PlotValue[]> = (index: TimePointIndex, bar: PlotRow<TimeType, PlotValueTuple>) => boolean;
export interface PlotInfo {
    name: string;
    offset: number;
}
export declare type PlotInfoList = ReadonlyArray<PlotInfo>;
export declare type PlotFunctionMap<PlotValueTuple extends PlotValue[]> = Map<string, (row: PlotValueTuple) => PlotValue>;
declare type EmptyValuePredicate<PlotValueTuple extends PlotValue[]> = (value: PlotValueTuple) => boolean;
export interface MinMax {
    min: number;
    max: number;
}
export declare type PlotRowIndex = Nominal<number, 'PlotRowIndex'>;
/**
 * PlotList is an array of plot rows
 * each plot row consists of key (index in timescale) and plot value map
 */
export declare class PlotList<TimeType, PlotValueTuple extends PlotValue[] = PlotValue[]> {
    private _items;
    private _start;
    private _end;
    private _shareRead;
    private _minMaxCache;
    private _rowSearchCache;
    private _rowSearchCacheWithoutEmptyValues;
    private readonly _plotFunctions;
    private readonly _emptyValuePredicate;
    constructor(plotFunctions?: PlotFunctionMap<PlotValueTuple> | null, emptyValuePredicate?: EmptyValuePredicate<PlotValueTuple> | null);
    clear(): void;
    first(): PlotRow<TimeType, PlotValueTuple> | null;
    last(): PlotRow<TimeType, PlotValueTuple> | null;
    firstIndex(): TimePointIndex | null;
    lastIndex(): TimePointIndex | null;
    size(): number;
    isEmpty(): boolean;
    contains(index: TimePointIndex): boolean;
    valueAt(index: TimePointIndex): PlotRow<TimeType, PlotValueTuple> | null;
    /**
     * @returns true if new index is added or false if existing index is updated
     */
    add(index: TimePointIndex, time: TimeType, value: PlotValueTuple): boolean;
    search(index: TimePointIndex, searchMode?: PlotRowSearchMode, skipEmptyValues?: boolean): PlotRow<TimeType, PlotValueTuple> | null;
    /**
     * Execute fun on each element.
     * Stops iteration if callback function returns true.
     * @param fun - Callback function on each element function(index, value): boolean
     */
    each(fun: EnumeratingFunction<TimeType, PlotValueTuple>): void;
    /**
     * @returns Readonly collection of elements in range
     */
    range(start: TimePointIndex, end: TimePointIndex): PlotList<TimeType, PlotValueTuple>;
    minMaxOnRangeCached(start: TimePointIndex, end: TimePointIndex, plots: PlotInfoList): MinMax | null;
    merge(plotRows: ReadonlyArray<PlotRow<TimeType, PlotValueTuple>>): PlotRow<TimeType, PlotValueTuple> | null;
    remove(start: TimePointIndex): PlotRow<TimeType, PlotValueTuple> | null;
    private _indexAt;
    private _valueAt;
    private _search;
    private _nonEmptyNearestRight;
    private _nonEmptyNearestLeft;
    private _searchNearestLeft;
    private _searchNearestRight;
    private _bsearch;
    private _lowerbound;
    private _upperbound;
    /**
     * @param endIndex - Non-inclusive end
     */
    private _plotMinMax;
    private _invalidateCacheForRow;
    private _prepend;
    private _append;
    private _updateLast;
    private _merge;
    private _minMaxOnRangeCachedImpl;
}
export declare function mergeMinMax(first: MinMax | null, second: MinMax | null): MinMax | null;
/**
 * Merges two ordered plot row arrays and returns result (ordered plot row array).
 *
 * BEWARE: If row indexes from plot rows are equal, the new plot row is used.
 *
 * NOTE: Time and memory complexity are O(N+M).
 */
export declare function mergePlotRows<TimeType, PlotValueTuple extends PlotValue[] = PlotValue[]>(originalPlotRows: ReadonlyArray<PlotRow<TimeType, PlotValueTuple>>, newPlotRows: ReadonlyArray<PlotRow<TimeType, PlotValueTuple>>): PlotRow<TimeType, PlotValueTuple>[];
export {};
