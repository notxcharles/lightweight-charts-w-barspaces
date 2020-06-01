import { drawScaled } from '../helpers/canvas-helpers';
import { resetTransparency } from '../helpers/color';
var PriceAxisViewRenderer = /** @class */ (function () {
    function PriceAxisViewRenderer(data, commonData) {
        this._internal_setData(data, commonData);
    }
    PriceAxisViewRenderer.prototype._internal_setData = function (data, commonData) {
        this._private__data = data;
        this._private__commonData = commonData;
    };
    PriceAxisViewRenderer.prototype._internal_draw = function (ctx, rendererOptions, textWidthCache, width, align, pixelRatio) {
        if (!this._private__data._internal_visible) {
            return;
        }
        ctx.font = rendererOptions._internal_font;
        var tickSize = this._private__data._internal_tickVisible ? rendererOptions._internal_tickLength : 0;
        var horzBorder = rendererOptions._internal_borderSize;
        var paddingTop = rendererOptions._internal_paddingTop;
        var paddingBottom = rendererOptions._internal_paddingBottom;
        var paddingInner = rendererOptions._internal_paddingInner;
        var paddingOuter = rendererOptions._internal_paddingOuter;
        var text = this._private__data._internal_text;
        var textWidth = Math.ceil(textWidthCache._internal_measureText(ctx, text));
        var baselineOffset = rendererOptions._internal_baselineOffset;
        var totalHeight = rendererOptions._internal_fontSize + paddingTop + paddingBottom;
        var halfHeigth = Math.ceil(totalHeight * 0.5);
        var totalWidth = horzBorder + textWidth + paddingInner + paddingOuter + tickSize;
        var yMid = this._private__commonData._internal_coordinate;
        if (this._private__commonData._internal_fixedCoordinate) {
            yMid = this._private__commonData._internal_fixedCoordinate;
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
        ctx.fillStyle = resetTransparency(this._private__commonData._internal_background);
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
            ctx.fillStyle = this._private__data._internal_borderColor;
            ctx.fillRect(alignRight ? rightScaled - horzBorderScaled : 0, yTopScaled, horzBorderScaled, yBottomScaled - yTopScaled);
            if (this._private__data._internal_tickVisible) {
                ctx.fillStyle = this._private__commonData._internal_color;
                ctx.fillRect(xInsideScaled, yMidScaled, xTickScaled - xInsideScaled, tickHeight);
            }
            ctx.textAlign = 'left';
            ctx.fillStyle = this._private__commonData._internal_color;
            drawScaled(ctx, pixelRatio, function () {
                ctx.fillText(text, xText, yBottom - paddingBottom - baselineOffset);
            });
            ctx.restore();
        }
    };
    PriceAxisViewRenderer.prototype._internal_height = function (rendererOptions, useSecondLine) {
        if (!this._private__data._internal_visible) {
            return 0;
        }
        return rendererOptions._internal_fontSize + rendererOptions._internal_paddingTop + rendererOptions._internal_paddingBottom;
    };
    return PriceAxisViewRenderer;
}());
export { PriceAxisViewRenderer };
