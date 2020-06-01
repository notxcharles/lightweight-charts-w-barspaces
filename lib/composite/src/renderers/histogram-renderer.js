var showSpacingMinimalBarWidth = 3;
var alignToMinimalWidthLimit = 4;
var PaneRendererHistogram = /** @class */ (function () {
    function PaneRendererHistogram() {
        this._data = null;
        this._precalculatedCache = [];
    }
    PaneRendererHistogram.prototype.setData = function (data) {
        this._data = data;
        this._precalculatedCache = [];
    };
    PaneRendererHistogram.prototype.draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._data === null || this._data.items.length === 0 || this._data.visibleRange === null) {
            return;
        }
        if (!this._precalculatedCache.length) {
            this._fillPrecalculatedCache(pixelRatio);
        }
        var histogramBase = Math.round(this._data.histogramBase * pixelRatio);
        var lineWidth = Math.max(1, Math.floor(pixelRatio));
        for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
            var item = this._data.items[i];
            var current = this._precalculatedCache[i - this._data.visibleRange.from];
            var y = Math.round(item.y * pixelRatio);
            ctx.fillStyle = item.color;
            ctx.fillRect(current.left, y, current.right - current.left + 1, histogramBase - y + lineWidth);
        }
    };
    // tslint:disable-next-line: cyclomatic-complexity
    PaneRendererHistogram.prototype._fillPrecalculatedCache = function (pixelRatio) {
        if (this._data === null || this._data.items.length === 0 || this._data.visibleRange === null) {
            this._precalculatedCache = [];
            return;
        }
        var spacing = Math.ceil(this._data.barSpacing * pixelRatio) <= showSpacingMinimalBarWidth ? 0 : Math.max(1, Math.floor(pixelRatio));
        var columnWidth = Math.round(this._data.barSpacing * pixelRatio) - spacing;
        this._precalculatedCache = new Array(this._data.visibleRange.to - this._data.visibleRange.from);
        for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
            var item = this._data.items[i];
            // force cast to avoid ensureDefined call
            var x = Math.round(item.x * pixelRatio);
            var left = void 0;
            var right = void 0;
            if (columnWidth % 2) {
                var halfWidth = (columnWidth - 1) / 2;
                left = x - halfWidth;
                right = x + halfWidth;
            }
            else {
                // shift pixel to left
                var halfWidth = columnWidth / 2;
                left = x - halfWidth;
                right = x + halfWidth - 1;
            }
            this._precalculatedCache[i - this._data.visibleRange.from] = {
                left: left,
                right: right,
                roundedCenter: x,
                center: (item.x * pixelRatio),
                time: item.time,
            };
        }
        // correct positions
        for (var i = this._data.visibleRange.from + 1; i < this._data.visibleRange.to; i++) {
            var current = this._precalculatedCache[i - this._data.visibleRange.from];
            var prev = this._precalculatedCache[i - this._data.visibleRange.from - 1];
            if (current.time !== prev.time + 1) {
                continue;
            }
            if (current.left - prev.right !== (spacing + 1)) {
                // have to align
                if (prev.roundedCenter > prev.center) {
                    // prev wasshifted to left, so add pixel to right
                    prev.right = current.left - spacing - 1;
                }
                else {
                    // extend current to left
                    current.left = prev.right + spacing + 1;
                }
            }
        }
        var minWidth = Math.ceil(this._data.barSpacing * pixelRatio);
        for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
            var current = this._precalculatedCache[i - this._data.visibleRange.from];
            // this could happen if barspacing < 1
            if (current.right < current.left) {
                current.right = current.left;
            }
            var width = current.right - current.left + 1;
            minWidth = Math.min(width, minWidth);
        }
        if (spacing > 0 && minWidth < alignToMinimalWidthLimit) {
            for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
                var current = this._precalculatedCache[i - this._data.visibleRange.from];
                var width = current.right - current.left + 1;
                if (width > minWidth) {
                    if (current.roundedCenter > current.center) {
                        current.right -= 1;
                    }
                    else {
                        current.left += 1;
                    }
                }
            }
        }
    };
    return PaneRendererHistogram;
}());
export { PaneRendererHistogram };
