var showSpacingMinimalBarWidth = 3;
var alignToMinimalWidthLimit = 4;
var PaneRendererHistogram = /** @class */ (function () {
    function PaneRendererHistogram() {
        this._private__data = null;
        this._private__precalculatedCache = [];
    }
    PaneRendererHistogram.prototype._internal_setData = function (data) {
        this._private__data = data;
        this._private__precalculatedCache = [];
    };
    PaneRendererHistogram.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null || this._private__data._internal_items.length === 0 || this._private__data._internal_visibleRange === null) {
            return;
        }
        if (!this._private__precalculatedCache.length) {
            this._private__fillPrecalculatedCache(pixelRatio);
        }
        var histogramBase = Math.round(this._private__data._internal_histogramBase * pixelRatio);
        var lineWidth = Math.max(1, Math.floor(pixelRatio));
        for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
            var item = this._private__data._internal_items[i];
            var current = this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from];
            var y = Math.round(item._internal_y * pixelRatio);
            ctx.fillStyle = item._internal_color;
            ctx.fillRect(current._internal_left, y, current._internal_right - current._internal_left + 1, histogramBase - y + lineWidth);
        }
    };
    // tslint:disable-next-line: cyclomatic-complexity
    PaneRendererHistogram.prototype._private__fillPrecalculatedCache = function (pixelRatio) {
        if (this._private__data === null || this._private__data._internal_items.length === 0 || this._private__data._internal_visibleRange === null) {
            this._private__precalculatedCache = [];
            return;
        }
        var spacing = Math.ceil(this._private__data._internal_barSpacing * pixelRatio) <= showSpacingMinimalBarWidth ? 0 : Math.max(1, Math.floor(pixelRatio));
        var columnWidth = Math.round(this._private__data._internal_barSpacing * pixelRatio) - spacing;
        this._private__precalculatedCache = new Array(this._private__data._internal_visibleRange.to - this._private__data._internal_visibleRange.from);
        for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
            var item = this._private__data._internal_items[i];
            // force cast to avoid ensureDefined call
            var x = Math.round(item._internal_x * pixelRatio);
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
            this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from] = {
                _internal_left: left,
                _internal_right: right,
                _internal_roundedCenter: x,
                _internal_center: (item._internal_x * pixelRatio),
                _internal_time: item._internal_time,
            };
        }
        // correct positions
        for (var i = this._private__data._internal_visibleRange.from + 1; i < this._private__data._internal_visibleRange.to; i++) {
            var current = this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from];
            var prev = this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from - 1];
            if (current._internal_time !== prev._internal_time + 1) {
                continue;
            }
            if (current._internal_left - prev._internal_right !== (spacing + 1)) {
                // have to align
                if (prev._internal_roundedCenter > prev._internal_center) {
                    // prev wasshifted to left, so add pixel to right
                    prev._internal_right = current._internal_left - spacing - 1;
                }
                else {
                    // extend current to left
                    current._internal_left = prev._internal_right + spacing + 1;
                }
            }
        }
        var minWidth = Math.ceil(this._private__data._internal_barSpacing * pixelRatio);
        for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
            var current = this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from];
            // this could happen if barspacing < 1
            if (current._internal_right < current._internal_left) {
                current._internal_right = current._internal_left;
            }
            var width = current._internal_right - current._internal_left + 1;
            minWidth = Math.min(width, minWidth);
        }
        if (spacing > 0 && minWidth < alignToMinimalWidthLimit) {
            for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
                var current = this._private__precalculatedCache[i - this._private__data._internal_visibleRange.from];
                var width = current._internal_right - current._internal_left + 1;
                if (width > minWidth) {
                    if (current._internal_roundedCenter > current._internal_center) {
                        current._internal_right -= 1;
                    }
                    else {
                        current._internal_left += 1;
                    }
                }
            }
        }
    };
    return PaneRendererHistogram;
}());
export { PaneRendererHistogram };
