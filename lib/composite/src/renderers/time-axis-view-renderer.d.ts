import { ITimeAxisViewRenderer, TimeAxisViewRendererOptions } from './itime-axis-view-renderer';
export interface TimeAxisViewRendererData {
    width: number;
    text: string;
    coordinate: number;
    color: string;
    background: string;
    visible: boolean;
}
export declare class TimeAxisViewRenderer implements ITimeAxisViewRenderer {
    private _data;
    constructor();
    setData(data: TimeAxisViewRendererData): void;
    draw(ctx: CanvasRenderingContext2D, rendererOptions: TimeAxisViewRendererOptions, pixelRatio: number): void;
}
