export declare type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer X> ? ReadonlyArray<DeepPartial<X>> : DeepPartial<T[P]>;
};
export declare function merge(dst: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any>;
export declare function isNumber(value: unknown): value is number;
export declare function isInteger(value: unknown): boolean;
export declare function isString(value: unknown): value is string;
export declare function isNaN(value: number): boolean;
export declare function isBoolean(value: unknown): value is boolean;
export declare function clone<T>(object: T): T;
export declare function notNull<T>(t: T | null): t is T;
export declare function undefinedIfNull<T>(t: T | null): T | undefined;
