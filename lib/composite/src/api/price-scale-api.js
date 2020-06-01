import { ensureNotNull } from '../helpers/assertions';
import { isDefaultPriceScale } from '../model/default-price-scale';
var PriceScaleApi = /** @class */ (function () {
    function PriceScaleApi(chartWidget, priceScaleId) {
        this._chartWidget = chartWidget;
        this._priceScaleId = priceScaleId;
    }
    PriceScaleApi.prototype.destroy = function () {
        delete this._chartWidget;
    };
    PriceScaleApi.prototype.id = function () {
        return this._priceScale().id();
    };
    PriceScaleApi.prototype.applyOptions = function (options) {
        this._chartWidget.model().applyPriceScaleOptions(this._priceScaleId, options);
    };
    PriceScaleApi.prototype.options = function () {
        return this._priceScale().options();
    };
    PriceScaleApi.prototype.width = function () {
        if (!isDefaultPriceScale(this._priceScaleId)) {
            return 0;
        }
        return this._chartWidget.getPriceAxisWidth(this._priceScaleId === "left" /* Left */ ? 'left' : 'right');
    };
    PriceScaleApi.prototype._priceScale = function () {
        return ensureNotNull(this._chartWidget.model().findPriceScale(this._priceScaleId)).priceScale;
    };
    return PriceScaleApi;
}());
export { PriceScaleApi };
