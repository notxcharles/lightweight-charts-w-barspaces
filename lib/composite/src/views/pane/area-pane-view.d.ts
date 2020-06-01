import { BarPrice } from '../../model/bar';
import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { TimePointIndex } from '../../model/time-data';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { LineItem } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export declare class SeriesAreaPaneView extends LinePaneViewBase<'Area', LineItem> {
    private readonly _renderer;
    private readonly _areaRenderer;
    private readonly _lineRenderer;
    constructor(series: Series<'Area'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer;
    protected _createRawItem(time: TimePointIndex, price: BarPrice): LineItem;
}
