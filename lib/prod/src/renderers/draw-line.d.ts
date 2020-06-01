import { Coordinate } from '../model/coordinate';
export declare type LineWidth = 1 | 2 | 3 | 4;
export declare const enum LineType {
    Simple = 0,
    WithSteps = 1
}
export interface LinePoint {
    x: Coordinate;
    y: Coordinate;
}
export declare const enum LineStyle {
    Solid = 0,
    Dotted = 1,
    Dashed = 2,
    LargeDashed = 3,
    SparseDotted = 4
}
export declare function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, lineStyle: LineStyle): void;
export declare function setLineStyle(ctx: CanvasRenderingContext2D, style: LineStyle): void;
export declare function drawHorizontalLine(ctx: CanvasRenderingContext2D, y: number, left: number, right: number): void;
export declare function drawVerticalLine(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number): void;
export declare function strokeInPixel(ctx: CanvasRenderingContext2D, drawFunction: () => void): void;
