import { strokeRectInnerWithFill } from '../helpers/canvas-helpers';
import { optimalCandlestickWidth } from './optimal-bar-width';
;
var PaneRendererCandlesticks = /** @class */ (function () {
    function PaneRendererCandlesticks() {
        this._private__data = null;
        // scaled with pixelRatio
        this._private__barWidth = 0;
    }
    PaneRendererCandlesticks.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    PaneRendererCandlesticks.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null || this._private__data._internal_bars.length === 0 || this._private__data._internal_visibleRange === null) {
            return;
        }
        // now we know pixelRatio and we could calculate barWidth effectively
        this._private__barWidth = optimalCandlestickWidth(this._private__data._internal_barSpacing, pixelRatio);
        // grid and crosshair have line width = Math.floor(pixelRatio)
        // if this value is odd, we have to make candlesticks' width odd
        // if this value is even, we have to make candlesticks' width even
        // in order of keeping crosshair-over-candlesticks drawing symmetric
        if (this._private__barWidth >= 2) {
            var wickWidth = Math.floor(pixelRatio);
            if ((wickWidth % 2) !== (this._private__barWidth % 2)) {
                this._private__barWidth--;
            }
        }
        var bars = this._private__data._internal_bars;
        if (this._private__data._internal_wickVisible) {
            this._private__drawWicks(ctx, bars, this._private__data._internal_visibleRange, pixelRatio);
        }
        if (this._private__data._internal_borderVisible) {
            this._private__drawBorder(ctx, bars, this._private__data._internal_visibleRange, this._private__data._internal_barSpacing, pixelRatio);
        }
        var borderWidth = this._private__calculateBorderWidth(pixelRatio);
        if (!this._private__data._internal_borderVisible || this._private__barWidth > borderWidth * 2) {
            this._private__drawCandles(ctx, bars, this._private__data._internal_visibleRange, pixelRatio);
        }
    };
    PaneRendererCandlesticks.prototype._private__drawWicks = function (ctx, bars, visibleRange, pixelRatio) {
        if (this._private__data === null) {
            return;
        }
        var prevWickColor = '';
        var wickWidth = Math.min(Math.floor(pixelRatio), Math.floor(this._private__data._internal_barSpacing * pixelRatio));
        wickWidth = Math.min(wickWidth, this._private__barWidth);
        var wickOffset = Math.floor(wickWidth * 0.5);
        for (var i = visibleRange.from; i < visibleRange.to; i++) {
            var bar = bars[i];
            if (bar._internal_wickColor !== prevWickColor) {
                ctx.fillStyle = bar._internal_wickColor;
                prevWickColor = bar._internal_wickColor;
            }
            var top_1 = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            var bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            var high = Math.round(bar._internal_highY * pixelRatio);
            var low = Math.round(bar._internal_lowY * pixelRatio);
            var scaledX = Math.round(pixelRatio * bar._internal_x);
            ctx.fillRect(scaledX - wickOffset, high, wickWidth, top_1 - high);
            ctx.fillRect(scaledX - wickOffset, bottom + 1, wickWidth, low - bottom);
        }
    };
    PaneRendererCandlesticks.prototype._private__calculateBorderWidth = function (pixelRatio) {
        var borderWidth = Math.floor(1 /* BarBorderWidth */ * pixelRatio);
        if (this._private__barWidth <= 2 * borderWidth) {
            borderWidth = Math.floor((this._private__barWidth - 1) * 0.5);
        }
        var res = Math.max(1, borderWidth);
        if (this._private__barWidth <= res * 2) {
            // do not draw bodies, restore original value
            return Math.floor(1 /* BarBorderWidth */ * pixelRatio);
        }
        return res;
    };
    PaneRendererCandlesticks.prototype._private__drawBorder = function (ctx, bars, visibleRange, barSpacing, pixelRatio) {
        var prevBorderColor = '';
        var borderWidth = this._private__calculateBorderWidth(pixelRatio);
        for (var i = visibleRange.from; i < visibleRange.to; i++) {
            var bar = bars[i];
            if (bar._internal_borderColor !== prevBorderColor) {
                ctx.fillStyle = bar._internal_borderColor;
                prevBorderColor = bar._internal_borderColor;
            }
            var left = Math.round(bar._internal_x * pixelRatio) - Math.floor(this._private__barWidth * 0.5);
            var right = left + this._private__barWidth - 1;
            var top_2 = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            var bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            if (barSpacing > 2 * borderWidth) {
                strokeRectInnerWithFill(ctx, left, top_2, right - left + 1, bottom - top_2 + 1, borderWidth);
            }
            else {
                ctx.fillRect(left, top_2, right - left + 1, bottom - top_2 + 1);
            }
        }
    };
    PaneRendererCandlesticks.prototype._private__drawCandles = function (ctx, bars, visibleRange, pixelRatio) {
        if (this._private__data === null) {
            return;
        }
        var prevBarColor = '';
        var borderWidth = this._private__calculateBorderWidth(pixelRatio);
        for (var i = visibleRange.from; i < visibleRange.to; i++) {
            var bar = bars[i];
            var top_3 = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            var bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            var left = Math.round(bar._internal_x * pixelRatio) - Math.floor(this._private__barWidth * 0.5);
            var right = left + this._private__barWidth - 1;
            if (this._private__data._internal_borderVisible) {
                left += borderWidth;
                top_3 += borderWidth;
                right -= borderWidth;
                bottom -= borderWidth;
            }
            if (top_3 > bottom) {
                continue;
            }
            if (bar._internal_color !== prevBarColor) {
                var barColor = bar._internal_color;
                ctx.fillStyle = barColor;
                prevBarColor = barColor;
            }
            ctx.fillRect(left, top_3, right - left + 1, bottom - top_3 + 1);
        }
    };
    return PaneRendererCandlesticks;
}());
export { PaneRendererCandlesticks };
