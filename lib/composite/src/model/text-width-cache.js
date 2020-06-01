var defaultReplacementRe = /[2-9]/g;
var TextWidthCache = /** @class */ (function () {
    function TextWidthCache(size) {
        if (size === void 0) { size = 50; }
        this._actualSize = 0;
        this._usageTick = 1;
        this._oldestTick = 1;
        this._tick2Labels = {};
        this._cache = {};
        this._maxSize = size;
    }
    TextWidthCache.prototype.reset = function () {
        this._actualSize = 0;
        this._cache = {};
        this._usageTick = 1;
        this._oldestTick = 1;
        this._tick2Labels = {};
    };
    TextWidthCache.prototype.measureText = function (ctx, text, optimizationReplacementRe) {
        var re = optimizationReplacementRe || defaultReplacementRe;
        var cacheString = String(text).replace(re, '0');
        if (this._cache[cacheString]) {
            return this._cache[cacheString].width;
        }
        if (this._actualSize === this._maxSize) {
            var oldestValue = this._tick2Labels[this._oldestTick];
            delete this._tick2Labels[this._oldestTick];
            delete this._cache[oldestValue];
            this._oldestTick++;
            this._actualSize--;
        }
        var width = ctx.measureText(cacheString).width;
        if (width === 0 && !!text.length) {
            // measureText can return 0 in FF depending on a canvas size, don't cache it
            return 0;
        }
        this._cache[cacheString] = { width: width, tick: this._usageTick };
        this._tick2Labels[this._usageTick] = cacheString;
        this._actualSize++;
        this._usageTick++;
        return width;
    };
    return TextWidthCache;
}());
export { TextWidthCache };
