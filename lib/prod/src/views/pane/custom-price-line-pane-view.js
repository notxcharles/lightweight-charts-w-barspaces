import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var CustomPriceLinePaneView = /** @class */ (function (_super) {
    __extends(CustomPriceLinePaneView, _super);
    function CustomPriceLinePaneView(series, priceLine) {
        var _this = _super.call(this, series) || this;
        _this._private__priceLine = priceLine;
        return _this;
    }
    CustomPriceLinePaneView.prototype._internal__updateImpl = function (height, width) {
        var data = this._internal__lineRendererData;
        data._internal_visible = false;
        var y = this._private__priceLine._internal_yCoord();
        if (y === null) {
            return;
        }
        var lineOptions = this._private__priceLine._internal_options();
        data._internal_visible = true;
        data._internal_y = y;
        data._internal_color = lineOptions.color;
        data._internal_width = width;
        data._internal_height = height;
        data._internal_lineWidth = lineOptions.lineWidth;
        data._internal_lineStyle = lineOptions.lineStyle;
    };
    return CustomPriceLinePaneView;
}(SeriesHorizontalLinePaneView));
export { CustomPriceLinePaneView };
