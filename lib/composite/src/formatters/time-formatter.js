import { numberToStringWithLeadingZero } from './price-formatter';
var TimeFormatter = /** @class */ (function () {
    function TimeFormatter(format) {
        this._formatStr = format || '%h:%m:%s';
    }
    TimeFormatter.prototype.format = function (date) {
        return this._formatStr.replace('%h', numberToStringWithLeadingZero(date.getUTCHours(), 2)).
            replace('%m', numberToStringWithLeadingZero(date.getUTCMinutes(), 2)).
            replace('%s', numberToStringWithLeadingZero(date.getUTCSeconds(), 2));
    };
    return TimeFormatter;
}());
export { TimeFormatter };
