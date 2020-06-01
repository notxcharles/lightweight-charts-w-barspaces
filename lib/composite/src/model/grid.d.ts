import { LineStyle } from '../renderers/draw-line';
import { IPaneView } from '../views/pane/ipane-view';
import { Pane } from './pane';
/** Structure describing horizontal or vertical grid line options */
export interface GridLineOptions {
    /** Color of the lines */
    color: string;
    /** Style of the lines */
    style: LineStyle;
    /** Visibility of the lines */
    visible: boolean;
}
/** Structure describing grid options */
export interface GridOptions {
    /** Vertical grid line options */
    vertLines: GridLineOptions;
    /** Horizontal grid line options */
    horzLines: GridLineOptions;
}
export declare class Grid {
    private _paneViews;
    private _invalidated;
    paneViews(pane: Pane): ReadonlyArray<IPaneView>;
    invalidate(): void;
}
