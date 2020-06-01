import { TimePoint } from './time-data';
export declare type FormatFunction = (timePoint: TimePoint) => string;
export declare class FormattedLabelsCache {
    private readonly _format;
    private readonly _maxSize;
    private _actualSize;
    private _usageTick;
    private _oldestTick;
    private _cache;
    private _tick2Labels;
    constructor(format: FormatFunction, size?: number);
    format(value: TimePoint): string;
}
