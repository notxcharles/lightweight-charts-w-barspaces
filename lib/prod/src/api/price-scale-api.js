import { ensureNotNull } from '../helpers/assertions';
import { isDefaultPriceScale } from '../model/default-price-scale';
var PriceScaleApi = /** @class */ (function () {
    function PriceScaleApi(chartWidget, priceScaleId) {
        this._private__chartWidget = chartWidget;
        this._private__priceScaleId = priceScaleId;
    }
    PriceScaleApi.prototype._internal_destroy = function () {
        delete this._private__chartWidget;
    };
    PriceScaleApi.prototype._internal_id = function () {
        return this._private__priceScale()._internal_id();
    };
    PriceScaleApi.prototype.applyOptions = function (options) {
        this._private__chartWidget._internal_model()._internal_applyPriceScaleOptions(this._private__priceScaleId, options);
    };
    PriceScaleApi.prototype.options = function () {
        return this._private__priceScale()._internal_options();
    };
    PriceScaleApi.prototype.width = function () {
        if (!isDefaultPriceScale(this._private__priceScaleId)) {
            return 0;
        }
        return this._private__chartWidget._internal_getPriceAxisWidth(this._private__priceScaleId === "left" /* Left */ ? 'left' : 'right');
    };
    PriceScaleApi.prototype._private__priceScale = function () {
        return ensureNotNull(this._private__chartWidget._internal_model()._internal_findPriceScale(this._private__priceScaleId))._internal_priceScale;
    };
    return PriceScaleApi;
}());
export { PriceScaleApi };
