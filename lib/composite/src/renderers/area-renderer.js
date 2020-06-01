import { __extends } from "tslib";
import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
var PaneRendererArea = /** @class */ (function (_super) {
    __extends(PaneRendererArea, _super);
    function PaneRendererArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._data = null;
        return _this;
    }
    PaneRendererArea.prototype.setData = function (data) {
        this._data = data;
    };
    PaneRendererArea.prototype._drawImpl = function (ctx) {
        if (this._data === null || this._data.items.length === 0 || this._data.visibleRange === null) {
            return;
        }
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this._data.lineColor;
        ctx.lineWidth = this._data.lineWidth;
        setLineStyle(ctx, this._data.lineStyle);
        // walk lines with width=1 to have more accurate gradient's filling
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this._data.items[this._data.visibleRange.from].x, this._data.bottom);
        ctx.lineTo(this._data.items[this._data.visibleRange.from].x, this._data.items[this._data.visibleRange.from].y);
        walkLine(ctx, this._data.items, this._data.lineType, this._data.visibleRange);
        if (this._data.visibleRange.to > this._data.visibleRange.from) {
            ctx.lineTo(this._data.items[this._data.visibleRange.to - 1].x, this._data.bottom);
            ctx.lineTo(this._data.items[this._data.visibleRange.from].x, this._data.bottom);
        }
        ctx.closePath();
        var gradient = ctx.createLinearGradient(0, 0, 0, this._data.bottom);
        gradient.addColorStop(0, this._data.topColor);
        gradient.addColorStop(1, this._data.bottomColor);
        ctx.fillStyle = gradient;
        ctx.fill();
    };
    return PaneRendererArea;
}(ScaledRenderer));
export { PaneRendererArea };
