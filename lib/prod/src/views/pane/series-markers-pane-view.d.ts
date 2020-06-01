import { AutoScaleMargins } from '../../model/autoscale-info-impl';
import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';
export declare class SeriesMarkersPaneView implements IUpdatablePaneView {
    private readonly _series;
    private readonly _model;
    private _data;
    private _invalidated;
    private _dataInvalidated;
    private _autoScaleMarginsInvalidated;
    private _autoScaleMargins;
    private _renderer;
    constructor(series: Series, model: ChartModel);
    update(updateType?: UpdateType): void;
    renderer(height: number, width: number, addAnchors?: boolean): IPaneRenderer;
    autoScaleMargins(): AutoScaleMargins | null;
    protected _makeValid(): void;
}
