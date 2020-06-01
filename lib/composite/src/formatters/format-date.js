import { numberToStringWithLeadingZero as numToStr } from './price-formatter';
var getMonth = function (date) { return date.getUTCMonth() + 1; };
var getDay = function (date) { return date.getUTCDate(); };
var getYear = function (date) { return date.getUTCFullYear(); };
var dd = function (date) { return numToStr(getDay(date), 2); };
var MMMM = function (date, locale) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), 1)
    .toLocaleString(locale, { month: 'long' }); };
var MMM = function (date, locale) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), 1)
    .toLocaleString(locale, { month: 'short' }); };
var MM = function (date) { return numToStr(getMonth(date), 2); };
var yy = function (date) { return numToStr(getYear(date) % 100, 2); };
var yyyy = function (date) { return numToStr(getYear(date), 4); };
export function formatDate(date, format, locale) {
    return format
        .replace(/yyyy/g, yyyy(date))
        .replace(/yy/g, yy(date))
        .replace(/MMMM/g, MMMM(date, locale))
        .replace(/MMM/g, MMM(date, locale))
        .replace(/MM/g, MM(date))
        .replace(/dd/g, dd(date));
}
