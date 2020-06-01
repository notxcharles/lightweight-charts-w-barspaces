import { __extends } from "tslib";
import { ScaledRenderer } from './scaled-renderer';
var WatermarkRenderer = /** @class */ (function (_super) {
    __extends(WatermarkRenderer, _super);
    function WatermarkRenderer(data) {
        var _this = _super.call(this) || this;
        _this._private__metricsCache = new Map();
        _this._private__data = data;
        return _this;
    }
    WatermarkRenderer.prototype._internal__drawImpl = function (ctx) {
    };
    WatermarkRenderer.prototype._internal__drawBackgroundImpl = function (ctx) {
        if (!this._private__data._internal_visible) {
            return;
        }
        ctx.save();
        var textHeight = 0;
        for (var _i = 0, _a = this._private__data._internal_lines; _i < _a.length; _i++) {
            var line = _a[_i];
            if (line._internal_text.length === 0) {
                continue;
            }
            ctx.font = line._internal_font;
            var textWidth = this._private__metrics(ctx, line._internal_text);
            if (textWidth > this._private__data._internal_width) {
                line._internal_zoom = this._private__data._internal_width / textWidth;
            }
            else {
                line._internal_zoom = 1;
            }
            textHeight += line._internal_lineHeight * line._internal_zoom;
        }
        var vertOffset = 0;
        switch (this._private__data._internal_vertAlign) {
            case 'top':
                vertOffset = 0;
                break;
            case 'center':
                vertOffset = Math.max((this._private__data._internal_height - textHeight) / 2, 0);
                break;
            case 'bottom':
                vertOffset = Math.max((this._private__data._internal_height - textHeight), 0);
                break;
        }
        ctx.fillStyle = this._private__data._internal_color;
        for (var _b = 0, _c = this._private__data._internal_lines; _b < _c.length; _b++) {
            var line = _c[_b];
            ctx.save();
            var horzOffset = 0;
            switch (this._private__data._internal_horzAlign) {
                case 'left':
                    ctx.textAlign = 'left';
                    horzOffset = line._internal_lineHeight / 2;
                    break;
                case 'center':
                    ctx.textAlign = 'center';
                    horzOffset = this._private__data._internal_width / 2;
                    break;
                case 'right':
                    ctx.textAlign = 'right';
                    horzOffset = this._private__data._internal_width - 1 - line._internal_lineHeight / 2;
                    break;
            }
            ctx.translate(horzOffset, vertOffset);
            ctx.textBaseline = 'top';
            ctx.font = line._internal_font;
            ctx.scale(line._internal_zoom, line._internal_zoom);
            ctx.fillText(line._internal_text, 0, line._internal_vertOffset);
            ctx.restore();
            vertOffset += line._internal_lineHeight * line._internal_zoom;
        }
        ctx.restore();
    };
    WatermarkRenderer.prototype._private__metrics = function (ctx, text) {
        var fontCache = this._private__fontCache(ctx.font);
        var result = fontCache.get(text);
        if (result === undefined) {
            result = ctx.measureText(text).width;
            fontCache.set(text, result);
        }
        return result;
    };
    WatermarkRenderer.prototype._private__fontCache = function (font) {
        var fontCache = this._private__metricsCache.get(font);
        if (fontCache === undefined) {
            fontCache = new Map();
            this._private__metricsCache.set(font, fontCache);
        }
        return fontCache;
    };
    return WatermarkRenderer;
}(ScaledRenderer));
export { WatermarkRenderer };
