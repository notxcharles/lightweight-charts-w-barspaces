import { IDestroyable } from '../helpers/idestroyable';
import { ChartOptionsInternal } from '../model/chart-model';
import { InvalidationLevel } from '../model/invalidate-mask';
import { PriceAxisRendererOptionsProvider } from '../renderers/price-axis-renderer-options-provider';
import { Size } from './canvas-utils';
import { PriceAxisWidgetSide } from './price-axis-widget';
export interface PriceAxisStubParams {
    rendererOptionsProvider: PriceAxisRendererOptionsProvider;
}
export declare type BorderVisibleGetter = () => boolean;
export declare class PriceAxisStub implements IDestroyable {
    private readonly _cell;
    private readonly _canvasBinding;
    private readonly _rendererOptionsProvider;
    private _options;
    private _invalidated;
    private readonly _isLeft;
    private _size;
    private readonly _borderVisible;
    constructor(side: PriceAxisWidgetSide, options: ChartOptionsInternal, params: PriceAxisStubParams, borderVisible: BorderVisibleGetter);
    destroy(): void;
    update(): void;
    getElement(): HTMLElement;
    getSize(): Readonly<Size>;
    setSize(size: Size): void;
    paint(type: InvalidationLevel): void;
    getImage(): HTMLCanvasElement;
    isLeft(): boolean;
    private _drawBorder;
    private _drawBackground;
    private readonly _canvasConfiguredHandler;
}
