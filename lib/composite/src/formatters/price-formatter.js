import { isInteger, isNumber } from '../helpers/strict-type-checks';
export var formatterOptions = {
    decimalSign: '.',
    decimalSignFractional: '\'',
};
// length mustn't be more then 16
export function numberToStringWithLeadingZero(value, length) {
    if (!isNumber(value)) {
        return 'n/a';
    }
    if (!isInteger(length)) {
        throw new TypeError('invalid length');
    }
    if (length < 0 || length > 16) {
        throw new TypeError('invalid length');
    }
    if (length === 0) {
        return value.toString();
    }
    var dummyString = '0000000000000000';
    return (dummyString + value.toString()).slice(-length);
}
var PriceFormatter = /** @class */ (function () {
    function PriceFormatter(priceScale, minMove, fractional, minMove2) {
        if (!minMove) {
            minMove = 1;
        }
        if (!isNumber(priceScale) || !isInteger(priceScale)) {
            priceScale = 100;
        }
        if (priceScale < 0) {
            throw new TypeError('invalid base');
        }
        this._priceScale = priceScale;
        this._minMove = minMove;
        this._minMove2 = minMove2;
        if (fractional && minMove2 !== undefined && minMove2 > 0 && minMove2 !== 2 && minMove2 !== 4 && minMove2 !== 8) {
            return;
        }
        this._fractional = fractional;
        this._calculateDecimal();
    }
    PriceFormatter.prototype.format = function (price) {
        // \u2212 is unicode's minus sign https://www.fileformat.info/info/unicode/char/2212/index.htm
        // we should use it because it has the same width as plus sign +
        var sign = price < 0 ? '\u2212' : '';
        price = Math.abs(price);
        if (this._fractional) {
            return sign + this._formatAsFractional(price);
        }
        return sign + this._formatAsDecimal(price);
    };
    PriceFormatter.prototype._calculateDecimal = function () {
        // check if this._base is power of 10
        // for double fractional _fractionalLength if for the main fractional only
        this._fractionalLength = 0;
        if (this._priceScale > 0 && this._minMove > 0) {
            var base = this._priceScale;
            if (this._fractional && this._minMove2) {
                base /= this._minMove2;
            }
            while (base > 1) {
                base /= 10;
                this._fractionalLength++;
            }
        }
    };
    PriceFormatter.prototype._formatAsDecimal = function (price) {
        var base;
        if (this._fractional) {
            // if you really want to format fractional as decimal
            base = Math.pow(10, (this._fractionalLength || 0));
        }
        else {
            base = this._priceScale / this._minMove;
        }
        var intPart = Math.floor(price);
        var fracString = '';
        var fracLength = this._fractionalLength !== undefined ? this._fractionalLength : NaN;
        if (base > 1) {
            var fracPart = +(Math.round(price * base) - intPart * base).toFixed(this._fractionalLength);
            if (fracPart >= base) {
                fracPart -= base;
                intPart += 1;
            }
            fracString = formatterOptions.decimalSign + numberToStringWithLeadingZero(+fracPart.toFixed(this._fractionalLength) * this._minMove, fracLength);
        }
        else {
            // should round int part to min move
            intPart = Math.round(intPart * base) / base;
            // if min move > 1, fractional part is always = 0
            if (fracLength > 0) {
                fracString = formatterOptions.decimalSign + numberToStringWithLeadingZero(0, fracLength);
            }
        }
        return intPart.toFixed(0) + fracString;
    };
    PriceFormatter.prototype._formatAsFractional = function (price) {
        // temporary solution - use decimal format with 2 digits
        var base = this._priceScale / this._minMove;
        var intPart = Math.floor(price);
        var fracPart = Math.round(price * base) - intPart * base;
        if (fracPart === base) {
            fracPart = 0;
            intPart += 1;
        }
        if (!this._fractionalLength) {
            throw new Error('_fractionalLength is not calculated');
        }
        var fracString = '';
        if (this._minMove2) {
            var minmove2 = ['0', '5'];
            var minmove4 = ['0', '2', '5', '7'];
            var minmove8 = ['0', '1', '2', '3', '4', '5', '6', '7'];
            // format double fractional
            var secondFract = fracPart % this._minMove2;
            fracPart = (fracPart - secondFract) / this._minMove2;
            var part1 = numberToStringWithLeadingZero(fracPart, this._fractionalLength);
            var part2 = this._minMove2 === 2 ?
                minmove2[secondFract] :
                this._minMove2 === 8 ?
                    minmove8[secondFract] :
                    minmove4[secondFract];
            fracString = part1 + formatterOptions.decimalSignFractional + part2;
        }
        else {
            fracString = numberToStringWithLeadingZero(fracPart * this._minMove, this._fractionalLength);
        }
        return intPart.toString() + formatterOptions.decimalSignFractional + fracString;
    };
    return PriceFormatter;
}());
export { PriceFormatter };
