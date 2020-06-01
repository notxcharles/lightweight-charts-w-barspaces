import { IFormatter } from '../formatters/iformatter';
import { ISubscription } from '../helpers/isubscription';
import { DeepPartial } from '../helpers/strict-type-checks';
import { BarCoordinates, BarPrice, BarPrices } from './bar';
import { Coordinate } from './coordinate';
import { IPriceDataSource } from './iprice-data-source';
import { LayoutOptions } from './layout-options';
import { LocalizationOptions } from './localization-options';
import { PriceRangeImpl } from './price-range-impl';
import { RangeImpl } from './range-impl';
import { SeriesItemsIndexesRange, TimePointIndex } from './time-data';
/**
 * Enum of possible price scale modes
 * Normal mode displays original price values
 * Logarithmic mode makes price scale show logarithms of series values instead of original values
 * Percentage turns the percentage mode on.
 * IndexedTo100 turns the "indexed to 100" mode on
 */
export declare const enum PriceScaleMode {
    Normal = 0,
    Logarithmic = 1,
    Percentage = 2,
    IndexedTo100 = 3
}
export interface PriceScaleState {
    autoScale: boolean;
    isInverted: boolean;
    mode: PriceScaleMode;
}
export interface PriceMark {
    coord: Coordinate;
    label: string;
}
export interface PricedValue {
    price: BarPrice;
    y: Coordinate;
}
/** Defines margins of the price scale */
export interface PriceScaleMargins {
    /** Top margin in percentages. Must be greater or equal to 0 and less than 100 */
    top: number;
    /** Bottom margin in percentages. Must be greater or equal to 0 and less than 100 */
    bottom: number;
}
export declare type PriceAxisPosition = 'left' | 'right' | 'none';
/** Structure that describes price scale options */
export interface PriceScaleOptions {
    /** True makes chart calculate the price range automatically based on the visible data range */
    autoScale: boolean;
    /** Mode of the price scale */
    mode: PriceScaleMode;
    /** True inverts the scale. Makes larger values drawn lower. Affects both the price scale and the data on the chart */
    invertScale: boolean;
    /** True value prevents labels on the price scale from overlapping one another by aligning them one below others */
    alignLabels: boolean;
    /** Defines price margins for the price scale */
    scaleMargins: PriceScaleMargins;
    /** Set true to draw a border between the price scale and the chart area */
    borderVisible: boolean;
    /** Defines a color of the border between the price scale and the chart area. It is ignored if borderVisible is false */
    borderColor: string;
    /** Indicates whether the price scale displays only full lines of text or partial lines. */
    entireTextOnly: boolean;
    /** Indicates if this price scale visible. Could not be applied to overlay price scale */
    visible: boolean;
}
export declare class PriceScale {
    private readonly _id;
    private readonly _layoutOptions;
    private readonly _localizationOptions;
    private readonly _options;
    private _height;
    private _internalHeightCache;
    private _internalHeightChanged;
    private _priceRange;
    private _priceRangeSnapshot;
    private _priceRangeChanged;
    private _invalidatedForRange;
    private _marginAbove;
    private _marginBelow;
    private _markBuilder;
    private _onMarksChanged;
    private _modeChanged;
    private _dataSources;
    private _cachedOrderedSources;
    private _marksCache;
    private _scaleStartPoint;
    private _scrollStartPoint;
    private _formatter;
    private readonly _optionsChanged;
    constructor(id: string, options: PriceScaleOptions, layoutOptions: LayoutOptions, localizationOptions: LocalizationOptions);
    id(): string;
    options(): Readonly<PriceScaleOptions>;
    applyOptions(options: DeepPartial<PriceScaleOptions>): void;
    optionsChanged(): ISubscription;
    isAutoScale(): boolean;
    isLog(): boolean;
    isPercentage(): boolean;
    isIndexedTo100(): boolean;
    mode(): PriceScaleState;
    setMode(newMode: Partial<PriceScaleState>): void;
    modeChanged(): ISubscription<PriceScaleState, PriceScaleState>;
    fontSize(): number;
    height(): number;
    setHeight(value: number): void;
    internalHeight(): number;
    internalHeightChanged(): ISubscription;
    priceRange(): PriceRangeImpl | null;
    priceRangeChanged(): ISubscription<PriceRangeImpl | null, PriceRangeImpl | null>;
    setPriceRange(newPriceRange: PriceRangeImpl | null, isForceSetValue?: boolean, onlyPriceScaleUpdate?: boolean): void;
    isEmpty(): boolean;
    invertedCoordinate(coordinate: number): number;
    priceToCoordinate(price: number, baseValue: number): Coordinate;
    pointsArrayToCoordinates<T extends PricedValue>(points: T[], baseValue: number, visibleRange?: SeriesItemsIndexesRange): void;
    barPricesToCoordinates<T extends BarPrices & BarCoordinates>(pricesList: T[], baseValue: number, visibleRange?: SeriesItemsIndexesRange): void;
    coordinateToPrice(coordinate: Coordinate, baseValue: number): BarPrice;
    logicalToPrice(logical: number, baseValue: number): BarPrice;
    dataSources(): ReadonlyArray<IPriceDataSource>;
    orderedSources(): ReadonlyArray<IPriceDataSource>;
    addDataSource(source: IPriceDataSource): void;
    removeDataSource(source: IPriceDataSource): void;
    firstValue(): number | null;
    isInverted(): boolean;
    marks(): PriceMark[];
    onMarksChanged(): ISubscription;
    startScale(x: number): void;
    scaleTo(x: number): void;
    endScale(): void;
    startScroll(x: number): void;
    scrollTo(x: number): void;
    endScroll(): void;
    formatter(): IFormatter;
    formatPrice(price: number, firstValue: number): string;
    formatLogical(logical: number): string;
    formatPriceAbsolute(price: number): string;
    formatPricePercentage(price: number, baseValue: number): string;
    sourcesForAutoScale(): ReadonlyArray<IPriceDataSource>;
    recalculatePriceRange(visibleBars: RangeImpl<TimePointIndex>): void;
    updateAllViews(): void;
    updateFormatter(): void;
    invalidateSourcesCache(): void;
    /**
     * Returns the source which will be used as "formatter source" (take minMove for formatter)
     */
    private _formatterSource;
    private _topMarginPx;
    private _bottomMarginPx;
    private _makeSureItIsValid;
    private _invalidateInternalHeightCache;
    private _logicalToCoordinate;
    private _coordinateToLogical;
    private _onIsInvertedChanged;
    private _recalculatePriceRangeImpl;
    private _getCoordinateTransformer;
    private _formatPrice;
}
