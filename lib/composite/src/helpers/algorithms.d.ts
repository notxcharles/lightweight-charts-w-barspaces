/**
 * Binary function that accepts two arguments (the first of the type of array elements, and the second is always val), and returns a value convertible to bool.
 * The value returned indicates whether the first argument is considered to go before the second.
 * The function shall not modify any of its arguments.
 */
export declare type LowerBoundComparatorType<TArrayElementType, TValueType> = (a: TArrayElementType, b: TValueType) => boolean;
export declare function lowerbound<TArrayElementType, TValueType>(arr: ReadonlyArray<TArrayElementType>, value: TValueType, compare: LowerBoundComparatorType<TArrayElementType, TValueType>, start?: number, to?: number): number;
/**
 * Binary function that accepts two arguments (the first is always val, and the second of the type of array elements), and returns a value convertible to bool.
 * The value returned indicates whether the first argument is considered to go before the second.
 * The function shall not modify any of its arguments.
 */
export declare type UpperBoundComparatorType<TValueType, TArrayElementType> = (a: TValueType, b: TArrayElementType) => boolean;
export declare function upperbound<TArrayElementType, TValueType>(arr: TArrayElementType[], value: TValueType, compare: UpperBoundComparatorType<TValueType, TArrayElementType>, start?: number, to?: number): number;
