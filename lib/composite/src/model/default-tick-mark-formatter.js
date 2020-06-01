import { ensureNever } from '../helpers/assertions';
export function defaultTickMarkFormatter(timePoint, tickMarkType, locale) {
    var formatOptions = {};
    switch (tickMarkType) {
        case 0 /* Year */:
            formatOptions.year = 'numeric';
            break;
        case 1 /* Month */:
            formatOptions.month = 'short';
            break;
        case 2 /* DayOfMonth */:
            formatOptions.day = 'numeric';
            break;
        case 3 /* Time */:
            formatOptions.hour12 = false;
            formatOptions.hour = '2-digit';
            formatOptions.minute = '2-digit';
            break;
        case 4 /* TimeWithSeconds */:
            formatOptions.hour12 = false;
            formatOptions.hour = '2-digit';
            formatOptions.minute = '2-digit';
            formatOptions.second = '2-digit';
            break;
        default:
            ensureNever(tickMarkType);
    }
    var date = timePoint.businessDay === undefined
        ? new Date(timePoint.timestamp * 1000)
        : new Date(Date.UTC(timePoint.businessDay.year, timePoint.businessDay.month - 1, timePoint.businessDay.day));
    // from given date we should use only as UTC date or timestamp
    // but to format as locale date we can convert UTC date to local date
    var localDateFromUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    return localDateFromUtc.toLocaleString(locale, formatOptions);
}
