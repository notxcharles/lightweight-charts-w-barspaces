import { BarCoordinates, BarPrices } from '../model/bar';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';
import { IPaneRenderer } from './ipane-renderer';
export declare type BarCandlestickItemBase = TimedValue & BarPrices & BarCoordinates;
export interface BarItem extends BarCandlestickItemBase {
    color: string;
}
export interface PaneRendererBarsData {
    bars: ReadonlyArray<BarItem>;
    barSpacing: number;
    openVisible: boolean;
    thinBars: boolean;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class PaneRendererBars implements IPaneRenderer {
    private _data;
    private _barWidth;
    private _barLineWidth;
    setData(data: PaneRendererBarsData): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
