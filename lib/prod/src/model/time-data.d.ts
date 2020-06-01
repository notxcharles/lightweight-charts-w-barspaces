import { Nominal } from '../helpers/nominal';
import { Coordinate } from './coordinate';
import { RangeImpl } from './range-impl';
export declare type UTCTimestamp = Nominal<number, 'UTCTimestamp'>;
export interface BusinessDay {
    year: number;
    month: number;
    day: number;
}
export interface TimePoint {
    timestamp: UTCTimestamp;
    businessDay?: BusinessDay;
}
export interface Range<T> {
    from: T;
    to: T;
}
export declare type TimePointsRange = Range<TimePoint>;
export declare type TimePointIndex = Nominal<number, 'TimePointIndex'>;
export declare type Logical = Nominal<number, 'Logical'>;
export declare type LogicalRange = Range<Logical>;
export interface TickMark {
    index: TimePointIndex;
    span: number;
    time: TimePoint;
}
export interface TimedValue {
    time: TimePointIndex;
    x: Coordinate;
}
export declare type SeriesItemsIndexesRange = Range<number>;
export declare function visibleTimedValues(items: TimedValue[], range: RangeImpl<TimePointIndex>, extendedRange: boolean): SeriesItemsIndexesRange;
