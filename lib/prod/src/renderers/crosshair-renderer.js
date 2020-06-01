import { drawHorizontalLine, drawVerticalLine, setLineStyle } from './draw-line';
var CrosshairRenderer = /** @class */ (function () {
    function CrosshairRenderer(data) {
        this._private__data = data;
    }
    CrosshairRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null) {
            return;
        }
        var vertLinesVisible = this._private__data._internal_vertLine._internal_visible;
        var horzLinesVisible = this._private__data._internal_horzLine._internal_visible;
        if (!vertLinesVisible && !horzLinesVisible) {
            return;
        }
        ctx.save();
        var x = Math.round(this._private__data._internal_x * pixelRatio);
        var y = Math.round(this._private__data._internal_y * pixelRatio);
        var w = Math.ceil(this._private__data._internal_w * pixelRatio);
        var h = Math.ceil(this._private__data._internal_h * pixelRatio);
        ctx.lineCap = 'butt';
        if (vertLinesVisible && x >= 0) {
            ctx.lineWidth = Math.floor(this._private__data._internal_vertLine._internal_lineWidth * pixelRatio);
            ctx.strokeStyle = this._private__data._internal_vertLine._internal_color;
            ctx.fillStyle = this._private__data._internal_vertLine._internal_color;
            setLineStyle(ctx, this._private__data._internal_vertLine._internal_lineStyle);
            drawVerticalLine(ctx, x, 0, h);
        }
        if (horzLinesVisible && y >= 0) {
            ctx.lineWidth = Math.floor(this._private__data._internal_horzLine._internal_lineWidth * pixelRatio);
            ctx.strokeStyle = this._private__data._internal_horzLine._internal_color;
            ctx.fillStyle = this._private__data._internal_horzLine._internal_color;
            setLineStyle(ctx, this._private__data._internal_horzLine._internal_lineStyle);
            drawHorizontalLine(ctx, y, 0, w);
        }
        ctx.restore();
    };
    return CrosshairRenderer;
}());
export { CrosshairRenderer };
