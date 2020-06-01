import { LineStyle, LineWidth } from '../renderers/draw-line';
import { IPaneView } from '../views/pane/ipane-view';
import { IPriceAxisView } from '../views/price-axis/iprice-axis-view';
import { TimeAxisView } from '../views/time-axis/time-axis-view';
import { ChartModel } from './chart-model';
import { Coordinate } from './coordinate';
import { DataSource } from './data-source';
import { Pane } from './pane';
import { PriceScale } from './price-scale';
import { TimePoint, TimePointIndex } from './time-data';
export interface CrosshairPriceAndCoordinate {
    price: number;
    coordinate: number;
}
export interface CrosshairTimeAndCoordinate {
    time: TimePoint | null;
    coordinate: number;
}
export declare type PriceAndCoordinateProvider = (priceScale: PriceScale) => CrosshairPriceAndCoordinate;
export declare type TimeAndCoordinateProvider = () => CrosshairTimeAndCoordinate;
/**
 * Enum of possible crosshair behavior modes.
 * Normal means that the crosshair always follows the pointer.
 * Magnet means that the vertical line of the crosshair follows the pointer, while the horizontal line is placed on the corresponding series point.
 */
export declare const enum CrosshairMode {
    Normal = 0,
    Magnet = 1
}
/** Structure describing a crosshair line (vertical or horizontal) */
export interface CrosshairLineOptions {
    /** Color of a certain crosshair line */
    color: string;
    /** Width of a certain crosshair line and corresponding scale label */
    width: LineWidth;
    /** Style of a certain crosshair line */
    style: LineStyle;
    /** Visibility of a certain crosshair line */
    visible: boolean;
    /** Visibility of corresponding scale label */
    labelVisible: boolean;
    /** Background color of corresponding scale label */
    labelBackgroundColor: string;
}
/** Structure describing crosshair options  */
export interface CrosshairOptions {
    /** Crosshair mode */
    mode: CrosshairMode;
    /** Options of the crosshair vertical line */
    vertLine: CrosshairLineOptions;
    /** Options of the crosshair horizontal line */
    horzLine: CrosshairLineOptions;
}
export declare class Crosshair extends DataSource {
    private _pane;
    private _price;
    private _index;
    private _visible;
    private readonly _model;
    private _priceAxisViews;
    private readonly _timeAxisView;
    private readonly _markersPaneView;
    private _subscribed;
    private readonly _currentPosPriceProvider;
    private readonly _options;
    private readonly _paneView;
    private _x;
    private _y;
    private _originX;
    private _originY;
    constructor(model: ChartModel, options: CrosshairOptions);
    index(): TimePointIndex;
    options(): Readonly<CrosshairOptions>;
    saveOriginCoord(x: Coordinate, y: Coordinate): void;
    clearOriginCoord(): void;
    originCoordX(): Coordinate;
    originCoordY(): Coordinate;
    setPosition(index: TimePointIndex, price: number, pane: Pane): void;
    appliedIndex(): TimePointIndex;
    appliedX(): Coordinate;
    appliedY(): Coordinate;
    visible(): boolean;
    clearPosition(): void;
    paneViews(pane: Pane): ReadonlyArray<IPaneView>;
    horzLineVisible(pane: Pane): boolean;
    vertLineVisible(): boolean;
    priceAxisViews(pane: Pane, priceScale: PriceScale): IPriceAxisView[];
    timeAxisViews(): ReadonlyArray<TimeAxisView>;
    pane(): Pane | null;
    updateAllViews(): void;
    private _priceScaleByPane;
    private _tryToUpdateViews;
    private _tryToUpdateData;
    private _setIndexToLastSeriesBarIndex;
    private _createPriceAxisViewOnDemand;
}
