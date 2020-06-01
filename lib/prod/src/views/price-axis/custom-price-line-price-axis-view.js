import { __extends } from "tslib";
import { generateTextColor } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var CustomPriceLinePriceAxisView = /** @class */ (function (_super) {
    __extends(CustomPriceLinePriceAxisView, _super);
    function CustomPriceLinePriceAxisView(series, priceLine) {
        var _this = _super.call(this) || this;
        _this._private__series = series;
        _this._private__priceLine = priceLine;
        return _this;
    }
    CustomPriceLinePriceAxisView.prototype._internal__updateRendererData = function (axisRendererData, paneRendererData, commonData) {
        axisRendererData._internal_visible = false;
        paneRendererData._internal_visible = false;
        var options = this._private__priceLine._internal_options();
        var labelVisible = options.axisLabelVisible;
        if (!labelVisible) {
            return;
        }
        var y = this._private__priceLine._internal_yCoord();
        if (y === null) {
            return;
        }
        axisRendererData._internal_text = this._private__series._internal_priceScale()._internal_formatPriceAbsolute(options.price);
        axisRendererData._internal_visible = true;
        commonData._internal_background = options.color;
        commonData._internal_color = generateTextColor(options.color);
        commonData._internal_coordinate = y;
    };
    return CustomPriceLinePriceAxisView;
}(PriceAxisView));
export { CustomPriceLinePriceAxisView };
