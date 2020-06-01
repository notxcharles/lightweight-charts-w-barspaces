import { __extends } from "tslib";
import { ScaledRenderer } from './scaled-renderer';
var PaneRendererMarks = /** @class */ (function (_super) {
    __extends(PaneRendererMarks, _super);
    function PaneRendererMarks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._internal__data = null;
        return _this;
    }
    PaneRendererMarks.prototype._internal_setData = function (data) {
        this._internal__data = data;
    };
    PaneRendererMarks.prototype._internal__drawImpl = function (ctx) {
        if (this._internal__data === null || this._internal__data._internal_visibleRange === null) {
            return;
        }
        var visibleRange = this._internal__data._internal_visibleRange;
        var data = this._internal__data;
        var draw = function (radius) {
            ctx.beginPath();
            for (var i = visibleRange.to - 1; i >= visibleRange.from; --i) {
                var point = data._internal_items[i];
                ctx.moveTo(point._internal_x, point._internal_y);
                ctx.arc(point._internal_x, point._internal_y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
        };
        ctx.fillStyle = data._internal_backColor;
        draw(data._internal_radius + 2);
        ctx.fillStyle = data._internal_lineColor;
        draw(data._internal_radius);
    };
    return PaneRendererMarks;
}(ScaledRenderer));
export { PaneRendererMarks };
