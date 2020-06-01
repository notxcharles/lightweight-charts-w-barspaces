import { HoveredObject } from '../model/chart-model';
import { Coordinate } from '../model/coordinate';
import { SeriesMarkerShape } from '../model/series-markers';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';
import { ScaledRenderer } from './scaled-renderer';
export interface SeriesMarkerText {
    content: string;
    y: Coordinate;
    width: number;
    height: number;
}
export interface SeriesMarkerRendererDataItem extends TimedValue {
    y: Coordinate;
    size: Coordinate;
    shape: SeriesMarkerShape;
    color: string;
    internalId: number;
    externalId?: string;
    text?: SeriesMarkerText;
}
export interface SeriesMarkerRendererData {
    items: SeriesMarkerRendererDataItem[];
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare class SeriesMarkersRenderer extends ScaledRenderer {
    private _data;
    private _textWidthCache;
    private _fontSize;
    private _fontFamily;
    private _font;
    setData(data: SeriesMarkerRendererData): void;
    setParams(fontSize: number, fontFamily: string): void;
    hitTest(x: Coordinate, y: Coordinate): HoveredObject | null;
    protected _drawImpl(ctx: CanvasRenderingContext2D, isHovered: boolean, hitTestData?: unknown): void;
}
