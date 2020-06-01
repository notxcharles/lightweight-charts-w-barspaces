import { __assign } from "tslib";
import { DateFormatter } from './date-formatter';
import { TimeFormatter } from './time-formatter';
var defaultParams = {
    dateFormat: 'yyyy-MM-dd',
    timeFormat: '%h:%m:%s',
    dateTimeSeparator: ' ',
    locale: 'default',
};
var DateTimeFormatter = /** @class */ (function () {
    function DateTimeFormatter(params) {
        if (params === void 0) { params = {}; }
        var formatterParams = __assign(__assign({}, defaultParams), params);
        this._dateFormatter = new DateFormatter(formatterParams.dateFormat, formatterParams.locale);
        this._timeFormatter = new TimeFormatter(formatterParams.timeFormat);
        this._separator = formatterParams.dateTimeSeparator;
    }
    DateTimeFormatter.prototype.format = function (dateTime) {
        return "" + this._dateFormatter.format(dateTime) + this._separator + this._timeFormatter.format(dateTime);
    };
    return DateTimeFormatter;
}());
export { DateTimeFormatter };
