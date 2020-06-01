import { ensureNotNull } from '../helpers/assertions';
import { setLineStyle, strokeInPixel } from './draw-line';
var GridRenderer = /** @class */ (function () {
    function GridRenderer() {
        this._data = null;
    }
    GridRenderer.prototype.setData = function (data) {
        this._data = data;
    };
    GridRenderer.prototype.draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        var _this = this;
        if (this._data === null) {
            return;
        }
        var lineWidth = Math.floor(pixelRatio);
        ctx.lineWidth = lineWidth;
        var height = Math.ceil(this._data.h * pixelRatio);
        var width = Math.ceil(this._data.w * pixelRatio);
        strokeInPixel(ctx, function () {
            var data = ensureNotNull(_this._data);
            if (data.vertLinesVisible) {
                ctx.strokeStyle = data.vertLinesColor;
                setLineStyle(ctx, data.vertLineStyle);
                ctx.beginPath();
                for (var _i = 0, _a = data.timeMarks; _i < _a.length; _i++) {
                    var timeMark = _a[_i];
                    var x = Math.round(timeMark.coord * pixelRatio);
                    ctx.moveTo(x, -lineWidth);
                    ctx.lineTo(x, height + lineWidth);
                }
                ctx.stroke();
            }
            if (data.horzLinesVisible) {
                ctx.strokeStyle = data.horzLinesColor;
                setLineStyle(ctx, data.horzLineStyle);
                ctx.beginPath();
                for (var _b = 0, _c = data.priceMarks; _b < _c.length; _b++) {
                    var priceMark = _c[_b];
                    var y = Math.round(priceMark.coord * pixelRatio);
                    ctx.moveTo(-lineWidth, y);
                    ctx.lineTo(width + lineWidth, y);
                }
                ctx.stroke();
            }
        });
    };
    return GridRenderer;
}());
export { GridRenderer };
