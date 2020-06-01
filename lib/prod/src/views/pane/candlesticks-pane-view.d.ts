import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { Bar } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import { CandlestickItem } from '../../renderers/candlesticks-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export declare class SeriesCandlesticksPaneView extends BarsPaneViewBase<'Candlestick', CandlestickItem> {
    private readonly _renderer;
    constructor(series: Series<'Candlestick'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer;
    protected _createRawItem(time: TimePointIndex, bar: Bar, colorer: SeriesBarColorer): CandlestickItem;
}
