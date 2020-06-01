import { ChartModel } from '../../model/chart-model';
import { Crosshair, TimeAndCoordinateProvider } from '../../model/crosshair';
import { TimeAxisViewRenderer } from '../../renderers/time-axis-view-renderer';
import { TimeAxisView } from './time-axis-view';
export declare class CrosshairTimeAxisView extends TimeAxisView {
    private _invalidated;
    private readonly _crosshair;
    private readonly _model;
    private readonly _valueProvider;
    private readonly _renderer;
    private readonly _rendererData;
    constructor(crosshair: Crosshair, model: ChartModel, valueProvider: TimeAndCoordinateProvider);
    update(): void;
    renderer(): TimeAxisViewRenderer;
    private _updateImpl;
}
