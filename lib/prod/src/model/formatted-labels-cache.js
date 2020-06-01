import { ensureDefined } from '../helpers/assertions';
var FormattedLabelsCache = /** @class */ (function () {
    function FormattedLabelsCache(format, size) {
        if (size === void 0) { size = 50; }
        this._private__actualSize = 0;
        this._private__usageTick = 1;
        this._private__oldestTick = 1;
        this._private__cache = new Map();
        this._private__tick2Labels = new Map();
        this._private__format = format;
        this._private__maxSize = size;
    }
    FormattedLabelsCache.prototype._internal_format = function (value) {
        var cacheKey = value.businessDay === undefined
            ? new Date(value.timestamp * 1000).getTime()
            : new Date(Date.UTC(value.businessDay.year, value.businessDay.month - 1, value.businessDay.day)).getTime();
        var tick = this._private__cache.get(cacheKey);
        if (tick !== undefined) {
            return tick._internal_string;
        }
        if (this._private__actualSize === this._private__maxSize) {
            var oldestValue = this._private__tick2Labels.get(this._private__oldestTick);
            this._private__tick2Labels.delete(this._private__oldestTick);
            this._private__cache.delete(ensureDefined(oldestValue));
            this._private__oldestTick++;
            this._private__actualSize--;
        }
        var str = this._private__format(value);
        this._private__cache.set(cacheKey, { _internal_string: str, _internal_tick: this._private__usageTick });
        this._private__tick2Labels.set(this._private__usageTick, cacheKey);
        this._private__actualSize++;
        this._private__usageTick++;
        return str;
    };
    return FormattedLabelsCache;
}());
export { FormattedLabelsCache };
