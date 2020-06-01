import { createPreconfiguredCanvas, getCanvasDevicePixelRatio, getContext2D, Size } from '../gui/canvas-utils';
import { ensureDefined } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { ceiledEven } from '../helpers/mathex';
import { TextWidthCache } from '../model/text-width-cache';
var MAX_COUNT = 200;
var LabelsImageCache = /** @class */ (function () {
    function LabelsImageCache(fontSize, color, fontFamily, fontStyle) {
        this._textWidthCache = new TextWidthCache(MAX_COUNT);
        this._fontSize = 0;
        this._color = '';
        this._font = '';
        this._keys = [];
        this._hash = new Map();
        this._fontSize = fontSize;
        this._color = color;
        this._font = makeFont(fontSize, fontFamily, fontStyle);
    }
    LabelsImageCache.prototype.destroy = function () {
        delete this._textWidthCache;
        this._keys = [];
        this._hash.clear();
    };
    LabelsImageCache.prototype.paintTo = function (ctx, text, x, y, align) {
        var label = this._getLabelImage(ctx, text);
        if (align !== 'left') {
            var pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            x -= Math.floor(label.textWidth * pixelRatio);
        }
        y -= Math.floor(label.height / 2);
        ctx.drawImage(label.canvas, x, y, label.width, label.height);
    };
    LabelsImageCache.prototype._getLabelImage = function (ctx, text) {
        var _this = this;
        var item;
        if (this._hash.has(text)) {
            // Cache hit!
            item = ensureDefined(this._hash.get(text));
        }
        else {
            if (this._keys.length >= MAX_COUNT) {
                var key = ensureDefined(this._keys.shift());
                this._hash.delete(key);
            }
            var pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            var margin_1 = Math.ceil(this._fontSize / 4.5);
            var baselineOffset_1 = Math.round(this._fontSize / 10);
            var textWidth = Math.ceil(this._textWidthCache.measureText(ctx, text));
            var width = ceiledEven(Math.round(textWidth + margin_1 * 2));
            var height_1 = ceiledEven(this._fontSize + margin_1 * 2);
            var canvas = createPreconfiguredCanvas(document, new Size(width, height_1));
            // Allocate new
            item = {
                text: text,
                textWidth: Math.round(Math.max(1, textWidth)),
                width: Math.ceil(width * pixelRatio),
                height: Math.ceil(height_1 * pixelRatio),
                canvas: canvas,
            };
            if (textWidth !== 0) {
                this._keys.push(item.text);
                this._hash.set(item.text, item);
            }
            ctx = getContext2D(item.canvas);
            drawScaled(ctx, pixelRatio, function () {
                ctx.font = _this._font;
                ctx.fillStyle = _this._color;
                ctx.fillText(text, 0, height_1 - margin_1 - baselineOffset_1);
            });
        }
        return item;
    };
    return LabelsImageCache;
}());
export { LabelsImageCache };
