import { Coordinate } from '../model/coordinate';
import { SeriesItemsIndexesRange } from '../model/time-data';
import { LineStyle, LineType, LineWidth } from './draw-line';
import { LineItem } from './line-renderer';
import { ScaledRenderer } from './scaled-renderer';
export interface PaneRendererAreaData {
    items: LineItem[];
    lineType: LineType;
    lineColor: string;
    lineWidth: LineWidth;
    lineStyle: LineStyle;
    topColor: string;
    bottomColor: string;
    bottom: Coordinate;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class PaneRendererArea extends ScaledRenderer {
    protected _data: PaneRendererAreaData | null;
    setData(data: PaneRendererAreaData): void;
    protected _drawImpl(ctx: CanvasRenderingContext2D): void;
}
