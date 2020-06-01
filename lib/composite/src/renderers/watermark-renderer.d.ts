import { ScaledRenderer } from './scaled-renderer';
export interface WatermarkRendererLineData {
    text: string;
    font: string;
    lineHeight: number;
    vertOffset: number;
    zoom: number;
}
export declare type HorzAlign = 'left' | 'center' | 'right';
export declare type VertAlign = 'top' | 'center' | 'bottom';
export interface WatermarkRendererData {
    lines: WatermarkRendererLineData[];
    color: string;
    height: number;
    width: number;
    visible: boolean;
    horzAlign: HorzAlign;
    vertAlign: VertAlign;
}
export declare class WatermarkRenderer extends ScaledRenderer {
    private readonly _data;
    private _metricsCache;
    constructor(data: WatermarkRendererData);
    protected _drawImpl(ctx: CanvasRenderingContext2D): void;
    protected _drawBackgroundImpl(ctx: CanvasRenderingContext2D): void;
    private _metrics;
    private _fontCache;
}
