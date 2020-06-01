import { visibleTimedValues } from '../../model/time-data';
var SeriesPaneViewBase = /** @class */ (function () {
    function SeriesPaneViewBase(series, model, extendedVisibleRange) {
        this._invalidated = true;
        this._dataInvalidated = true;
        this._items = [];
        this._itemsVisibleRange = null;
        this._series = series;
        this._model = model;
        this._extendedVisibleRange = extendedVisibleRange;
    }
    SeriesPaneViewBase.prototype.update = function (updateType) {
        this._invalidated = true;
        if (updateType === 'data') {
            this._dataInvalidated = true;
        }
    };
    SeriesPaneViewBase.prototype._makeValid = function () {
        if (this._dataInvalidated) {
            this._fillRawPoints();
            this._dataInvalidated = false;
        }
        if (this._invalidated) {
            this._updatePoints();
            this._invalidated = false;
        }
    };
    SeriesPaneViewBase.prototype._clearVisibleRange = function () {
        this._itemsVisibleRange = null;
    };
    SeriesPaneViewBase.prototype._updatePoints = function () {
        var priceScale = this._series.priceScale();
        var timeScale = this._model.timeScale();
        this._clearVisibleRange();
        if (timeScale.isEmpty() || priceScale.isEmpty()) {
            return;
        }
        var visibleBars = timeScale.visibleStrictRange();
        if (visibleBars === null) {
            return;
        }
        if (this._series.data().bars().size() === 0) {
            return;
        }
        var firstValue = this._series.firstValue();
        if (firstValue === null) {
            return;
        }
        this._itemsVisibleRange = visibleTimedValues(this._items, visibleBars, this._extendedVisibleRange);
        this._convertToCoordinates(priceScale, timeScale, firstValue.value);
    };
    return SeriesPaneViewBase;
}());
export { SeriesPaneViewBase };
