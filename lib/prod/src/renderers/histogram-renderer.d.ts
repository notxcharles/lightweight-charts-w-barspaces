import { PricedValue } from '../model/price-scale';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';
import { IPaneRenderer } from './ipane-renderer';
export interface HistogramItem extends PricedValue, TimedValue {
    color: string;
}
export interface PaneRendererHistogramData {
    items: HistogramItem[];
    barSpacing: number;
    histogramBase: number;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class PaneRendererHistogram implements IPaneRenderer {
    private _data;
    private _precalculatedCache;
    setData(data: PaneRendererHistogramData): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
    private _fillPrecalculatedCache;
}
