import { ISubscription } from '../helpers/isubscription';
import { DeepPartial } from '../helpers/strict-type-checks';
import { ChartModel } from './chart-model';
import { Coordinate } from './coordinate';
import { LocalizationOptions } from './localization-options';
import { RangeImpl } from './range-impl';
import { TickMarks } from './tick-marks';
import { Logical, LogicalRange, SeriesItemsIndexesRange, TickMark, TimedValue, TimePoint, TimePointIndex, TimePointsRange } from './time-data';
import { TimePoints } from './time-points';
export interface TimeMark {
    coord: number;
    label: string;
    span: number;
    major: boolean;
}
export declare const enum TickMarkType {
    Year = 0,
    Month = 1,
    DayOfMonth = 2,
    Time = 3,
    TimeWithSeconds = 4
}
export declare type TickMarkFormatter = (timePoint: TimePoint, tickMarkType: TickMarkType, locale: string) => string;
export interface TimeScaleOptions {
    rightOffset: number;
    barSpacing: number;
    fixLeftEdge: boolean;
    lockVisibleTimeRangeOnResize: boolean;
    rightBarStaysOnScroll: boolean;
    borderVisible: boolean;
    borderColor: string;
    visible: boolean;
    timeVisible: boolean;
    secondsVisible: boolean;
    tickMarkFormatter: TickMarkFormatter;
}
export declare class TimeScale {
    private readonly _options;
    private readonly _model;
    private readonly _localizationOptions;
    private _dateTimeFormatter;
    private _width;
    private _baseIndexOrNull;
    private _rightOffset;
    private _points;
    private _barSpacing;
    private _scrollStartPoint;
    private _scaleStartPoint;
    private readonly _tickMarks;
    private _formattedBySpan;
    private _visibleRange;
    private _visibleRangeInvalidated;
    private readonly _visibleBarsChanged;
    private readonly _logicalRangeChanged;
    private readonly _optionsApplied;
    private _leftEdgeIndex;
    private _commonTransitionStartState;
    private _timeMarksCache;
    private _labels;
    constructor(model: ChartModel, options: TimeScaleOptions, localizationOptions: LocalizationOptions);
    options(): Readonly<TimeScaleOptions>;
    applyLocalizationOptions(localizationOptions: DeepPartial<LocalizationOptions>): void;
    applyOptions(options: DeepPartial<TimeScaleOptions>, localizationOptions?: DeepPartial<LocalizationOptions>): void;
    isEmpty(): boolean;
    visibleStrictRange(): RangeImpl<TimePointIndex> | null;
    visibleLogicalRange(): RangeImpl<Logical> | null;
    visibleTimeRange(): TimePointsRange | null;
    timeRangeForLogicalRange(range: LogicalRange): TimePointsRange;
    logicalRangeForTimeRange(range: TimePointsRange): LogicalRange;
    tickMarks(): TickMarks;
    points(): TimePoints;
    width(): number;
    setWidth(width: number): void;
    indexToCoordinate(index: TimePointIndex): Coordinate;
    indexesToCoordinates<T extends TimedValue>(points: T[], visibleRange?: SeriesItemsIndexesRange): void;
    indexToUserTime(index: TimePointIndex): TimePoint | null;
    coordinateToIndex(x: Coordinate): TimePointIndex;
    setRightOffset(offset: number): void;
    barSpacing(): number;
    setBarSpacing(newBarSpacing: number): void;
    rightOffset(): number;
    marks(): TimeMark[] | null;
    reset(): void;
    restoreDefault(): void;
    fixLeftEdge(): boolean;
    setBaseIndex(baseIndex: TimePointIndex): void;
    /**
     * Zoom in/out the scale around a `zoomPoint` on `scale` value.
     * @param zoomPoint - X coordinate of the point to apply the zoom.
     *   If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
     * @param scale - Zoom value (in 1/10 parts of current bar spacing).
     *   Negative value means zoom out, positive - zoom in.
     */
    zoom(zoomPoint: Coordinate, scale: number): void;
    startScale(x: Coordinate): void;
    scaleTo(x: Coordinate): void;
    endScale(): void;
    startScroll(x: Coordinate): void;
    scrollTo(x: Coordinate): void;
    endScroll(): void;
    scrollToRealTime(): void;
    scrollToOffsetAnimated(offset: number, animationDuration?: number): void;
    update(index: TimePointIndex, values: TimePoint[], marks: TickMark[]): void;
    visibleBarsChanged(): ISubscription;
    logicalRangeChanged(): ISubscription;
    optionsApplied(): ISubscription;
    baseIndex(): TimePointIndex;
    setVisibleRange(range: RangeImpl<TimePointIndex>): void;
    fitContent(): void;
    setLogicalRange(range: LogicalRange): void;
    formatDateTime(time: TimePoint): string;
    private _rightOffsetForCoordinate;
    private _coordinateToFloatIndex;
    private _setBarSpacing;
    private _updateVisibleRange;
    private _correctBarSpacing;
    private _correctOffset;
    private _minRightOffset;
    private _maxRightOffset;
    private _saveCommonTransitionsStartState;
    private _clearCommonTransitionsStartState;
    private _formatLabel;
    private _formatLabelImpl;
    private _setVisibleRange;
    private _resetTimeMarksCache;
    private _invalidateTickMarks;
    private _updateDateTimeFormatter;
    private _fixLeftEdge;
}
