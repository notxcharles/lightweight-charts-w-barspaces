import { SeriesItemsIndexesRange } from '../model/time-data';
import { BarCandlestickItemBase } from './bars-renderer';
import { IPaneRenderer } from './ipane-renderer';
export interface CandlestickItem extends BarCandlestickItemBase {
    color: string;
    borderColor: string;
    wickColor: string;
}
export interface PaneRendererCandlesticksData {
    bars: ReadonlyArray<CandlestickItem>;
    barSpacing: number;
    wickVisible: boolean;
    borderVisible: boolean;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class PaneRendererCandlesticks implements IPaneRenderer {
    private _data;
    private _barWidth;
    setData(data: PaneRendererCandlesticksData): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
    private _drawWicks;
    private _calculateBorderWidth;
    private _drawBorder;
    private _drawCandles;
}
