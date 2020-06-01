import { visibleTimedValues } from '../../model/time-data';
var SeriesPaneViewBase = /** @class */ (function () {
    function SeriesPaneViewBase(series, model, extendedVisibleRange) {
        this._internal__invalidated = true;
        this._internal__dataInvalidated = true;
        this._internal__items = [];
        this._internal__itemsVisibleRange = null;
        this._internal__series = series;
        this._internal__model = model;
        this._private__extendedVisibleRange = extendedVisibleRange;
    }
    SeriesPaneViewBase.prototype._internal_update = function (updateType) {
        this._internal__invalidated = true;
        if (updateType === 'data') {
            this._internal__dataInvalidated = true;
        }
    };
    SeriesPaneViewBase.prototype._internal__makeValid = function () {
        if (this._internal__dataInvalidated) {
            this._internal__fillRawPoints();
            this._internal__dataInvalidated = false;
        }
        if (this._internal__invalidated) {
            this._internal__updatePoints();
            this._internal__invalidated = false;
        }
    };
    SeriesPaneViewBase.prototype._internal__clearVisibleRange = function () {
        this._internal__itemsVisibleRange = null;
    };
    SeriesPaneViewBase.prototype._internal__updatePoints = function () {
        var priceScale = this._internal__series._internal_priceScale();
        var timeScale = this._internal__model._internal_timeScale();
        this._internal__clearVisibleRange();
        if (timeScale._internal_isEmpty() || priceScale._internal_isEmpty()) {
            return;
        }
        var visibleBars = timeScale._internal_visibleStrictRange();
        if (visibleBars === null) {
            return;
        }
        if (this._internal__series._internal_data()._internal_bars()._internal_size() === 0) {
            return;
        }
        var firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return;
        }
        this._internal__itemsVisibleRange = visibleTimedValues(this._internal__items, visibleBars, this._private__extendedVisibleRange);
        this._internal__convertToCoordinates(priceScale, timeScale, firstValue._internal_value);
    };
    return SeriesPaneViewBase;
}());
export { SeriesPaneViewBase };
