export declare class TextWidthCache {
    private readonly _maxSize;
    private _actualSize;
    private _usageTick;
    private _oldestTick;
    private _tick2Labels;
    private _cache;
    constructor(size?: number);
    reset(): void;
    measureText(ctx: CanvasRenderingContext2D, text: string, optimizationReplacementRe?: RegExp): number;
}
