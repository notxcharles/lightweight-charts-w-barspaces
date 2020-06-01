import { __extends } from "tslib";
import { generateTextColor } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var CrosshairPriceAxisView = /** @class */ (function (_super) {
    __extends(CrosshairPriceAxisView, _super);
    function CrosshairPriceAxisView(source, priceScale, valueProvider) {
        var _this = _super.call(this) || this;
        _this._private__source = source;
        _this._private__priceScale = priceScale;
        _this._private__valueProvider = valueProvider;
        return _this;
    }
    CrosshairPriceAxisView.prototype._internal__updateRendererData = function (axisRendererData, paneRendererData, commonRendererData) {
        axisRendererData._internal_visible = false;
        var options = this._private__source._internal_options().horzLine;
        if (!options.labelVisible) {
            return;
        }
        var firstValue = this._private__priceScale._internal_firstValue();
        if (!this._private__source._internal_visible() || this._private__priceScale._internal_isEmpty() || (firstValue === null)) {
            return;
        }
        commonRendererData._internal_background = options.labelBackgroundColor;
        commonRendererData._internal_color = generateTextColor(options.labelBackgroundColor);
        var value = this._private__valueProvider(this._private__priceScale);
        commonRendererData._internal_coordinate = value._internal_coordinate;
        axisRendererData._internal_text = this._private__priceScale._internal_formatPrice(value._internal_price, firstValue);
        axisRendererData._internal_visible = true;
    };
    return CrosshairPriceAxisView;
}(PriceAxisView));
export { CrosshairPriceAxisView };
