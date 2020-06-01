import { ensureDefined } from '../helpers/assertions';
var FormattedLabelsCache = /** @class */ (function () {
    function FormattedLabelsCache(format, size) {
        if (size === void 0) { size = 50; }
        this._actualSize = 0;
        this._usageTick = 1;
        this._oldestTick = 1;
        this._cache = new Map();
        this._tick2Labels = new Map();
        this._format = format;
        this._maxSize = size;
    }
    FormattedLabelsCache.prototype.format = function (value) {
        var cacheKey = value.businessDay === undefined
            ? new Date(value.timestamp * 1000).getTime()
            : new Date(Date.UTC(value.businessDay.year, value.businessDay.month - 1, value.businessDay.day)).getTime();
        var tick = this._cache.get(cacheKey);
        if (tick !== undefined) {
            return tick.string;
        }
        if (this._actualSize === this._maxSize) {
            var oldestValue = this._tick2Labels.get(this._oldestTick);
            this._tick2Labels.delete(this._oldestTick);
            this._cache.delete(ensureDefined(oldestValue));
            this._oldestTick++;
            this._actualSize--;
        }
        var str = this._format(value);
        this._cache.set(cacheKey, { string: str, tick: this._usageTick });
        this._tick2Labels.set(this._usageTick, cacheKey);
        this._actualSize++;
        this._usageTick++;
        return str;
    };
    return FormattedLabelsCache;
}());
export { FormattedLabelsCache };
