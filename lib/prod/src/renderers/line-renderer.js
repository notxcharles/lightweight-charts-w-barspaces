import { __extends } from "tslib";
import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
var PaneRendererLine = /** @class */ (function (_super) {
    __extends(PaneRendererLine, _super);
    function PaneRendererLine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._internal__data = null;
        return _this;
    }
    PaneRendererLine.prototype._internal_setData = function (data) {
        this._internal__data = data;
    };
    PaneRendererLine.prototype._internal__drawImpl = function (ctx) {
        if (this._internal__data === null || this._internal__data._internal_items.length === 0 || this._internal__data._internal_visibleRange === null) {
            return;
        }
        ctx.lineCap = 'square';
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        ctx.strokeStyle = this._internal__data._internal_lineColor;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        walkLine(ctx, this._internal__data._internal_items, this._internal__data._internal_lineType, this._internal__data._internal_visibleRange);
        ctx.stroke();
    };
    return PaneRendererLine;
}(ScaledRenderer));
export { PaneRendererLine };
