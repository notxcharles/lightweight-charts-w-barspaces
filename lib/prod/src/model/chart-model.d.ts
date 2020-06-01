import { IDestroyable } from '../helpers/idestroyable';
import { ISubscription } from '../helpers/isubscription';
import { DeepPartial } from '../helpers/strict-type-checks';
import { PriceAxisViewRendererOptions } from '../renderers/iprice-axis-view-renderer';
import { PriceAxisRendererOptionsProvider } from '../renderers/price-axis-renderer-options-provider';
import { Coordinate } from './coordinate';
import { Crosshair, CrosshairOptions } from './crosshair';
import { Grid, GridOptions } from './grid';
import { InvalidateMask } from './invalidate-mask';
import { IPriceDataSource } from './iprice-data-source';
import { LayoutOptions } from './layout-options';
import { LocalizationOptions } from './localization-options';
import { Pane } from './pane';
import { Point } from './point';
import { PriceScale, PriceScaleOptions } from './price-scale';
import { Series } from './series';
import { SeriesOptionsMap, SeriesType } from './series-options';
import { LogicalRange, TickMark, TimePoint, TimePointIndex } from './time-data';
import { TimeScale, TimeScaleOptions } from './time-scale';
import { Watermark, WatermarkOptions } from './watermark';
export interface HandleScrollOptions {
    mouseWheel: boolean;
    pressedMouseMove: boolean;
    horzTouchDrag: boolean;
    vertTouchDrag: boolean;
}
export interface HandleScaleOptions {
    mouseWheel: boolean;
    pinch: boolean;
    axisPressedMouseMove: AxisPressedMouseMoveOptions | boolean;
    axisDoubleClickReset: boolean;
}
declare type HandleScaleOptionsInternal = Omit<HandleScaleOptions, 'axisPressedMouseMove'> & {
    axisPressedMouseMove: AxisPressedMouseMoveOptions;
};
export interface AxisPressedMouseMoveOptions {
    time: boolean;
    price: boolean;
}
export interface HoveredObject {
    hitTestData?: unknown;
    externalId?: string;
}
export interface HoveredSource {
    source: IPriceDataSource;
    object?: HoveredObject;
}
export interface PriceScaleOnPane {
    priceScale: PriceScale;
    pane: Pane;
}
declare type InvalidateHandler = (mask: InvalidateMask) => void;
export declare type VisiblePriceScaleOptions = PriceScaleOptions;
export declare type OverlayPriceScaleOptions = Omit<PriceScaleOptions, 'visible' | 'autoScale'>;
/**
 * Structure describing options of the chart. Series options are to be set separately
 */
export interface ChartOptions {
    /** Width of the chart */
    width: number;
    /** Height of the chart */
    height: number;
    /** Structure with watermark options */
    watermark: WatermarkOptions;
    /** Structure with layout options */
    layout: LayoutOptions;
    /** Structure with price scale option for left price scale */
    leftPriceScale: VisiblePriceScaleOptions;
    /** Structure with price scale option for right price scale */
    rightPriceScale: VisiblePriceScaleOptions;
    /** Structure describing default price scale options for overlays */
    overlayPriceScales: OverlayPriceScaleOptions;
    /** Structure with time scale options */
    timeScale: TimeScaleOptions;
    /** Structure with crosshair options */
    crosshair: CrosshairOptions;
    /** Structure with grid options */
    grid: GridOptions;
    /** Structure with localization options */
    localization: LocalizationOptions;
    /** Structure that describes scrolling behavior or boolean flag that disables/enables all kinds of scrolls */
    handleScroll: HandleScrollOptions | boolean;
    /** Structure that describes scaling behavior or boolean flag that disables/enables all kinds of scales */
    handleScale: HandleScaleOptions | boolean;
}
export declare type ChartOptionsInternal = Omit<ChartOptions, 'handleScroll' | 'handleScale' | 'priceScale'> & {
    handleScroll: HandleScrollOptions;
    handleScale: HandleScaleOptionsInternal;
};
export declare class ChartModel implements IDestroyable {
    private readonly _options;
    private readonly _invalidateHandler;
    private readonly _rendererOptionsProvider;
    private readonly _timeScale;
    private readonly _panes;
    private readonly _grid;
    private readonly _crosshair;
    private readonly _magnet;
    private readonly _watermark;
    private _serieses;
    private _width;
    private _initialTimeScrollPos;
    private _hoveredSource;
    private readonly _priceScalesOptionsChanged;
    private _crosshairMoved;
    constructor(invalidateHandler: InvalidateHandler, options: ChartOptionsInternal);
    fullUpdate(): void;
    lightUpdate(): void;
    updateSource(source: IPriceDataSource): void;
    hoveredSource(): HoveredSource | null;
    setHoveredSource(source: HoveredSource | null): void;
    options(): Readonly<ChartOptionsInternal>;
    applyOptions(options: DeepPartial<ChartOptionsInternal>): void;
    applyPriceScaleOptions(priceScaleId: string, options: DeepPartial<PriceScaleOptions>): void;
    findPriceScale(priceScaleId: string): PriceScaleOnPane | null;
    updateAllPaneViews(): void;
    timeScale(): TimeScale;
    panes(): ReadonlyArray<Pane>;
    gridSource(): Grid;
    watermarkSource(): Watermark | null;
    crosshairSource(): Crosshair;
    crosshairMoved(): ISubscription<TimePointIndex | null, Point | null>;
    width(): number;
    setPaneHeight(pane: Pane, height: number): void;
    setWidth(width: number): void;
    createPane(index?: number): Pane;
    startScalePrice(pane: Pane, priceScale: PriceScale, x: number): void;
    scalePriceTo(pane: Pane, priceScale: PriceScale, x: number): void;
    endScalePrice(pane: Pane, priceScale: PriceScale): void;
    startScrollPrice(pane: Pane, priceScale: PriceScale, x: number): void;
    scrollPriceTo(pane: Pane, priceScale: PriceScale, x: number): void;
    endScrollPrice(pane: Pane, priceScale: PriceScale): void;
    setPriceAutoScale(pane: Pane, priceScale: PriceScale, autoScale: boolean): void;
    resetPriceScale(pane: Pane, priceScale: PriceScale): void;
    startScaleTime(position: Coordinate): void;
    /**
     * Zoom in/out the chart (depends on scale value).
     * @param pointX - X coordinate of the point to apply the zoom (the point which should stay on its place)
     * @param scale - Zoom value. Negative value means zoom out, positive - zoom in.
     */
    zoomTime(pointX: Coordinate, scale: number): void;
    scrollChart(x: Coordinate): void;
    scaleTimeTo(x: Coordinate): void;
    endScaleTime(): void;
    startScrollTime(x: Coordinate): void;
    scrollTimeTo(x: Coordinate): boolean;
    endScrollTime(): void;
    resetTimeScale(): void;
    invalidate(mask: InvalidateMask): void;
    serieses(): ReadonlyArray<Series>;
    setAndSaveCurrentPosition(x: Coordinate, y: Coordinate, pane: Pane): void;
    clearCurrentPosition(): void;
    updateCrosshair(): void;
    updateTimeScale(index: TimePointIndex, values: TimePoint[], marks: TickMark[], clearFlag: boolean): void;
    updateTimeScaleBaseIndex(earliestRowIndex?: TimePointIndex): void;
    recalculatePane(pane: Pane | null): void;
    paneForSource(source: IPriceDataSource): Pane | null;
    recalculateAllPanes(): void;
    destroy(): void;
    rendererOptionsProvider(): PriceAxisRendererOptionsProvider;
    priceAxisRendererOptions(): Readonly<PriceAxisViewRendererOptions>;
    priceScalesOptionsChanged(): ISubscription;
    createSeries<T extends SeriesType>(seriesType: T, options: SeriesOptionsMap[T]): Series<T>;
    removeSeries(series: Series): void;
    moveSeriesToScale(series: Series, targetScaleId: string): void;
    fitContent(): void;
    setTargetLogicalRange(range: LogicalRange): void;
    defaultVisiblePriceScaleId(): string;
    private _paneInvalidationMask;
    private _invalidationMaskForSource;
    private _invalidate;
    private _cursorUpdate;
    private _createSeries;
}
export {};
