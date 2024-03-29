import { isNaN } from './strict-type-checks';
/** @public */
var namedColorRgbHexStrings = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    feldspar: '#d19275',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslateblue: '#8470ff',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370d8',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#d87093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    violetred: '#d02090',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};
function normalizeInteger(min, n, max) {
    return (isNaN(n) ? min :
        n < min ? min :
            n > max ? max :
                Math.round(n));
}
function normalizeNumber(min, n, max) {
    return (isNaN(n) ? min :
        n < min ? min :
            n > max ? max :
                // limit the precision of all numbers to at most 4 digits in fractional part
                Math.round(n * 10000) / 10000);
}
function normalizeRgbComponent(component) {
    return normalizeInteger(0, component, 255);
}
function normalizeAlphaComponent(alpha) {
    return normalizeNumber(0, alpha, 1);
}
var RgbShortHexRepresentation;
(function (RgbShortHexRepresentation) {
    /**
     * @example
     * #fb0
     * @example
     * #f0f
     */
    RgbShortHexRepresentation.re = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
    function parse(matches) {
        return [
            normalizeRgbComponent(parseInt(matches[1] + matches[1], 16)),
            normalizeRgbComponent(parseInt(matches[2] + matches[2], 16)),
            normalizeRgbComponent(parseInt(matches[3] + matches[3], 16)),
        ];
    }
    RgbShortHexRepresentation.parse = parse;
})(RgbShortHexRepresentation || (RgbShortHexRepresentation = {}));
function tryParseRgbShortHexString(rgbShortHexString) {
    var matches = RgbShortHexRepresentation.re.exec(rgbShortHexString);
    return matches !== null ? RgbShortHexRepresentation.parse(matches) : null;
}
var RgbHexRepresentation;
(function (RgbHexRepresentation) {
    /**
     * @example
     * #00ff00
     * @example
     * #336699
     */
    RgbHexRepresentation.re = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
    function parse(matches) {
        return [
            normalizeRgbComponent(parseInt(matches[1], 16)),
            normalizeRgbComponent(parseInt(matches[2], 16)),
            normalizeRgbComponent(parseInt(matches[3], 16)),
        ];
    }
    RgbHexRepresentation.parse = parse;
})(RgbHexRepresentation || (RgbHexRepresentation = {}));
var RgbRepresentation;
(function (RgbRepresentation) {
    /**
     * @example
     * rgb(123, 234, 45)
     * @example
     * rgb(255,234,245)
     */
    RgbRepresentation.re = /^rgb\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*\)$/;
    function parse(matches) {
        return [
            normalizeRgbComponent(parseInt(matches[1], 10)),
            normalizeRgbComponent(parseInt(matches[2], 10)),
            normalizeRgbComponent(parseInt(matches[3], 10)),
        ];
    }
    RgbRepresentation.parse = parse;
})(RgbRepresentation || (RgbRepresentation = {}));
var RgbaRepresentation;
(function (RgbaRepresentation) {
    /**
     * @example
     * rgba(123, 234, 45, 1)
     * @example
     * rgba(255,234,245,0.1)
     */
    RgbaRepresentation.re = /^rgba\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?[\d]{0,10}(?:\.\d+)?)\s*\)$/;
    function parse(matches) {
        return [
            normalizeRgbComponent(parseInt(matches[1], 10)),
            normalizeRgbComponent(parseInt(matches[2], 10)),
            normalizeRgbComponent(parseInt(matches[3], 10)),
            normalizeAlphaComponent(parseFloat(matches[4])),
        ];
    }
    RgbaRepresentation.parse = parse;
})(RgbaRepresentation || (RgbaRepresentation = {}));
function tryParseRgbHexString(rgbHexString) {
    var matches = RgbHexRepresentation.re.exec(rgbHexString);
    return matches !== null ? RgbHexRepresentation.parse(matches) : null;
}
function tryParseRgbString(rgbString) {
    var matches = RgbRepresentation.re.exec(rgbString);
    return matches !== null ? RgbRepresentation.parse(matches) : null;
}
function tryParseRgbaString(rgbaString) {
    var matches = RgbaRepresentation.re.exec(rgbaString);
    return matches !== null ? RgbaRepresentation.parse(matches) : null;
}
function tryParseRgb(colorString) {
    colorString = colorString.toLowerCase();
    if (colorString in namedColorRgbHexStrings) {
        colorString = namedColorRgbHexStrings[colorString];
    }
    var rgbParseResult = tryParseRgbString(colorString);
    if (rgbParseResult !== null) {
        return rgbParseResult;
    }
    var rgbHexParseResult = tryParseRgbHexString(colorString);
    if (rgbHexParseResult !== null) {
        return rgbHexParseResult;
    }
    var rgbShortHexParseResult = tryParseRgbShortHexString(colorString);
    if (rgbShortHexParseResult !== null) {
        return rgbShortHexParseResult;
    }
    var rgbaParseResult = tryParseRgbaString(colorString);
    if (rgbaParseResult !== null) {
        return [rgbaParseResult[0], rgbaParseResult[1], rgbaParseResult[2]];
    }
    return null;
}
export function parseRgb(colorString) {
    var parseResult = tryParseRgb(colorString);
    if (parseResult !== null) {
        return parseResult;
    }
    else {
        throw new Error("Passed color string " + colorString + " does not match any of the known color representations");
    }
}
function rgbToGrayscale(rgbValue) {
    // Originally, the NTSC RGB to YUV formula
    // perfected by @eugene-korobko's black magic
    var redComponentGrayscaleWeight = 0.199;
    var greenComponentGrayscaleWeight = 0.687;
    var blueComponentGrayscaleWeight = 0.114;
    return (redComponentGrayscaleWeight * rgbValue[0] +
        greenComponentGrayscaleWeight * rgbValue[1] +
        blueComponentGrayscaleWeight * rgbValue[2]);
}
export function rgbToBlackWhiteString(rgbValue, threshold) {
    if (threshold < 0 || threshold > 255) {
        throw new Error('invalid threshold value, valid values are [0, 255]');
    }
    return rgbToGrayscale(rgbValue) >= threshold ? 'white' : 'black';
}
function rgba(rgb, alpha) {
    return [
        rgb[0],
        rgb[1],
        rgb[2],
        normalizeAlphaComponent(alpha),
    ];
}
function rgbaToString(rgbaValue) {
    return "rgba(" + rgbaValue[0] + ", " + rgbaValue[1] + ", " + rgbaValue[2] + ", " + rgbaValue[3] + ")";
}
export function resetTransparency(color) {
    if (isHexColor(color)) {
        return color;
    }
    return rgbaToString(rgba(parseRgb(color), 1));
}
export function colorWithTransparency(color, transparency) {
    return rgbaToString(rgba(parseRgb(color), transparency));
}
function isHexColor(color) {
    return color.indexOf('#') === 0;
}
export function generateTextColor(color) {
    var backColorBW = rgbToBlackWhiteString(parseRgb(color), 160);
    return backColorBW === 'black' ? 'white' : 'black';
}
