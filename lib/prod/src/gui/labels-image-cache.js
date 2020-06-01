import { createPreconfiguredCanvas, getCanvasDevicePixelRatio, getContext2D, Size } from '../gui/canvas-utils';
import { ensureDefined } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { ceiledEven } from '../helpers/mathex';
import { TextWidthCache } from '../model/text-width-cache';
var MAX_COUNT = 200;
var LabelsImageCache = /** @class */ (function () {
    function LabelsImageCache(fontSize, color, fontFamily, fontStyle) {
        this._private__textWidthCache = new TextWidthCache(MAX_COUNT);
        this._private__fontSize = 0;
        this._private__color = '';
        this._private__font = '';
        this._private__keys = [];
        this._private__hash = new Map();
        this._private__fontSize = fontSize;
        this._private__color = color;
        this._private__font = makeFont(fontSize, fontFamily, fontStyle);
    }
    LabelsImageCache.prototype._internal_destroy = function () {
        delete this._private__textWidthCache;
        this._private__keys = [];
        this._private__hash.clear();
    };
    LabelsImageCache.prototype._internal_paintTo = function (ctx, text, x, y, align) {
        var label = this._private__getLabelImage(ctx, text);
        if (align !== 'left') {
            var pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            x -= Math.floor(label._internal_textWidth * pixelRatio);
        }
        y -= Math.floor(label._internal_height / 2);
        ctx.drawImage(label._internal_canvas, x, y, label._internal_width, label._internal_height);
    };
    LabelsImageCache.prototype._private__getLabelImage = function (ctx, text) {
        var _this = this;
        var item;
        if (this._private__hash.has(text)) {
            // Cache hit!
            item = ensureDefined(this._private__hash.get(text));
        }
        else {
            if (this._private__keys.length >= MAX_COUNT) {
                var key = ensureDefined(this._private__keys.shift());
                this._private__hash.delete(key);
            }
            var pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            var margin_1 = Math.ceil(this._private__fontSize / 4.5);
            var baselineOffset_1 = Math.round(this._private__fontSize / 10);
            var textWidth = Math.ceil(this._private__textWidthCache._internal_measureText(ctx, text));
            var width = ceiledEven(Math.round(textWidth + margin_1 * 2));
            var height_1 = ceiledEven(this._private__fontSize + margin_1 * 2);
            var canvas = createPreconfiguredCanvas(document, new Size(width, height_1));
            // Allocate new
            item = {
                _internal_text: text,
                _internal_textWidth: Math.round(Math.max(1, textWidth)),
                _internal_width: Math.ceil(width * pixelRatio),
                _internal_height: Math.ceil(height_1 * pixelRatio),
                _internal_canvas: canvas,
            };
            if (textWidth !== 0) {
                this._private__keys.push(item._internal_text);
                this._private__hash.set(item._internal_text, item);
            }
            ctx = getContext2D(item._internal_canvas);
            drawScaled(ctx, pixelRatio, function () {
                ctx.font = _this._private__font;
                ctx.fillStyle = _this._private__color;
                ctx.fillText(text, 0, height_1 - margin_1 - baselineOffset_1);
            });
        }
        return item;
    };
    return LabelsImageCache;
}());
export { LabelsImageCache };
