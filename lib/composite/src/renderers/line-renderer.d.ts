import { PricedValue } from '../model/price-scale';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';
import { LinePoint, LineStyle, LineType, LineWidth } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
export declare type LineItem = TimedValue & PricedValue & LinePoint;
export interface PaneRendererLineData {
    lineType: LineType;
    items: LineItem[];
    lineColor: string;
    lineWidth: LineWidth;
    lineStyle: LineStyle;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class PaneRendererLine extends ScaledRenderer {
    protected _data: PaneRendererLineData | null;
    setData(data: PaneRendererLineData): void;
    protected _drawImpl(ctx: CanvasRenderingContext2D): void;
}
