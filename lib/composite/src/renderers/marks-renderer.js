import { __extends } from "tslib";
import { ScaledRenderer } from './scaled-renderer';
var PaneRendererMarks = /** @class */ (function (_super) {
    __extends(PaneRendererMarks, _super);
    function PaneRendererMarks() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._data = null;
        return _this;
    }
    PaneRendererMarks.prototype.setData = function (data) {
        this._data = data;
    };
    PaneRendererMarks.prototype._drawImpl = function (ctx) {
        if (this._data === null || this._data.visibleRange === null) {
            return;
        }
        var visibleRange = this._data.visibleRange;
        var data = this._data;
        var draw = function (radius) {
            ctx.beginPath();
            for (var i = visibleRange.to - 1; i >= visibleRange.from; --i) {
                var point = data.items[i];
                ctx.moveTo(point.x, point.y);
                ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
        };
        ctx.fillStyle = data.backColor;
        draw(data.radius + 2);
        ctx.fillStyle = data.lineColor;
        draw(data.radius);
    };
    return PaneRendererMarks;
}(ScaledRenderer));
export { PaneRendererMarks };
