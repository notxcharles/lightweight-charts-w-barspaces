import { IFormatter } from './iformatter';
export declare const formatterOptions: {
    decimalSign: string;
    decimalSignFractional: string;
};
export declare function numberToStringWithLeadingZero(value: number, length: number): string;
export declare class PriceFormatter implements IFormatter {
    protected _fractionalLength: number | undefined;
    private readonly _priceScale;
    private readonly _minMove;
    private readonly _minMove2;
    private readonly _fractional;
    constructor(priceScale?: number, minMove?: number, fractional?: boolean, minMove2?: number);
    format(price: number): string;
    private _calculateDecimal;
    private _formatAsDecimal;
    private _formatAsFractional;
}
