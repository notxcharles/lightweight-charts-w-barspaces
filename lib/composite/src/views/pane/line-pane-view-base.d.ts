import { BarPrice } from '../../model/bar';
import { ChartModel } from '../../model/chart-model';
import { PricedValue, PriceScale } from '../../model/price-scale';
import { Series } from '../../model/series';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { TimedValue, TimePointIndex } from '../../model/time-data';
import { TimeScale } from '../../model/time-scale';
import { SeriesPaneViewBase } from './series-pane-view-base';
export declare abstract class LinePaneViewBase<TSeriesType extends 'Line' | 'Area', ItemType extends PricedValue & TimedValue> extends SeriesPaneViewBase<TSeriesType, ItemType> {
    protected constructor(series: Series<TSeriesType>, model: ChartModel);
    protected _convertToCoordinates(priceScale: PriceScale, timeScale: TimeScale, firstValue: number): void;
    protected abstract _createRawItem(time: TimePointIndex, price: BarPrice, colorer: SeriesBarColorer): ItemType;
    protected _createRawItemBase(time: TimePointIndex, price: BarPrice): PricedValue & TimedValue;
    protected _fillRawPoints(): void;
}
