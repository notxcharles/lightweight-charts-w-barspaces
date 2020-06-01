import { ensureNotNull } from '../helpers/assertions';
import { setLineStyle, strokeInPixel } from './draw-line';
var GridRenderer = /** @class */ (function () {
    function GridRenderer() {
        this._private__data = null;
    }
    GridRenderer.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    GridRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        var _this = this;
        if (this._private__data === null) {
            return;
        }
        var lineWidth = Math.floor(pixelRatio);
        ctx.lineWidth = lineWidth;
        var height = Math.ceil(this._private__data._internal_h * pixelRatio);
        var width = Math.ceil(this._private__data._internal_w * pixelRatio);
        strokeInPixel(ctx, function () {
            var data = ensureNotNull(_this._private__data);
            if (data._internal_vertLinesVisible) {
                ctx.strokeStyle = data._internal_vertLinesColor;
                setLineStyle(ctx, data._internal_vertLineStyle);
                ctx.beginPath();
                for (var _i = 0, _a = data._internal_timeMarks; _i < _a.length; _i++) {
                    var timeMark = _a[_i];
                    var x = Math.round(timeMark._internal_coord * pixelRatio);
                    ctx.moveTo(x, -lineWidth);
                    ctx.lineTo(x, height + lineWidth);
                }
                ctx.stroke();
            }
            if (data._internal_horzLinesVisible) {
                ctx.strokeStyle = data._internal_horzLinesColor;
                setLineStyle(ctx, data._internal_horzLineStyle);
                ctx.beginPath();
                for (var _b = 0, _c = data._internal_priceMarks; _b < _c.length; _b++) {
                    var priceMark = _c[_b];
                    var y = Math.round(priceMark._internal_coord * pixelRatio);
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
