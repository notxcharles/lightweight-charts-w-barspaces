import { LogicalRange } from '../model/time-data';
export declare const enum InvalidationLevel {
    None = 0,
    Cursor = 1,
    Light = 2,
    Full = 3
}
export interface PaneInvalidation {
    level: InvalidationLevel;
    autoScale?: boolean;
}
export declare class InvalidateMask {
    private _invalidatedPanes;
    private _globalLevel;
    private _force;
    private _fitContent;
    private _logicalRange;
    constructor(globalLevel: InvalidationLevel);
    invalidatePane(paneIndex: number, invalidation: PaneInvalidation): void;
    invalidateAll(level: InvalidationLevel): void;
    fullInvalidation(): InvalidationLevel;
    invalidateForPane(paneIndex: number): PaneInvalidation;
    setFitContent(): void;
    getFitContent(): boolean;
    setLogicalRange(range: LogicalRange): void;
    getLogicalRange(): LogicalRange | null;
    merge(other: InvalidateMask): void;
}
