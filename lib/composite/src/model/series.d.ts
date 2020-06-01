import { IFormatter } from '../formatters/iformatter';
import { IDestroyable } from '../helpers/idestroyable';
import { IPaneView } from '../views/pane/ipane-view';
import { IPriceAxisView } from '../views/price-axis/iprice-axis-view';
import { AutoscaleInfoImpl } from './autoscale-info-impl';
import { BarPrice, BarPrices } from './bar';
import { ChartModel } from './chart-model';
import { Coordinate } from './coordinate';
import { CustomPriceLine } from './custom-price-line';
import { FirstValue } from './iprice-data-source';
import { Palette } from './palette';
import { Pane } from './pane';
import { PlotRow } from './plot-data';
import { PlotList, PlotRowSearchMode } from './plot-list';
import { PriceDataSource } from './price-data-source';
import { PriceLineOptions } from './price-line-options';
import { PriceScale } from './price-scale';
import { SeriesBarColorer } from './series-bar-colorer';
import { Bar, SeriesData, SeriesPlotIndex } from './series-data';
import { InternalSeriesMarker, SeriesMarker } from './series-markers';
import { SeriesOptionsMap, SeriesPartialOptionsMap, SeriesType } from './series-options';
import { TimePoint, TimePointIndex } from './time-data';
export interface LastValueDataResult {
    noData: boolean;
}
export interface LastValueDataResultWithoutData extends LastValueDataResult {
    noData: true;
}
export interface LastValueDataResultWithData extends LastValueDataResult {
    noData: false;
    text: string;
    formattedPriceAbsolute: string;
    formattedPricePercentage: string;
    color: string;
    coordinate: Coordinate;
    index: TimePointIndex;
}
export interface LastValueDataResultWithRawPrice extends LastValueDataResultWithData {
    price: number;
}
export declare type LastValueDataResultWithoutRawPrice = LastValueDataResultWithoutData | LastValueDataResultWithData;
export declare type BarFunction = (bar: Bar['value']) => BarPrice;
export interface MarkerData {
    price: BarPrice;
    radius: number;
}
export interface SeriesDataAtTypeMap {
    Bar: BarPrices;
    Candlestick: BarPrices;
    Area: BarPrice;
    Line: BarPrice;
    Histogram: BarPrice;
}
export declare type SeriesOptionsInternal<T extends SeriesType = SeriesType> = SeriesOptionsMap[T];
export declare type SeriesPartialOptionsInternal<T extends SeriesType = SeriesType> = SeriesPartialOptionsMap[T];
export declare class Series<T extends SeriesType = SeriesType> extends PriceDataSource implements IDestroyable {
    private readonly _seriesType;
    private _data;
    private readonly _priceAxisViews;
    private readonly _panePriceAxisView;
    private _formatter;
    private readonly _priceLineView;
    private readonly _customPriceLines;
    private readonly _baseHorizontalLineView;
    private _endOfData;
    private _paneView;
    private _barColorerCache;
    private readonly _options;
    private _barFunction;
    private readonly _palette;
    private _markers;
    private _indexedMarkers;
    private _markersPaneView;
    constructor(model: ChartModel, options: SeriesOptionsInternal<T>, seriesType: T);
    destroy(): void;
    endOfData(): boolean;
    priceLineColor(lastBarColor: string): string;
    lastValueData(plot: SeriesPlotIndex | undefined, globalLast: boolean, withRawPrice?: false): LastValueDataResultWithoutRawPrice;
    lastValueData(plot: SeriesPlotIndex | undefined, globalLast: boolean, withRawPrice: true): LastValueDataResultWithRawPrice;
    data(): SeriesData;
    barColorer(): SeriesBarColorer;
    options(): Readonly<SeriesOptionsMap[T]>;
    applyOptions(options: SeriesPartialOptionsInternal<T>): void;
    clearData(): void;
    updateData(data: ReadonlyArray<PlotRow<Bar['time'], Bar['value']>>, clearData?: boolean): void;
    setMarkers(data: SeriesMarker<TimePoint>[]): void;
    markers(): SeriesMarker<TimePoint>[];
    indexedMarkers(): InternalSeriesMarker<TimePointIndex>[];
    createPriceLine(options: PriceLineOptions): CustomPriceLine;
    removePriceLine(line: CustomPriceLine): void;
    palette(): Palette;
    seriesType(): T;
    firstValue(): FirstValue | null;
    firstBar(): Bar | null;
    bars(): PlotList<Bar['time'], Bar['value']>;
    nearestIndex(index: TimePointIndex, options?: PlotRowSearchMode): TimePointIndex | null;
    nearestData(index: TimePointIndex, options?: PlotRowSearchMode): PlotRow<Bar['time'], Bar['value']> | null;
    dataAt(time: TimePointIndex): SeriesDataAtTypeMap[SeriesType] | null;
    paneViews(): ReadonlyArray<IPaneView>;
    priceAxisViews(pane: Pane, priceScale: PriceScale): ReadonlyArray<IPriceAxisView>;
    autoscaleInfo(startTimePoint: TimePointIndex, endTimePoint: TimePointIndex): AutoscaleInfoImpl | null;
    minMove(): number;
    formatter(): IFormatter;
    barFunction(): BarFunction;
    updateAllViews(): void;
    setPriceScale(priceScale: PriceScale): void;
    priceScale(): PriceScale;
    markerDataAtIndex(index: TimePointIndex): MarkerData | null;
    title(): string;
    private _isOverlay;
    private _autoscaleInfoImpl;
    private _markerRadius;
    private _recreateFormatter;
    private _updateBarFunction;
    private _recalculateMarkers;
    private _recreatePaneViews;
}
