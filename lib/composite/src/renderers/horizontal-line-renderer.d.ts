import { Coordinate } from '../model/coordinate';
import { LineStyle, LineWidth } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';
export interface HorizontalLineRendererData {
    color: string;
    height: number;
    lineStyle: LineStyle;
    lineWidth: LineWidth;
    y: Coordinate;
    visible?: boolean;
    width: number;
}
export declare class HorizontalLineRenderer implements IPaneRenderer {
    private _data;
    setData(data: HorizontalLineRendererData): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
