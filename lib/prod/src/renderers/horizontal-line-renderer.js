import { drawHorizontalLine, setLineStyle } from './draw-line';
var HorizontalLineRenderer = /** @class */ (function () {
    function HorizontalLineRenderer() {
        this._private__data = null;
    }
    HorizontalLineRenderer.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    HorizontalLineRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null) {
            return;
        }
        if (this._private__data._internal_visible === false) {
            return;
        }
        var y = Math.round(this._private__data._internal_y * pixelRatio);
        if (y < 0 || y > Math.ceil(this._private__data._internal_height * pixelRatio)) {
            return;
        }
        var width = Math.ceil(this._private__data._internal_width * pixelRatio);
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this._private__data._internal_color;
        ctx.lineWidth = Math.floor(this._private__data._internal_lineWidth * pixelRatio);
        setLineStyle(ctx, this._private__data._internal_lineStyle);
        drawHorizontalLine(ctx, y, 0, width);
    };
    return HorizontalLineRenderer;
}());
export { HorizontalLineRenderer };
