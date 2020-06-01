import { SeriesItemsIndexesRange } from '../model/time-data';
import { LinePoint, LineType } from './draw-line';
/**
 * BEWARE: The method must be called after beginPath and before stroke/fill/closePath/etc
 */
export declare function walkLine(ctx: CanvasRenderingContext2D, points: ReadonlyArray<LinePoint>, lineType: LineType, visibleRange: SeriesItemsIndexesRange): void;
