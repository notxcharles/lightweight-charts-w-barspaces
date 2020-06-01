import { __extends } from "tslib";
import { generateTextColor } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var CrosshairPriceAxisView = /** @class */ (function (_super) {
    __extends(CrosshairPriceAxisView, _super);
    function CrosshairPriceAxisView(source, priceScale, valueProvider) {
        var _this = _super.call(this) || this;
        _this._source = source;
        _this._priceScale = priceScale;
        _this._valueProvider = valueProvider;
        return _this;
    }
    CrosshairPriceAxisView.prototype._updateRendererData = function (axisRendererData, paneRendererData, commonRendererData) {
        axisRendererData.visible = false;
        var options = this._source.options().horzLine;
        if (!options.labelVisible) {
            return;
        }
        var firstValue = this._priceScale.firstValue();
        if (!this._source.visible() || this._priceScale.isEmpty() || (firstValue === null)) {
            return;
        }
        commonRendererData.background = options.labelBackgroundColor;
        commonRendererData.color = generateTextColor(options.labelBackgroundColor);
        var value = this._valueProvider(this._priceScale);
        commonRendererData.coordinate = value.coordinate;
        axisRendererData.text = this._priceScale.formatPrice(value.price, firstValue);
        axisRendererData.visible = true;
    };
    return CrosshairPriceAxisView;
}(PriceAxisView));
export { CrosshairPriceAxisView };
