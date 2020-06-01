import { merge } from '../helpers/strict-type-checks';
import { CustomPriceLinePaneView } from '../views/pane/custom-price-line-pane-view';
import { CustomPriceLinePriceAxisView } from '../views/price-axis/custom-price-line-price-axis-view';
var CustomPriceLine = /** @class */ (function () {
    function CustomPriceLine(series, options) {
        this._series = series;
        this._options = options;
        this._priceLineView = new CustomPriceLinePaneView(series, this);
        this._priceAxisView = new CustomPriceLinePriceAxisView(series, this);
    }
    CustomPriceLine.prototype.applyOptions = function (options) {
        merge(this._options, options);
        this.update();
        this._series.model().lightUpdate();
    };
    CustomPriceLine.prototype.options = function () {
        return this._options;
    };
    CustomPriceLine.prototype.paneView = function () {
        return this._priceLineView;
    };
    CustomPriceLine.prototype.priceAxisView = function () {
        return this._priceAxisView;
    };
    CustomPriceLine.prototype.update = function () {
        this._priceLineView.update();
        this._priceAxisView.update();
    };
    CustomPriceLine.prototype.yCoord = function () {
        var series = this._series;
        var priceScale = series.priceScale();
        var timeScale = series.model().timeScale();
        if (timeScale.isEmpty() || priceScale.isEmpty()) {
            return null;
        }
        var firstValue = series.firstValue();
        if (firstValue === null) {
            return null;
        }
        return priceScale.priceToCoordinate(this._options.price, firstValue.value);
    };
    return CustomPriceLine;
}());
export { CustomPriceLine };
