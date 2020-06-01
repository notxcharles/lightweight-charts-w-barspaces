import { TimePoint, TimePointIndex, UTCTimestamp } from './time-data';
/**
 * This is the collection of time points, that allows to store and find the every time point using it's index.
 */
export declare class TimePoints {
    private _items;
    clear(): void;
    size(): number;
    firstIndex(): TimePointIndex | null;
    lastIndex(): TimePointIndex | null;
    merge(index: TimePointIndex, values: TimePoint[]): void;
    valueAt(index: TimePointIndex): TimePoint | null;
    indexOf(time: UTCTimestamp, findNearest: boolean): TimePointIndex | null;
    closestIndexLeft(time: TimePoint): TimePointIndex | null;
    private _offsetToIndex;
    private _indexToOffset;
}
