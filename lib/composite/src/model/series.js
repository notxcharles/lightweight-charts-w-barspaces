import { __assign, __extends, __spreadArrays } from "tslib";
import { PercentageFormatter } from '../formatters/percentage-formatter';
import { PriceFormatter } from '../formatters/price-formatter';
import { VolumeFormatter } from '../formatters/volume-formatter';
import { ensureNotNull } from '../helpers/assertions';
import { isInteger, merge } from '../helpers/strict-type-checks';
import { SeriesAreaPaneView } from '../views/pane/area-pane-view';
import { SeriesBarsPaneView } from '../views/pane/bars-pane-view';
import { SeriesCandlesticksPaneView } from '../views/pane/candlesticks-pane-view';
import { SeriesHistogramPaneView } from '../views/pane/histogram-pane-view';
import { SeriesLinePaneView } from '../views/pane/line-pane-view';
import { PanePriceAxisView } from '../views/pane/pane-price-axis-view';
import { SeriesHorizontalBaseLinePaneView } from '../views/pane/series-horizontal-base-line-pane-view';
import { SeriesMarkersPaneView } from '../views/pane/series-markers-pane-view';
import { SeriesPriceLinePaneView } from '../views/pane/series-price-line-pane-view';
import { SeriesPriceAxisView } from '../views/price-axis/series-price-axis-view';
import { AutoscaleInfoImpl } from './autoscale-info-impl';
import { CustomPriceLine } from './custom-price-line';
import { isDefaultPriceScale } from './default-price-scale';
import { Palette } from './palette';
import { PriceDataSource } from './price-data-source';
import { PriceRangeImpl } from './price-range-impl';
import { SeriesBarColorer } from './series-bar-colorer';
import { barFunction, SeriesData } from './series-data';
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series(model, options, seriesType) {
        var _this = _super.call(this, model) || this;
        _this._data = new SeriesData();
        _this._priceLineView = new SeriesPriceLinePaneView(_this);
        _this._customPriceLines = [];
        _this._baseHorizontalLineView = new SeriesHorizontalBaseLinePaneView(_this);
        _this._endOfData = false;
        _this._barColorerCache = null;
        _this._palette = new Palette();
        _this._markers = [];
        _this._indexedMarkers = [];
        _this._options = options;
        _this._seriesType = seriesType;
        var priceAxisView = new SeriesPriceAxisView(_this, { model: model });
        _this._priceAxisViews = [priceAxisView];
        _this._panePriceAxisView = new PanePriceAxisView(priceAxisView, _this, model);
        _this._recreateFormatter();
        _this._updateBarFunction();
        _this._barFunction = _this.barFunction(); // redundant
        _this._recreatePaneViews();
        return _this;
    }
    Series.prototype.destroy = function () {
    };
    Series.prototype.endOfData = function () {
        return this._endOfData;
    };
    Series.prototype.priceLineColor = function (lastBarColor) {
        return this._options.priceLineColor || lastBarColor;
    };
    // returns object with:
    // formatted price
    // raw price (if withRawPrice)
    // coordinate
    // color
    // or { "noData":true } if last value could not be found
    // NOTE: should NEVER return null or undefined!
    Series.prototype.lastValueData = function (plot, globalLast, withRawPrice) {
        var noDataRes = { noData: true };
        var priceScale = this.priceScale();
        if (this.model().timeScale().isEmpty() || priceScale.isEmpty() || this.data().isEmpty()) {
            return noDataRes;
        }
        var visibleBars = this.model().timeScale().visibleStrictRange();
        var firstValue = this.firstValue();
        if (visibleBars === null || firstValue === null) {
            return noDataRes;
        }
        // find range of bars inside range
        // TODO: make it more optimal
        var bar;
        var lastIndex;
        if (globalLast) {
            var lastBar = this.data().bars().last();
            if (lastBar === null) {
                return noDataRes;
            }
            bar = lastBar;
            lastIndex = lastBar.index;
        }
        else {
            var endBar = this.data().bars().search(visibleBars.right(), -1 /* NearestLeft */);
            if (endBar === null) {
                return noDataRes;
            }
            bar = this.data().bars().valueAt(endBar.index);
            if (bar === null) {
                return noDataRes;
            }
            lastIndex = endBar.index;
        }
        var price = plot !== undefined ? bar.value[plot] : this._barFunction(bar.value);
        var barColorer = this.barColorer();
        var style = barColorer.barStyle(lastIndex, { value: bar });
        var coordinate = priceScale.priceToCoordinate(price, firstValue.value);
        return {
            noData: false,
            price: withRawPrice ? price : undefined,
            text: priceScale.formatPrice(price, firstValue.value),
            formattedPriceAbsolute: priceScale.formatPriceAbsolute(price),
            formattedPricePercentage: priceScale.formatPricePercentage(price, firstValue.value),
            color: style.barColor,
            coordinate: coordinate,
            index: lastIndex,
        };
    };
    Series.prototype.data = function () {
        return this._data;
    };
    Series.prototype.barColorer = function () {
        if (this._barColorerCache !== null) {
            return this._barColorerCache;
        }
        this._barColorerCache = new SeriesBarColorer(this);
        return this._barColorerCache;
    };
    Series.prototype.options = function () {
        return this._options;
    };
    Series.prototype.applyOptions = function (options) {
        var targetPriceScaleId = options.priceScaleId;
        if (targetPriceScaleId !== undefined && targetPriceScaleId !== this._options.priceScaleId) {
            // series cannot do it itself, ask model
            this.model().moveSeriesToScale(this, targetPriceScaleId);
        }
        merge(this._options, options);
        // tslint:disable-next-line:deprecation
        if (this._priceScale !== null && options.scaleMargins !== undefined) {
            this._priceScale.applyOptions({
                // tslint:disable-next-line:deprecation
                scaleMargins: options.scaleMargins,
            });
        }
        if (options.priceFormat !== undefined) {
            this._recreateFormatter();
        }
        this.model().updateSource(this);
    };
    Series.prototype.clearData = function () {
        this._data.clear();
        this._palette.clear();
        // we must either re-create pane view on clear data
        // or clear all caches inside pane views
        // but currently we can't separate update/append last bar and full data replacement (update vs setData) in pane views invalidation
        // so let's just re-create all views
        this._recreatePaneViews();
    };
    Series.prototype.updateData = function (data, clearData) {
        if (clearData === void 0) { clearData = false; }
        if (clearData) {
            this._data.clear();
        }
        this._data.bars().merge(data);
        this._recalculateMarkers();
        this._paneView.update('data');
        this._markersPaneView.update('data');
        var sourcePane = this.model().paneForSource(this);
        this.model().recalculatePane(sourcePane);
        this.model().updateSource(this);
        this.model().updateCrosshair();
        this.model().lightUpdate();
    };
    Series.prototype.setMarkers = function (data) {
        this._markers = data.map(function (item) { return (__assign({}, item)); });
        this._recalculateMarkers();
        var sourcePane = this.model().paneForSource(this);
        this._markersPaneView.update('data');
        this.model().recalculatePane(sourcePane);
        this.model().updateSource(this);
        this.model().updateCrosshair();
        this.model().lightUpdate();
    };
    Series.prototype.markers = function () {
        return this._markers;
    };
    Series.prototype.indexedMarkers = function () {
        return this._indexedMarkers;
    };
    Series.prototype.createPriceLine = function (options) {
        var result = new CustomPriceLine(this, options);
        this._customPriceLines.push(result);
        this.model().updateSource(this);
        return result;
    };
    Series.prototype.removePriceLine = function (line) {
        var index = this._customPriceLines.indexOf(line);
        if (index !== -1) {
            this._customPriceLines.splice(index, 1);
        }
        this.model().updateSource(this);
    };
    Series.prototype.palette = function () {
        return this._palette;
    };
    Series.prototype.seriesType = function () {
        return this._seriesType;
    };
    Series.prototype.firstValue = function () {
        var bar = this.firstBar();
        if (bar === null) {
            return null;
        }
        return {
            value: this._barFunction(bar.value),
            timePoint: bar.time,
        };
    };
    Series.prototype.firstBar = function () {
        var visibleBars = this.model().timeScale().visibleStrictRange();
        if (visibleBars === null) {
            return null;
        }
        var startTimePoint = visibleBars.left();
        return this.data().search(startTimePoint, 1 /* NearestRight */);
    };
    Series.prototype.bars = function () {
        return this._data.bars();
    };
    Series.prototype.nearestIndex = function (index, options) {
        var res = this.nearestData(index, options);
        return res ? res.index : null;
    };
    Series.prototype.nearestData = function (index, options) {
        if (!isInteger(index)) {
            return null;
        }
        return this.data().search(index, options);
    };
    Series.prototype.dataAt = function (time) {
        var prices = this.data().valueAt(time);
        if (prices === null) {
            return null;
        }
        if (this._seriesType === 'Bar' || this._seriesType === 'Candlestick') {
            return {
                open: prices.value[0 /* Open */],
                high: prices.value[1 /* High */],
                low: prices.value[2 /* Low */],
                close: prices.value[3 /* Close */],
            };
        }
        else {
            return this.barFunction()(prices.value);
        }
    };
    Series.prototype.paneViews = function () {
        var res = [];
        if (!this._isOverlay()) {
            res.push(this._baseHorizontalLineView);
        }
        for (var _i = 0, _a = this._customPriceLines; _i < _a.length; _i++) {
            var customPriceLine = _a[_i];
            res.push(customPriceLine.paneView());
        }
        res.push(this._paneView);
        res.push(this._priceLineView);
        res.push(this._panePriceAxisView);
        res.push(this._markersPaneView);
        return res;
    };
    Series.prototype.priceAxisViews = function (pane, priceScale) {
        var result = (priceScale === this._priceScale || this._isOverlay()) ? __spreadArrays(this._priceAxisViews) : [];
        for (var _i = 0, _a = this._customPriceLines; _i < _a.length; _i++) {
            var customPriceLine = _a[_i];
            result.push(customPriceLine.priceAxisView());
        }
        return result;
    };
    Series.prototype.autoscaleInfo = function (startTimePoint, endTimePoint) {
        var _this = this;
        if (this._options.autoscaleInfoProvider !== undefined) {
            var autoscaleInfo = this._options.autoscaleInfoProvider(function () {
                var res = _this._autoscaleInfoImpl(startTimePoint, endTimePoint);
                return (res === null) ? null : res.toRaw();
            });
            return AutoscaleInfoImpl.fromRaw(autoscaleInfo);
        }
        return this._autoscaleInfoImpl(startTimePoint, endTimePoint);
    };
    Series.prototype.minMove = function () {
        return this._options.priceFormat.minMove;
    };
    Series.prototype.formatter = function () {
        return this._formatter;
    };
    Series.prototype.barFunction = function () {
        return this._barFunction;
    };
    Series.prototype.updateAllViews = function () {
        this._paneView.update();
        this._markersPaneView.update();
        for (var _i = 0, _a = this._priceAxisViews; _i < _a.length; _i++) {
            var priceAxisView = _a[_i];
            priceAxisView.update();
        }
        for (var _b = 0, _c = this._customPriceLines; _b < _c.length; _b++) {
            var customPriceLine = _c[_b];
            customPriceLine.update();
        }
        this._priceLineView.update();
        this._baseHorizontalLineView.update();
    };
    Series.prototype.setPriceScale = function (priceScale) {
        if (this._priceScale === priceScale) {
            return;
        }
        this._priceScale = priceScale;
    };
    Series.prototype.priceScale = function () {
        return ensureNotNull(this._priceScale);
    };
    Series.prototype.markerDataAtIndex = function (index) {
        var getValue = (this._seriesType === 'Line' || this._seriesType === 'Area') &&
            this._options.crosshairMarkerVisible;
        if (!getValue) {
            return null;
        }
        var bar = this._data.valueAt(index);
        if (bar === null) {
            return null;
        }
        var price = this._barFunction(bar.value);
        var radius = this._markerRadius();
        return { price: price, radius: radius };
    };
    Series.prototype.title = function () {
        return this._options.title;
    };
    Series.prototype._isOverlay = function () {
        var priceScale = this.priceScale();
        return !isDefaultPriceScale(priceScale.id());
    };
    Series.prototype._autoscaleInfoImpl = function (startTimePoint, endTimePoint) {
        if (!isInteger(startTimePoint) || !isInteger(endTimePoint) || this.data().isEmpty()) {
            return null;
        }
        // TODO: refactor this
        // series data is strongly hardcoded to keep bars
        var priceSource = (this._seriesType === 'Line' || this._seriesType === 'Area' || this._seriesType === 'Histogram') ? 'close' : null;
        var barsMinMax;
        if (priceSource !== null) {
            barsMinMax = this.data().bars().minMaxOnRangeCached(startTimePoint, endTimePoint, [{ name: priceSource, offset: 0 }]);
        }
        else {
            barsMinMax = this.data().bars().minMaxOnRangeCached(startTimePoint, endTimePoint, [{ name: 'low', offset: 0 }, { name: 'high', offset: 0 }]);
        }
        var range = barsMinMax !== null ? new PriceRangeImpl(barsMinMax.min, barsMinMax.max) : null;
        if (this.seriesType() === 'Histogram') {
            var base = this._options.base;
            var rangeWithBase = new PriceRangeImpl(base, base);
            range = range !== null ? range.merge(rangeWithBase) : rangeWithBase;
        }
        return new AutoscaleInfoImpl(range, this._markersPaneView.autoScaleMargins());
    };
    Series.prototype._markerRadius = function () {
        switch (this._seriesType) {
            case 'Line':
            case 'Area':
                return this._options.crosshairMarkerRadius;
        }
        return 0;
    };
    Series.prototype._recreateFormatter = function () {
        switch (this._options.priceFormat.type) {
            case 'custom': {
                this._formatter = { format: this._options.priceFormat.formatter };
                break;
            }
            case 'volume': {
                this._formatter = new VolumeFormatter(this._options.priceFormat.precision);
                break;
            }
            case 'percent': {
                this._formatter = new PercentageFormatter(this._options.priceFormat.precision);
                break;
            }
            default: {
                var priceScale = Math.pow(10, this._options.priceFormat.precision);
                this._formatter = new PriceFormatter(priceScale, this._options.priceFormat.minMove * priceScale, false, undefined);
            }
        }
        if (this._priceScale !== null) {
            this._priceScale.updateFormatter();
        }
    };
    Series.prototype._updateBarFunction = function () {
        var priceSource = 'close';
        this._barFunction = barFunction(priceSource);
    };
    Series.prototype._recalculateMarkers = function () {
        var timeScalePoints = this.model().timeScale().points();
        if (timeScalePoints.size() === 0) {
            this._indexedMarkers = [];
            return;
        }
        this._indexedMarkers = this._markers.map(function (marker, index) { return ({
            time: ensureNotNull(timeScalePoints.indexOf(marker.time.timestamp, true)),
            position: marker.position,
            shape: marker.shape,
            color: marker.color,
            id: marker.id,
            internalId: index,
            text: marker.text,
            size: marker.size,
        }); });
    };
    Series.prototype._recreatePaneViews = function () {
        this._markersPaneView = new SeriesMarkersPaneView(this, this.model());
        switch (this._seriesType) {
            case 'Bar': {
                this._paneView = new SeriesBarsPaneView(this, this.model());
                break;
            }
            case 'Candlestick': {
                this._paneView = new SeriesCandlesticksPaneView(this, this.model());
                break;
            }
            case 'Line': {
                this._paneView = new SeriesLinePaneView(this, this.model());
                break;
            }
            case 'Area': {
                this._paneView = new SeriesAreaPaneView(this, this.model());
                break;
            }
            case 'Histogram': {
                this._paneView = new SeriesHistogramPaneView(this, this.model());
                break;
            }
            default: throw Error('Unknown chart style assigned: ' + this._seriesType);
        }
    };
    return Series;
}(PriceDataSource));
export { Series };
