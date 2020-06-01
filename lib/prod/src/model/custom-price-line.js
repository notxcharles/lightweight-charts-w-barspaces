import { merge } from '../helpers/strict-type-checks';
import { CustomPriceLinePaneView } from '../views/pane/custom-price-line-pane-view';
import { CustomPriceLinePriceAxisView } from '../views/price-axis/custom-price-line-price-axis-view';
var CustomPriceLine = /** @class */ (function () {
    function CustomPriceLine(series, options) {
        this._private__series = series;
        this._private__options = options;
        this._private__priceLineView = new CustomPriceLinePaneView(series, this);
        this._private__priceAxisView = new CustomPriceLinePriceAxisView(series, this);
    }
    CustomPriceLine.prototype._internal_applyOptions = function (options) {
        merge(this._private__options, options);
        this._internal_update();
        this._private__series._internal_model()._internal_lightUpdate();
    };
    CustomPriceLine.prototype._internal_options = function () {
        return this._private__options;
    };
    CustomPriceLine.prototype._internal_paneView = function () {
        return this._private__priceLineView;
    };
    CustomPriceLine.prototype._internal_priceAxisView = function () {
        return this._private__priceAxisView;
    };
    CustomPriceLine.prototype._internal_update = function () {
        this._private__priceLineView._internal_update();
        this._private__priceAxisView._internal_update();
    };
    CustomPriceLine.prototype._internal_yCoord = function () {
        var series = this._private__series;
        var priceScale = series._internal_priceScale();
        var timeScale = series._internal_model()._internal_timeScale();
        if (timeScale._internal_isEmpty() || priceScale._internal_isEmpty()) {
            return null;
        }
        var firstValue = series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        return priceScale._internal_priceToCoordinate(this._private__options.price, firstValue._internal_value);
    };
    return CustomPriceLine;
}());
export { CustomPriceLine };
