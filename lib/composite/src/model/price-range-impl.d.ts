import { PriceRange } from './series-options';
export declare class PriceRangeImpl {
    private _minValue;
    private _maxValue;
    constructor(minValue: number, maxValue: number);
    equals(pr: PriceRangeImpl | null): boolean;
    clone(): PriceRangeImpl;
    minValue(): number;
    setMinValue(v: number): void;
    maxValue(): number;
    setMaxValue(v: number): void;
    length(): number;
    isEmpty(): boolean;
    merge(anotherRange: PriceRangeImpl | null): PriceRangeImpl;
    apply(min: number, max: number): void;
    set(min: number, max: number): void;
    scaleAroundCenter(coeff: number): void;
    shift(delta: number): void;
    containsStrictly(priceRange: PriceRangeImpl): boolean;
    toRaw(): PriceRange;
    static fromRaw(raw: PriceRange | null): PriceRangeImpl | null;
}
