var defaultReplacementRe = /[2-9]/g;
var TextWidthCache = /** @class */ (function () {
    function TextWidthCache(size) {
        if (size === void 0) { size = 50; }
        this._private__actualSize = 0;
        this._private__usageTick = 1;
        this._private__oldestTick = 1;
        this._private__tick2Labels = {};
        this._private__cache = {};
        this._private__maxSize = size;
    }
    TextWidthCache.prototype._internal_reset = function () {
        this._private__actualSize = 0;
        this._private__cache = {};
        this._private__usageTick = 1;
        this._private__oldestTick = 1;
        this._private__tick2Labels = {};
    };
    TextWidthCache.prototype._internal_measureText = function (ctx, text, optimizationReplacementRe) {
        var re = optimizationReplacementRe || defaultReplacementRe;
        var cacheString = String(text).replace(re, '0');
        if (this._private__cache[cacheString]) {
            return this._private__cache[cacheString]._internal_width;
        }
        if (this._private__actualSize === this._private__maxSize) {
            var oldestValue = this._private__tick2Labels[this._private__oldestTick];
            delete this._private__tick2Labels[this._private__oldestTick];
            delete this._private__cache[oldestValue];
            this._private__oldestTick++;
            this._private__actualSize--;
        }
        var width = ctx.measureText(cacheString).width;
        if (width === 0 && !!text.length) {
            // measureText can return 0 in FF depending on a canvas size, don't cache it
            return 0;
        }
        this._private__cache[cacheString] = { _internal_width: width, _internal_tick: this._private__usageTick };
        this._private__tick2Labels[this._private__usageTick] = cacheString;
        this._private__actualSize++;
        this._private__usageTick++;
        return width;
    };
    return TextWidthCache;
}());
export { TextWidthCache };
