import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { Bar } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import { BarItem } from '../../renderers/bars-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export declare class SeriesBarsPaneView extends BarsPaneViewBase<'Bar', BarItem> {
    private readonly _renderer;
    constructor(series: Series<'Bar'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer;
    protected _createRawItem(time: TimePointIndex, bar: Bar, colorer: SeriesBarColorer): BarItem;
}
