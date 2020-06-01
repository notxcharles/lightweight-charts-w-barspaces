import { drawHorizontalLine, drawVerticalLine, setLineStyle } from './draw-line';
var CrosshairRenderer = /** @class */ (function () {
    function CrosshairRenderer(data) {
        this._data = data;
    }
    CrosshairRenderer.prototype.draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        if (this._data === null) {
            return;
        }
        var vertLinesVisible = this._data.vertLine.visible;
        var horzLinesVisible = this._data.horzLine.visible;
        if (!vertLinesVisible && !horzLinesVisible) {
            return;
        }
        ctx.save();
        var x = Math.round(this._data.x * pixelRatio);
        var y = Math.round(this._data.y * pixelRatio);
        var w = Math.ceil(this._data.w * pixelRatio);
        var h = Math.ceil(this._data.h * pixelRatio);
        ctx.lineCap = 'butt';
        if (vertLinesVisible && x >= 0) {
            ctx.lineWidth = Math.floor(this._data.vertLine.lineWidth * pixelRatio);
            ctx.strokeStyle = this._data.vertLine.color;
            ctx.fillStyle = this._data.vertLine.color;
            setLineStyle(ctx, this._data.vertLine.lineStyle);
            drawVerticalLine(ctx, x, 0, h);
        }
        if (horzLinesVisible && y >= 0) {
            ctx.lineWidth = Math.floor(this._data.horzLine.lineWidth * pixelRatio);
            ctx.strokeStyle = this._data.horzLine.color;
            ctx.fillStyle = this._data.horzLine.color;
            setLineStyle(ctx, this._data.horzLine.lineStyle);
            drawHorizontalLine(ctx, y, 0, w);
        }
        ctx.restore();
    };
    return CrosshairRenderer;
}());
export { CrosshairRenderer };
