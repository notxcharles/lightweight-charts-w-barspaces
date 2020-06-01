import { formatDate } from './format-date';
var DateFormatter = /** @class */ (function () {
    function DateFormatter(dateFormat, locale) {
        if (dateFormat === void 0) { dateFormat = 'yyyy-MM-dd'; }
        if (locale === void 0) { locale = 'default'; }
        this._private__dateFormat = dateFormat;
        this._private__locale = locale;
    }
    DateFormatter.prototype._internal_format = function (date) {
        return formatDate(date, this._private__dateFormat, this._private__locale);
    };
    return DateFormatter;
}());
export { DateFormatter };
