import { __extends } from "tslib";
import { generateTextColor } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var CustomPriceLinePriceAxisView = /** @class */ (function (_super) {
    __extends(CustomPriceLinePriceAxisView, _super);
    function CustomPriceLinePriceAxisView(series, priceLine) {
        var _this = _super.call(this) || this;
        _this._series = series;
        _this._priceLine = priceLine;
        return _this;
    }
    CustomPriceLinePriceAxisView.prototype._updateRendererData = function (axisRendererData, paneRendererData, commonData) {
        axisRendererData.visible = false;
        paneRendererData.visible = false;
        var options = this._priceLine.options();
        var labelVisible = options.axisLabelVisible;
        if (!labelVisible) {
            return;
        }
        var y = this._priceLine.yCoord();
        if (y === null) {
            return;
        }
        axisRendererData.text = this._series.priceScale().formatPriceAbsolute(options.price);
        axisRendererData.visible = true;
        commonData.background = options.color;
        commonData.color = generateTextColor(options.color);
        commonData.coordinate = y;
    };
    return CustomPriceLinePriceAxisView;
}(PriceAxisView));
export { CustomPriceLinePriceAxisView };
