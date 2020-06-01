/**
 * Default font family.
 * Must be used to generate font string when font is not specified.
 */
export declare const defaultFontFamily = "'Trebuchet MS', Roboto, Ubuntu, sans-serif";
/**
 * Generates a font string, which can be used to set in canvas' font property.
 * If no family provided, [defaultFontFamily] will be used.
 */
export declare function makeFont(size: number, family?: string, style?: string): string;
