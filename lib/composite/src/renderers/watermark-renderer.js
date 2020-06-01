import { __extends } from "tslib";
import { ScaledRenderer } from './scaled-renderer';
var WatermarkRenderer = /** @class */ (function (_super) {
    __extends(WatermarkRenderer, _super);
    function WatermarkRenderer(data) {
        var _this = _super.call(this) || this;
        _this._metricsCache = new Map();
        _this._data = data;
        return _this;
    }
    WatermarkRenderer.prototype._drawImpl = function (ctx) {
    };
    WatermarkRenderer.prototype._drawBackgroundImpl = function (ctx) {
        if (!this._data.visible) {
            return;
        }
        ctx.save();
        var textHeight = 0;
        for (var _i = 0, _a = this._data.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.text.length === 0) {
                continue;
            }
            ctx.font = line.font;
            var textWidth = this._metrics(ctx, line.text);
            if (textWidth > this._data.width) {
                line.zoom = this._data.width / textWidth;
            }
            else {
                line.zoom = 1;
            }
            textHeight += line.lineHeight * line.zoom;
        }
        var vertOffset = 0;
        switch (this._data.vertAlign) {
            case 'top':
                vertOffset = 0;
                break;
            case 'center':
                vertOffset = Math.max((this._data.height - textHeight) / 2, 0);
                break;
            case 'bottom':
                vertOffset = Math.max((this._data.height - textHeight), 0);
                break;
        }
        ctx.fillStyle = this._data.color;
        for (var _b = 0, _c = this._data.lines; _b < _c.length; _b++) {
            var line = _c[_b];
            ctx.save();
            var horzOffset = 0;
            switch (this._data.horzAlign) {
                case 'left':
                    ctx.textAlign = 'left';
                    horzOffset = line.lineHeight / 2;
                    break;
                case 'center':
                    ctx.textAlign = 'center';
                    horzOffset = this._data.width / 2;
                    break;
                case 'right':
                    ctx.textAlign = 'right';
                    horzOffset = this._data.width - 1 - line.lineHeight / 2;
                    break;
            }
            ctx.translate(horzOffset, vertOffset);
            ctx.textBaseline = 'top';
            ctx.font = line.font;
            ctx.scale(line.zoom, line.zoom);
            ctx.fillText(line.text, 0, line.vertOffset);
            ctx.restore();
            vertOffset += line.lineHeight * line.zoom;
        }
        ctx.restore();
    };
    WatermarkRenderer.prototype._metrics = function (ctx, text) {
        var fontCache = this._fontCache(ctx.font);
        var result = fontCache.get(text);
        if (result === undefined) {
            result = ctx.measureText(text).width;
            fontCache.set(text, result);
        }
        return result;
    };
    WatermarkRenderer.prototype._fontCache = function (font) {
        var fontCache = this._metricsCache.get(font);
        if (fontCache === undefined) {
            fontCache = new Map();
            this._metricsCache.set(font, fontCache);
        }
        return fontCache;
    };
    return WatermarkRenderer;
}(ScaledRenderer));
export { WatermarkRenderer };
