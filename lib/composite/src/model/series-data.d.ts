import { BarPrice } from './bar';
import { PlotRow, PlotValue } from './plot-data';
import { EnumeratingFunction, PlotList, PlotRowSearchMode } from './plot-list';
import { TimePoint, TimePointIndex } from './time-data';
export interface Bar {
    time: TimePoint;
    value: [PlotValue, PlotValue, PlotValue, PlotValue, PlotValue];
}
/**
 * Plot's index in plot list tuple for series (or overlay study)
 * @see {Bar}
 */
export declare const enum SeriesPlotIndex {
    Open = 0,
    High = 1,
    Low = 2,
    Close = 3,
    Color = 4
}
/** @public */
declare const barFunctions: {
    open: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    high: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    low: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    close: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    hl2: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    hlc3: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
    ohlc4: (bar: Bar['value']) => import("../helpers/nominal").Nominal<number, "BarPrice">;
};
declare type SeriesPriceSource = keyof typeof barFunctions;
export declare type BarFunction = (bar: Bar['value']) => BarPrice;
export declare function barFunction(priceSource: SeriesPriceSource): BarFunction;
export declare class SeriesData {
    private _bars;
    constructor();
    bars(): PlotList<TimePoint, Bar['value']>;
    size(): number;
    each(fun: EnumeratingFunction<TimePoint, Bar['value']>): void;
    clear(): void;
    isEmpty(): boolean;
    first(): PlotRow<TimePoint, Bar['value']> | null;
    last(): PlotRow<TimePoint, Bar['value']> | null;
    search(index: TimePointIndex, options?: PlotRowSearchMode): PlotRow<TimePoint, Bar['value']> | null;
    valueAt(index: TimePointIndex): Bar | null;
}
export {};
