import { __extends } from "tslib";
import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
var PaneRendererArea = /** @class */ (function (_super) {
    __extends(PaneRendererArea, _super);
    function PaneRendererArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._internal__data = null;
        return _this;
    }
    PaneRendererArea.prototype._internal_setData = function (data) {
        this._internal__data = data;
    };
    PaneRendererArea.prototype._internal__drawImpl = function (ctx) {
        if (this._internal__data === null || this._internal__data._internal_items.length === 0 || this._internal__data._internal_visibleRange === null) {
            return;
        }
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this._internal__data._internal_lineColor;
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        // walk lines with width=1 to have more accurate gradient's filling
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_bottom);
        ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_y);
        walkLine(ctx, this._internal__data._internal_items, this._internal__data._internal_lineType, this._internal__data._internal_visibleRange);
        if (this._internal__data._internal_visibleRange.to > this._internal__data._internal_visibleRange.from) {
            ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.to - 1]._internal_x, this._internal__data._internal_bottom);
            ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_bottom);
        }
        ctx.closePath();
        var gradient = ctx.createLinearGradient(0, 0, 0, this._internal__data._internal_bottom);
        gradient.addColorStop(0, this._internal__data._internal_topColor);
        gradient.addColorStop(1, this._internal__data._internal_bottomColor);
        ctx.fillStyle = gradient;
        ctx.fill();
    };
    return PaneRendererArea;
}(ScaledRenderer));
export { PaneRendererArea };
