import { __assign, __rest } from "tslib";
import { ensureNotNull } from '../helpers/assertions';
import { clone, merge } from '../helpers/strict-type-checks';
import { RangeImpl } from '../model/range-impl';
import { TimeScaleVisibleRange } from '../model/time-scale-visible-range';
import { convertTime } from './data-layer';
import { priceLineOptionsDefaults } from './options/price-line-options-defaults';
import { PriceLine } from './price-line-api';
function migrateOptions(options) {
    // tslint:disable-next-line:deprecation
    var overlay = options.overlay, res = __rest(options, ["overlay"]);
    if (overlay) {
        res.priceScaleId = '';
    }
    return res;
}
var SeriesApi = /** @class */ (function () {
    function SeriesApi(series, dataUpdatesConsumer, priceScaleApiProvider) {
        this._internal__series = series;
        this._internal__dataUpdatesConsumer = dataUpdatesConsumer;
        this._private__priceScaleApiProvider = priceScaleApiProvider;
    }
    SeriesApi.prototype._internal_destroy = function () {
        delete this._internal__series;
        delete this._internal__dataUpdatesConsumer;
    };
    SeriesApi.prototype.priceFormatter = function () {
        return this._internal__series._internal_formatter();
    };
    SeriesApi.prototype._internal_series = function () {
        return this._internal__series;
    };
    SeriesApi.prototype.priceToCoordinate = function (price) {
        var firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._internal__series._internal_priceScale()._internal_priceToCoordinate(price, firstValue._internal_value);
    };
    SeriesApi.prototype.coordinateToPrice = function (coordinate) {
        var firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._internal__series._internal_priceScale()._internal_coordinateToPrice(coordinate, firstValue._internal_value);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    SeriesApi.prototype.barsInLogicalRange = function (range) {
        if (range === null) {
            return null;
        }
        // we use TimeScaleVisibleRange here to convert LogicalRange to strict range properly
        var correctedRange = new TimeScaleVisibleRange(new RangeImpl(range.from, range.to))._internal_strictRange();
        var bars = this._internal__series._internal_data()._internal_bars();
        if (bars._internal_isEmpty()) {
            return null;
        }
        var dataFirstBarInRange = bars._internal_search(correctedRange._internal_left(), 1 /* NearestRight */);
        var dataLastBarInRange = bars._internal_search(correctedRange._internal_right(), -1 /* NearestLeft */);
        var dataFirstIndex = ensureNotNull(bars._internal_firstIndex());
        var dataLastIndex = ensureNotNull(bars._internal_lastIndex());
        // this means that we request data in the data gap
        // e.g. let's say we have series with data [0..10, 30..60]
        // and we request bars info in range [15, 25]
        // thus, dataFirstBarInRange will be with index 30 and dataLastBarInRange with 10
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null && dataFirstBarInRange._internal_index > dataLastBarInRange._internal_index) {
            return {
                barsBefore: range.from - dataFirstIndex,
                barsAfter: dataLastIndex - range.to,
            };
        }
        var barsBefore = (dataFirstBarInRange === null || dataFirstBarInRange._internal_index === dataFirstIndex)
            ? range.from - dataFirstIndex
            : dataFirstBarInRange._internal_index - dataFirstIndex;
        var barsAfter = (dataLastBarInRange === null || dataLastBarInRange._internal_index === dataLastIndex)
            ? dataLastIndex - range.to
            : dataLastIndex - dataLastBarInRange._internal_index;
        var result = { barsBefore: barsBefore, barsAfter: barsAfter };
        // actually they can't exist separately
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null) {
            result.from = dataFirstBarInRange._internal_time.businessDay || dataFirstBarInRange._internal_time.timestamp;
            result.to = dataLastBarInRange._internal_time.businessDay || dataLastBarInRange._internal_time.timestamp;
        }
        return result;
    };
    SeriesApi.prototype.setData = function (data) {
        this._internal__dataUpdatesConsumer._internal_applyNewData(this._internal__series, data);
    };
    SeriesApi.prototype.update = function (bar) {
        this._internal__dataUpdatesConsumer._internal_updateData(this._internal__series, bar);
    };
    SeriesApi.prototype.setMarkers = function (data) {
        var convertedMarkers = data.map(function (marker) { return (__assign(__assign({}, marker), { time: convertTime(marker.time) })); });
        this._internal__series._internal_setMarkers(convertedMarkers);
    };
    SeriesApi.prototype.applyOptions = function (options) {
        var migratedOptions = migrateOptions(options);
        this._internal__series._internal_applyOptions(migratedOptions);
    };
    SeriesApi.prototype.options = function () {
        return clone(this._internal__series._internal_options());
    };
    SeriesApi.prototype.priceScale = function () {
        return this._private__priceScaleApiProvider._internal_priceScale(this._internal__series._internal_priceScale()._internal_id());
    };
    SeriesApi.prototype.createPriceLine = function (options) {
        var strictOptions = merge(clone(priceLineOptionsDefaults), options);
        var priceLine = this._internal__series._internal_createPriceLine(strictOptions);
        return new PriceLine(priceLine);
    };
    SeriesApi.prototype.removePriceLine = function (line) {
        this._internal__series._internal_removePriceLine(line._internal_priceLine());
    };
    return SeriesApi;
}());
export { SeriesApi };
