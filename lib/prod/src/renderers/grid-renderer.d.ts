import { PriceMark } from '../model/price-scale';
import { LineStyle } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';
export interface GridMarks {
    coord: number;
}
export interface GridRendererData {
    vertLinesVisible: boolean;
    vertLinesColor: string;
    vertLineStyle: LineStyle;
    timeMarks: GridMarks[];
    horzLinesVisible: boolean;
    horzLinesColor: string;
    horzLineStyle: LineStyle;
    priceMarks: PriceMark[];
    h: number;
    w: number;
}
export declare class GridRenderer implements IPaneRenderer {
    private _data;
    setData(data: GridRendererData | null): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
