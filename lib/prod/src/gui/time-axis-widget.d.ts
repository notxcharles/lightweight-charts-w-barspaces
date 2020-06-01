import { IDestroyable } from '../helpers/idestroyable';
import { InvalidationLevel } from '../model/invalidate-mask';
import { Size } from './canvas-utils';
import { ChartWidget } from './chart-widget';
import { MouseEventHandlers, TouchMouseEvent } from './mouse-event-handler';
import { PriceAxisStub } from './price-axis-stub';
export declare class TimeAxisWidget implements MouseEventHandlers, IDestroyable {
    private readonly _chart;
    private readonly _options;
    private readonly _element;
    private readonly _leftStubCell;
    private readonly _rightStubCell;
    private readonly _cell;
    private readonly _dv;
    private readonly _canvasBinding;
    private readonly _topCanvasBinding;
    private _leftStub;
    private _rightStub;
    private readonly _mouseEventHandler;
    private _rendererOptions;
    private _mouseDown;
    private _size;
    constructor(chartWidget: ChartWidget);
    destroy(): void;
    getElement(): HTMLElement;
    leftStub(): PriceAxisStub | null;
    rightStub(): PriceAxisStub | null;
    mouseDownEvent(event: TouchMouseEvent): void;
    mouseDownOutsideEvent(): void;
    pressedMouseMoveEvent(event: TouchMouseEvent): void;
    mouseUpEvent(event: TouchMouseEvent): void;
    mouseDoubleClickEvent(): void;
    mouseEnterEvent(e: TouchMouseEvent): void;
    mouseLeaveEvent(e: TouchMouseEvent): void;
    getSize(): Readonly<Size>;
    setSizes(timeAxisSize: Size, leftStubWidth: number, rightStubWidth: number): void;
    width(): number;
    height(): number;
    optimalHeight(): number;
    update(): void;
    getImage(): HTMLCanvasElement;
    paint(type: InvalidationLevel): void;
    private _drawBackground;
    private _drawBorder;
    private _drawTickMarks;
    private _drawLabels;
    private _backgroundColor;
    private _lineColor;
    private _textColor;
    private _fontSize;
    private _baseFont;
    private _baseBoldFont;
    private _getRendererOptions;
    private _setCursor;
    private _recreateStubs;
    private readonly _canvasConfiguredHandler;
    private readonly _topCanvasConfiguredHandler;
}