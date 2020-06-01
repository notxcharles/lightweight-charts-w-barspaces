import { drawScaled } from '../helpers/canvas-helpers';
import { resetTransparency } from '../helpers/color';
var PriceAxisViewRenderer = /** @class */ (function () {
    function PriceAxisViewRenderer(data, commonData) {
        this.setData(data, commonData);
    }
    PriceAxisViewRenderer.prototype.setData = function (data, commonData) {
        this._data = data;
        this._commonData = commonData;
    };
    PriceAxisViewRenderer.prototype.draw = function (ctx, rendererOptions, textWidthCache, width, align, pixelRatio) {
        if (!this._data.visible) {
            return;
        }
        ctx.font = rendererOptions.font;
        var tickSize = this._data.tickVisible ? rendererOptions.tickLength : 0;
        var horzBorder = rendererOptions.borderSize;
        var paddingTop = rendererOptions.paddingTop;
        var paddingBottom = rendererOptions.paddingBottom;
        var paddingInner = rendererOptions.paddingInner;
        var paddingOuter = rendererOptions.paddingOuter;
        var text = this._data.text;
        var textWidth = Math.ceil(textWidthCache.measureText(ctx, text));
        var baselineOffset = rendererOptions.baselineOffset;
        var totalHeight = rendererOptions.fontSize + paddingTop + paddingBottom;
        var halfHeigth = Math.ceil(totalHeight * 0.5);
        var totalWidth = horzBorder + textWidth + paddingInner + paddingOuter + tickSize;
        var yMid = this._commonData.coordinate;
        if (this._commonData.fixedCoordinate) {
            yMid = this._commonData.fixedCoordinate;
        }
        yMid = Math.round(yMid);
        var yTop = yMid - halfHeigth;
        var yBottom = yTop + totalHeight;
        var alignRight = align === 'right';
        var xInside = alignRight ? width : 0;
        var rightScaled = Math.ceil(width * pixelRatio);
        var xOutside = xInside;
        var xTick;
        var xText;
        ctx.fillStyle = resetTransparency(this._commonData.background);
        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';
        if (text) {
            if (alignRight) {
                // 2               1
                //
                //              6  5
                //
                // 3               4
                xOutside = xInside - totalWidth;
                xTick = xInside - tickSize;
                xText = xOutside + paddingOuter;
            }
            else {
                // 1               2
                //
                // 6  5
                //
                // 4               3
                xOutside = xInside + totalWidth;
                xTick = xInside + tickSize;
                xText = xInside + horzBorder + tickSize + paddingInner;
            }
            var tickHeight = Math.max(1, Math.floor(pixelRatio));
            var horzBorderScaled = Math.max(1, Math.floor(horzBorder * pixelRatio));
            var xInsideScaled = alignRight ? rightScaled : 0;
            var yTopScaled = Math.round(yTop * pixelRatio);
            var xOutsideScaled = Math.round(xOutside * pixelRatio);
            var yMidScaled = Math.round(yMid * pixelRatio) - Math.floor(pixelRatio * 0.5);
            var yBottomScaled = yMidScaled + tickHeight + (yMidScaled - yTopScaled);
            var xTickScaled = Math.round(xTick * pixelRatio);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xInsideScaled, yTopScaled);
            ctx.lineTo(xOutsideScaled, yTopScaled);
            ctx.lineTo(xOutsideScaled, yBottomScaled);
            ctx.lineTo(xInsideScaled, yBottomScaled);
            ctx.fill();
            // draw border
            ctx.fillStyle = this._data.borderColor;
            ctx.fillRect(alignRight ? rightScaled - horzBorderScaled : 0, yTopScaled, horzBorderScaled, yBottomScaled - yTopScaled);
            if (this._data.tickVisible) {
                ctx.fillStyle = this._commonData.color;
                ctx.fillRect(xInsideScaled, yMidScaled, xTickScaled - xInsideScaled, tickHeight);
            }
            ctx.textAlign = 'left';
            ctx.fillStyle = this._commonData.color;
            drawScaled(ctx, pixelRatio, function () {
                ctx.fillText(text, xText, yBottom - paddingBottom - baselineOffset);
            });
            ctx.restore();
        }
    };
    PriceAxisViewRenderer.prototype.height = function (rendererOptions, useSecondLine) {
        if (!this._data.visible) {
            return 0;
        }
        return rendererOptions.fontSize + rendererOptions.paddingTop + rendererOptions.paddingBottom;
    };
    return PriceAxisViewRenderer;
}());
export { PriceAxisViewRenderer };
