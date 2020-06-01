import { TickMark, TimePoint } from './time-data';
export declare class TickMarks {
    private _minIndex;
    private _maxIndex;
    private _marksByIndex;
    private _marksBySpan;
    private _changed;
    private _cache;
    private _maxBar;
    reset(): void;
    merge(tickMarks: TickMark[]): void;
    indexToTime(index: number): TimePoint | null;
    nearestIndex(time: number): number;
    build(spacing: number, maxWidth: number): TickMark[];
    private _removeTickMark;
}
