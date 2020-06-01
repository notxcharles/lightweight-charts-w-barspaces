import { drawHorizontalLine, setLineStyle } from './draw-line';
var HorizontalLineRenderer = /** @class */ (function () {
    function HorizontalLineRenderer() {
        this._data = null;
    }
    HorizontalLineRenderer.prototype.setData = function (data) {
        this._data = data;
    };
    HorizontalLineRenderer.prototype.draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._data === null) {
            return;
        }
        if (this._data.visible === false) {
            return;
        }
        var y = Math.round(this._data.y * pixelRatio);
        if (y < 0 || y > Math.ceil(this._data.height * pixelRatio)) {
            return;
        }
        var width = Math.ceil(this._data.width * pixelRatio);
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this._data.color;
        ctx.lineWidth = Math.floor(this._data.lineWidth * pixelRatio);
        setLineStyle(ctx, this._data.lineStyle);
        drawHorizontalLine(ctx, y, 0, width);
    };
    return HorizontalLineRenderer;
}());
export { HorizontalLineRenderer };
