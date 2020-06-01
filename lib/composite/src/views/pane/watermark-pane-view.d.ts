import { Watermark } from '../../model/watermark';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IUpdatablePaneView } from './iupdatable-pane-view';
export declare class WatermarkPaneView implements IUpdatablePaneView {
    private _source;
    private _invalidated;
    private readonly _rendererData;
    private readonly _renderer;
    constructor(source: Watermark);
    update(): void;
    renderer(height: number, width: number): IPaneRenderer;
    private _updateImpl;
}
