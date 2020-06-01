import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { HorizontalLineRenderer, HorizontalLineRendererData } from '../../renderers/horizontal-line-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IPaneView } from './ipane-view';
export declare abstract class SeriesHorizontalLinePaneView implements IPaneView {
    protected readonly _lineRendererData: HorizontalLineRendererData;
    protected readonly _series: Series;
    protected readonly _model: ChartModel;
    protected readonly _lineRenderer: HorizontalLineRenderer;
    private _invalidated;
    protected constructor(series: Series);
    update(): void;
    renderer(height: number, width: number): IPaneRenderer;
    protected abstract _updateImpl(height: number, width: number): void;
}
