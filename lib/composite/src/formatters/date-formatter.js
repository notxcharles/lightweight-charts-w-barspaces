import { formatDate } from './format-date';
var DateFormatter = /** @class */ (function () {
    function DateFormatter(dateFormat, locale) {
        if (dateFormat === void 0) { dateFormat = 'yyyy-MM-dd'; }
        if (locale === void 0) { locale = 'default'; }
        this._dateFormat = dateFormat;
        this._locale = locale;
    }
    DateFormatter.prototype.format = function (date) {
        return formatDate(date, this._dateFormat, this._locale);
    };
    return DateFormatter;
}());
export { DateFormatter };
