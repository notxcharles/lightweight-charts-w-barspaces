import { ensureNotNull } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
var optimizationReplacementRe = /[1-9]/g;
var TimeAxisViewRenderer = /** @class */ (function () {
    function TimeAxisViewRenderer() {
        this._private__data = null;
    }
    TimeAxisViewRenderer.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    TimeAxisViewRenderer.prototype._internal_draw = function (ctx, rendererOptions, pixelRatio) {
        var _this = this;
        if (this._private__data === null || this._private__data._internal_visible === false || this._private__data._internal_text.length === 0) {
            return;
        }
        ctx.font = rendererOptions._internal_font;
        var textWidth = Math.round(rendererOptions._internal_widthCache._internal_measureText(ctx, this._private__data._internal_text, optimizationReplacementRe));
        if (textWidth <= 0) {
            return;
        }
        ctx.save();
        var horzMargin = rendererOptions._internal_paddingHorizontal;
        var labelWidth = textWidth + 2 * horzMargin;
        var labelWidthHalf = labelWidth / 2;
        var timeScaleWidth = this._private__data._internal_width;
        var coordinate = this._private__data._internal_coordinate;
        var x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        if (x1 < 0) {
            coordinate = coordinate + Math.abs(0 - x1);
            x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        }
        else if (x1 + labelWidth > timeScaleWidth) {
            coordinate = coordinate - Math.abs(timeScaleWidth - (x1 + labelWidth));
            x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        }
        var x2 = x1 + labelWidth;
        var y1 = 0;
        var y2 = (y1 +
            rendererOptions._internal_borderSize +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_fontSize +
            rendererOptions._internal_paddingBottom);
        ctx.fillStyle = this._private__data._internal_background;
        var x1scaled = Math.round(x1 * pixelRatio);
        var y1scaled = Math.round(y1 * pixelRatio);
        var x2scaled = Math.round(x2 * pixelRatio);
        var y2scaled = Math.round(y2 * pixelRatio);
        ctx.fillRect(x1scaled, y1scaled, x2scaled - x1scaled, y2scaled - y1scaled);
        var tickX = Math.round(this._private__data._internal_coordinate * pixelRatio);
        var tickTop = y1scaled;
        var tickBottom = Math.round((tickTop + rendererOptions._internal_borderSize + rendererOptions._internal_tickLength) * pixelRatio);
        ctx.fillStyle = this._private__data._internal_color;
        var tickWidth = Math.max(1, Math.floor(pixelRatio));
        var tickOffset = Math.floor(pixelRatio * 0.5);
        ctx.fillRect(tickX - tickOffset, tickTop, tickWidth, tickBottom - tickTop);
        var yText = y2 - rendererOptions._internal_baselineOffset - rendererOptions._internal_paddingBottom;
        ctx.textAlign = 'left';
        ctx.fillStyle = this._private__data._internal_color;
        drawScaled(ctx, pixelRatio, function () {
            ctx.fillText(ensureNotNull(_this._private__data)._internal_text, x1 + horzMargin, yText);
        });
        ctx.restore();
    };
    return TimeAxisViewRenderer;
}());
export { TimeAxisViewRenderer };
