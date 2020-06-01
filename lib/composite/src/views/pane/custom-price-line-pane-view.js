import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var CustomPriceLinePaneView = /** @class */ (function (_super) {
    __extends(CustomPriceLinePaneView, _super);
    function CustomPriceLinePaneView(series, priceLine) {
        var _this = _super.call(this, series) || this;
        _this._priceLine = priceLine;
        return _this;
    }
    CustomPriceLinePaneView.prototype._updateImpl = function (height, width) {
        var data = this._lineRendererData;
        data.visible = false;
        var y = this._priceLine.yCoord();
        if (y === null) {
            return;
        }
        var lineOptions = this._priceLine.options();
        data.visible = true;
        data.y = y;
        data.color = lineOptions.color;
        data.width = width;
        data.height = height;
        data.lineWidth = lineOptions.lineWidth;
        data.lineStyle = lineOptions.lineStyle;
    };
    return CustomPriceLinePaneView;
}(SeriesHorizontalLinePaneView));
export { CustomPriceLinePaneView };
