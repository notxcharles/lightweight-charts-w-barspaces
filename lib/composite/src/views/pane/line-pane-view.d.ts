import { BarPrice } from '../../model/bar';
import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { TimePointIndex } from '../../model/time-data';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { LineItem } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export declare class SeriesLinePaneView extends LinePaneViewBase<'Line', LineItem> {
    private readonly _lineRenderer;
    constructor(series: Series<'Line'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer;
    protected _createRawItem(time: TimePointIndex, price: BarPrice): LineItem;
}
