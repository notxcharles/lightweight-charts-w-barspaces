import { Nominal } from './nominal';
/**
 * Red component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export declare type RedComponent = Nominal<number, 'RedComponent'>;
/**
 * Green component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export declare type GreenComponent = Nominal<number, 'GreenComponent'>;
/**
 * Blue component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export declare type BlueComponent = Nominal<number, 'BlueComponent'>;
export declare type Rgb = [RedComponent, GreenComponent, BlueComponent];
export declare function parseRgb(colorString: string): Rgb;
export declare function rgbToBlackWhiteString(rgbValue: Rgb, threshold: number): 'black' | 'white';
export declare function resetTransparency(color: string): string;
export declare function colorWithTransparency(color: string, transparency: number): string;
export declare function generateTextColor(color: string): string;
