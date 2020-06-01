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
        this._series = series;
        this._dataUpdatesConsumer = dataUpdatesConsumer;
        this._priceScaleApiProvider = priceScaleApiProvider;
    }
    SeriesApi.prototype.destroy = function () {
        delete this._series;
        delete this._dataUpdatesConsumer;
    };
    SeriesApi.prototype.priceFormatter = function () {
        return this._series.formatter();
    };
    SeriesApi.prototype.series = function () {
        return this._series;
    };
    SeriesApi.prototype.priceToCoordinate = function (price) {
        var firstValue = this._series.firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._series.priceScale().priceToCoordinate(price, firstValue.value);
    };
    SeriesApi.prototype.coordinateToPrice = function (coordinate) {
        var firstValue = this._series.firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._series.priceScale().coordinateToPrice(coordinate, firstValue.value);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    SeriesApi.prototype.barsInLogicalRange = function (range) {
        if (range === null) {
            return null;
        }
        // we use TimeScaleVisibleRange here to convert LogicalRange to strict range properly
        var correctedRange = new TimeScaleVisibleRange(new RangeImpl(range.from, range.to)).strictRange();
        var bars = this._series.data().bars();
        if (bars.isEmpty()) {
            return null;
        }
        var dataFirstBarInRange = bars.search(correctedRange.left(), 1 /* NearestRight */);
        var dataLastBarInRange = bars.search(correctedRange.right(), -1 /* NearestLeft */);
        var dataFirstIndex = ensureNotNull(bars.firstIndex());
        var dataLastIndex = ensureNotNull(bars.lastIndex());
        // this means that we request data in the data gap
        // e.g. let's say we have series with data [0..10, 30..60]
        // and we request bars info in range [15, 25]
        // thus, dataFirstBarInRange will be with index 30 and dataLastBarInRange with 10
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null && dataFirstBarInRange.index > dataLastBarInRange.index) {
            return {
                barsBefore: range.from - dataFirstIndex,
                barsAfter: dataLastIndex - range.to,
            };
        }
        var barsBefore = (dataFirstBarInRange === null || dataFirstBarInRange.index === dataFirstIndex)
            ? range.from - dataFirstIndex
            : dataFirstBarInRange.index - dataFirstIndex;
        var barsAfter = (dataLastBarInRange === null || dataLastBarInRange.index === dataLastIndex)
            ? dataLastIndex - range.to
            : dataLastIndex - dataLastBarInRange.index;
        var result = { barsBefore: barsBefore, barsAfter: barsAfter };
        // actually they can't exist separately
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null) {
            result.from = dataFirstBarInRange.time.businessDay || dataFirstBarInRange.time.timestamp;
            result.to = dataLastBarInRange.time.businessDay || dataLastBarInRange.time.timestamp;
        }
        return result;
    };
    SeriesApi.prototype.setData = function (data) {
        this._dataUpdatesConsumer.applyNewData(this._series, data);
    };
    SeriesApi.prototype.update = function (bar) {
        this._dataUpdatesConsumer.updateData(this._series, bar);
    };
    SeriesApi.prototype.setMarkers = function (data) {
        var convertedMarkers = data.map(function (marker) { return (__assign(__assign({}, marker), { time: convertTime(marker.time) })); });
        this._series.setMarkers(convertedMarkers);
    };
    SeriesApi.prototype.applyOptions = function (options) {
        var migratedOptions = migrateOptions(options);
        this._series.applyOptions(migratedOptions);
    };
    SeriesApi.prototype.options = function () {
        return clone(this._series.options());
    };
    SeriesApi.prototype.priceScale = function () {
        return this._priceScaleApiProvider.priceScale(this._series.priceScale().id());
    };
    SeriesApi.prototype.createPriceLine = function (options) {
        var strictOptions = merge(clone(priceLineOptionsDefaults), options);
        var priceLine = this._series.createPriceLine(strictOptions);
        return new PriceLine(priceLine);
    };
    SeriesApi.prototype.removePriceLine = function (line) {
        this._series.removePriceLine(line.priceLine());
    };
    return SeriesApi;
}());
export { SeriesApi };
