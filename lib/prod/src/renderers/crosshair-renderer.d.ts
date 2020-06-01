import { LineStyle, LineWidth } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';
export interface CrosshairLineStyle {
    lineStyle: LineStyle;
    lineWidth: LineWidth;
    color: string;
    visible: boolean;
}
export interface CrosshairRendererData {
    vertLine: CrosshairLineStyle;
    horzLine: CrosshairLineStyle;
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare class CrosshairRenderer implements IPaneRenderer {
    private readonly _data;
    constructor(data: CrosshairRendererData | null);
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
