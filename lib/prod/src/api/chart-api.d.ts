import { DeepPartial } from '../helpers/strict-type-checks';
import { ChartOptions } from '../model/chart-model';
import { Series } from '../model/series';
import { AreaSeriesPartialOptions, BarSeriesPartialOptions, CandlestickSeriesPartialOptions, HistogramSeriesPartialOptions, LineSeriesPartialOptions, SeriesType } from '../model/series-options';
import { DataUpdatesConsumer, SeriesDataItemTypeMap } from './data-consumer';
import { IChartApi, MouseEventHandler } from './ichart-api';
import { IPriceScaleApi } from './iprice-scale-api';
import { ISeriesApi } from './iseries-api';
import { ITimeScaleApi } from './itime-scale-api';
export interface IPriceScaleApiProvider {
    priceScale(id: string): IPriceScaleApi;
}
export declare class ChartApi implements IChartApi, IPriceScaleApiProvider, DataUpdatesConsumer<SeriesType> {
    private _chartWidget;
    private _dataLayer;
    private readonly _seriesMap;
    private readonly _seriesMapReversed;
    private readonly _clickedDelegate;
    private readonly _crosshairMovedDelegate;
    private readonly _timeScaleApi;
    constructor(container: HTMLElement, options?: DeepPartial<ChartOptions>);
    remove(): void;
    resize(width: number, height: number, forceRepaint?: boolean): void;
    addAreaSeries(options?: AreaSeriesPartialOptions): ISeriesApi<'Area'>;
    addBarSeries(options?: BarSeriesPartialOptions): ISeriesApi<'Bar'>;
    addCandlestickSeries(options?: CandlestickSeriesPartialOptions): ISeriesApi<'Candlestick'>;
    addHistogramSeries(options?: HistogramSeriesPartialOptions): ISeriesApi<'Histogram'>;
    addLineSeries(options?: LineSeriesPartialOptions): ISeriesApi<'Line'>;
    removeSeries(seriesApi: ISeriesApi<SeriesType>): void;
    applyNewData<TSeriesType extends SeriesType>(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType][]): void;
    updateData<TSeriesType extends SeriesType>(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType]): void;
    subscribeClick(handler: MouseEventHandler): void;
    unsubscribeClick(handler: MouseEventHandler): void;
    subscribeCrosshairMove(handler: MouseEventHandler): void;
    unsubscribeCrosshairMove(handler: MouseEventHandler): void;
    priceScale(priceScaleId?: string): IPriceScaleApi;
    timeScale(): ITimeScaleApi;
    applyOptions(options: DeepPartial<ChartOptions>): void;
    options(): Readonly<ChartOptions>;
    takeScreenshot(): HTMLCanvasElement;
    private _mapSeriesToApi;
    private _convertMouseParams;
}
