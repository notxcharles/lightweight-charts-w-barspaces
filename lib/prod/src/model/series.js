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
        _this._private__data = new SeriesData();
        _this._private__priceLineView = new SeriesPriceLinePaneView(_this);
        _this._private__customPriceLines = [];
        _this._private__baseHorizontalLineView = new SeriesHorizontalBaseLinePaneView(_this);
        _this._private__endOfData = false;
        _this._private__barColorerCache = null;
        _this._private__palette = new Palette();
        _this._private__markers = [];
        _this._private__indexedMarkers = [];
        _this._private__options = options;
        _this._private__seriesType = seriesType;
        var priceAxisView = new SeriesPriceAxisView(_this, { _internal_model: model });
        _this._private__priceAxisViews = [priceAxisView];
        _this._private__panePriceAxisView = new PanePriceAxisView(priceAxisView, _this, model);
        _this._private__recreateFormatter();
        _this._private__updateBarFunction();
        _this._private__barFunction = _this._internal_barFunction(); // redundant
        _this._private__recreatePaneViews();
        return _this;
    }
    Series.prototype._internal_destroy = function () {
    };
    Series.prototype._internal_endOfData = function () {
        return this._private__endOfData;
    };
    Series.prototype._internal_priceLineColor = function (lastBarColor) {
        return this._private__options.priceLineColor || lastBarColor;
    };
    // returns object with:
    // formatted price
    // raw price (if withRawPrice)
    // coordinate
    // color
    // or { "noData":true } if last value could not be found
    // NOTE: should NEVER return null or undefined!
    Series.prototype._internal_lastValueData = function (plot, globalLast, withRawPrice) {
        var noDataRes = { _internal_noData: true };
        var priceScale = this._internal_priceScale();
        if (this._internal_model()._internal_timeScale()._internal_isEmpty() || priceScale._internal_isEmpty() || this._internal_data()._internal_isEmpty()) {
            return noDataRes;
        }
        var visibleBars = this._internal_model()._internal_timeScale()._internal_visibleStrictRange();
        var firstValue = this._internal_firstValue();
        if (visibleBars === null || firstValue === null) {
            return noDataRes;
        }
        // find range of bars inside range
        // TODO: make it more optimal
        var bar;
        var lastIndex;
        if (globalLast) {
            var lastBar = this._internal_data()._internal_bars()._internal_last();
            if (lastBar === null) {
                return noDataRes;
            }
            bar = lastBar;
            lastIndex = lastBar._internal_index;
        }
        else {
            var endBar = this._internal_data()._internal_bars()._internal_search(visibleBars._internal_right(), -1 /* NearestLeft */);
            if (endBar === null) {
                return noDataRes;
            }
            bar = this._internal_data()._internal_bars()._internal_valueAt(endBar._internal_index);
            if (bar === null) {
                return noDataRes;
            }
            lastIndex = endBar._internal_index;
        }
        var price = plot !== undefined ? bar._internal_value[plot] : this._private__barFunction(bar._internal_value);
        var barColorer = this._internal_barColorer();
        var style = barColorer._internal_barStyle(lastIndex, { _internal_value: bar });
        var coordinate = priceScale._internal_priceToCoordinate(price, firstValue._internal_value);
        return {
            _internal_noData: false,
            _internal_price: withRawPrice ? price : undefined,
            _internal_text: priceScale._internal_formatPrice(price, firstValue._internal_value),
            _internal_formattedPriceAbsolute: priceScale._internal_formatPriceAbsolute(price),
            _internal_formattedPricePercentage: priceScale._internal_formatPricePercentage(price, firstValue._internal_value),
            _internal_color: style._internal_barColor,
            _internal_coordinate: coordinate,
            _internal_index: lastIndex,
        };
    };
    Series.prototype._internal_data = function () {
        return this._private__data;
    };
    Series.prototype._internal_barColorer = function () {
        if (this._private__barColorerCache !== null) {
            return this._private__barColorerCache;
        }
        this._private__barColorerCache = new SeriesBarColorer(this);
        return this._private__barColorerCache;
    };
    Series.prototype._internal_options = function () {
        return this._private__options;
    };
    Series.prototype._internal_applyOptions = function (options) {
        var targetPriceScaleId = options.priceScaleId;
        if (targetPriceScaleId !== undefined && targetPriceScaleId !== this._private__options.priceScaleId) {
            // series cannot do it itself, ask model
            this._internal_model()._internal_moveSeriesToScale(this, targetPriceScaleId);
        }
        merge(this._private__options, options);
        // tslint:disable-next-line:deprecation
        if (this._internal__priceScale !== null && options.scaleMargins !== undefined) {
            this._internal__priceScale._internal_applyOptions({
                // tslint:disable-next-line:deprecation
                scaleMargins: options.scaleMargins,
            });
        }
        if (options.priceFormat !== undefined) {
            this._private__recreateFormatter();
        }
        this._internal_model()._internal_updateSource(this);
    };
    Series.prototype._internal_clearData = function () {
        this._private__data._internal_clear();
        this._private__palette._internal_clear();
        // we must either re-create pane view on clear data
        // or clear all caches inside pane views
        // but currently we can't separate update/append last bar and full data replacement (update vs setData) in pane views invalidation
        // so let's just re-create all views
        this._private__recreatePaneViews();
    };
    Series.prototype._internal_updateData = function (data, clearData) {
        if (clearData === void 0) { clearData = false; }
        if (clearData) {
            this._private__data._internal_clear();
        }
        this._private__data._internal_bars()._internal_merge(data);
        this._private__recalculateMarkers();
        this._private__paneView._internal_update('data');
        this._private__markersPaneView._internal_update('data');
        var sourcePane = this._internal_model()._internal_paneForSource(this);
        this._internal_model()._internal_recalculatePane(sourcePane);
        this._internal_model()._internal_updateSource(this);
        this._internal_model()._internal_updateCrosshair();
        this._internal_model()._internal_lightUpdate();
    };
    Series.prototype._internal_setMarkers = function (data) {
        this._private__markers = data.map(function (item) { return (__assign({}, item)); });
        this._private__recalculateMarkers();
        var sourcePane = this._internal_model()._internal_paneForSource(this);
        this._private__markersPaneView._internal_update('data');
        this._internal_model()._internal_recalculatePane(sourcePane);
        this._internal_model()._internal_updateSource(this);
        this._internal_model()._internal_updateCrosshair();
        this._internal_model()._internal_lightUpdate();
    };
    Series.prototype._internal_markers = function () {
        return this._private__markers;
    };
    Series.prototype._internal_indexedMarkers = function () {
        return this._private__indexedMarkers;
    };
    Series.prototype._internal_createPriceLine = function (options) {
        var result = new CustomPriceLine(this, options);
        this._private__customPriceLines.push(result);
        this._internal_model()._internal_updateSource(this);
        return result;
    };
    Series.prototype._internal_removePriceLine = function (line) {
        var index = this._private__customPriceLines.indexOf(line);
        if (index !== -1) {
            this._private__customPriceLines.splice(index, 1);
        }
        this._internal_model()._internal_updateSource(this);
    };
    Series.prototype._internal_palette = function () {
        return this._private__palette;
    };
    Series.prototype._internal_seriesType = function () {
        return this._private__seriesType;
    };
    Series.prototype._internal_firstValue = function () {
        var bar = this._internal_firstBar();
        if (bar === null) {
            return null;
        }
        return {
            _internal_value: this._private__barFunction(bar._internal_value),
            _internal_timePoint: bar._internal_time,
        };
    };
    Series.prototype._internal_firstBar = function () {
        var visibleBars = this._internal_model()._internal_timeScale()._internal_visibleStrictRange();
        if (visibleBars === null) {
            return null;
        }
        var startTimePoint = visibleBars._internal_left();
        return this._internal_data()._internal_search(startTimePoint, 1 /* NearestRight */);
    };
    Series.prototype._internal_bars = function () {
        return this._private__data._internal_bars();
    };
    Series.prototype._internal_nearestIndex = function (index, options) {
        var res = this._internal_nearestData(index, options);
        return res ? res._internal_index : null;
    };
    Series.prototype._internal_nearestData = function (index, options) {
        if (!isInteger(index)) {
            return null;
        }
        return this._internal_data()._internal_search(index, options);
    };
    Series.prototype._internal_dataAt = function (time) {
        var prices = this._internal_data()._internal_valueAt(time);
        if (prices === null) {
            return null;
        }
        if (this._private__seriesType === 'Bar' || this._private__seriesType === 'Candlestick') {
            return {
                open: prices._internal_value[0 /* Open */],
                high: prices._internal_value[1 /* High */],
                low: prices._internal_value[2 /* Low */],
                close: prices._internal_value[3 /* Close */],
            };
        }
        else {
            return this._internal_barFunction()(prices._internal_value);
        }
    };
    Series.prototype._internal_paneViews = function () {
        var res = [];
        if (!this._private__isOverlay()) {
            res.push(this._private__baseHorizontalLineView);
        }
        for (var _i = 0, _a = this._private__customPriceLines; _i < _a.length; _i++) {
            var customPriceLine = _a[_i];
            res.push(customPriceLine._internal_paneView());
        }
        res.push(this._private__paneView);
        res.push(this._private__priceLineView);
        res.push(this._private__panePriceAxisView);
        res.push(this._private__markersPaneView);
        return res;
    };
    Series.prototype._internal_priceAxisViews = function (pane, priceScale) {
        var result = (priceScale === this._internal__priceScale || this._private__isOverlay()) ? __spreadArrays(this._private__priceAxisViews) : [];
        for (var _i = 0, _a = this._private__customPriceLines; _i < _a.length; _i++) {
            var customPriceLine = _a[_i];
            result.push(customPriceLine._internal_priceAxisView());
        }
        return result;
    };
    Series.prototype._internal_autoscaleInfo = function (startTimePoint, endTimePoint) {
        var _this = this;
        if (this._private__options.autoscaleInfoProvider !== undefined) {
            var autoscaleInfo = this._private__options.autoscaleInfoProvider(function () {
                var res = _this._private__autoscaleInfoImpl(startTimePoint, endTimePoint);
                return (res === null) ? null : res._internal_toRaw();
            });
            return AutoscaleInfoImpl._internal_fromRaw(autoscaleInfo);
        }
        return this._private__autoscaleInfoImpl(startTimePoint, endTimePoint);
    };
    Series.prototype._internal_minMove = function () {
        return this._private__options.priceFormat.minMove;
    };
    Series.prototype._internal_formatter = function () {
        return this._private__formatter;
    };
    Series.prototype._internal_barFunction = function () {
        return this._private__barFunction;
    };
    Series.prototype._internal_updateAllViews = function () {
        this._private__paneView._internal_update();
        this._private__markersPaneView._internal_update();
        for (var _i = 0, _a = this._private__priceAxisViews; _i < _a.length; _i++) {
            var priceAxisView = _a[_i];
            priceAxisView._internal_update();
        }
        for (var _b = 0, _c = this._private__customPriceLines; _b < _c.length; _b++) {
            var customPriceLine = _c[_b];
            customPriceLine._internal_update();
        }
        this._private__priceLineView._internal_update();
        this._private__baseHorizontalLineView._internal_update();
    };
    Series.prototype._internal_setPriceScale = function (priceScale) {
        if (this._internal__priceScale === priceScale) {
            return;
        }
        this._internal__priceScale = priceScale;
    };
    Series.prototype._internal_priceScale = function () {
        return ensureNotNull(this._internal__priceScale);
    };
    Series.prototype._internal_markerDataAtIndex = function (index) {
        var getValue = (this._private__seriesType === 'Line' || this._private__seriesType === 'Area') &&
            this._private__options.crosshairMarkerVisible;
        if (!getValue) {
            return null;
        }
        var bar = this._private__data._internal_valueAt(index);
        if (bar === null) {
            return null;
        }
        var price = this._private__barFunction(bar._internal_value);
        var radius = this._private__markerRadius();
        return { _internal_price: price, _internal_radius: radius };
    };
    Series.prototype._internal_title = function () {
        return this._private__options.title;
    };
    Series.prototype._private__isOverlay = function () {
        var priceScale = this._internal_priceScale();
        return !isDefaultPriceScale(priceScale._internal_id());
    };
    Series.prototype._private__autoscaleInfoImpl = function (startTimePoint, endTimePoint) {
        if (!isInteger(startTimePoint) || !isInteger(endTimePoint) || this._internal_data()._internal_isEmpty()) {
            return null;
        }
        // TODO: refactor this
        // series data is strongly hardcoded to keep bars
        var priceSource = (this._private__seriesType === 'Line' || this._private__seriesType === 'Area' || this._private__seriesType === 'Histogram') ? 'close' : null;
        var barsMinMax;
        if (priceSource !== null) {
            barsMinMax = this._internal_data()._internal_bars()._internal_minMaxOnRangeCached(startTimePoint, endTimePoint, [{ _internal_name: priceSource, _internal_offset: 0 }]);
        }
        else {
            barsMinMax = this._internal_data()._internal_bars()._internal_minMaxOnRangeCached(startTimePoint, endTimePoint, [{ _internal_name: 'low', _internal_offset: 0 }, { _internal_name: 'high', _internal_offset: 0 }]);
        }
        var range = barsMinMax !== null ? new PriceRangeImpl(barsMinMax._internal_min, barsMinMax._internal_max) : null;
        if (this._internal_seriesType() === 'Histogram') {
            var base = this._private__options.base;
            var rangeWithBase = new PriceRangeImpl(base, base);
            range = range !== null ? range._internal_merge(rangeWithBase) : rangeWithBase;
        }
        return new AutoscaleInfoImpl(range, this._private__markersPaneView._internal_autoScaleMargins());
    };
    Series.prototype._private__markerRadius = function () {
        switch (this._private__seriesType) {
            case 'Line':
            case 'Area':
                return this._private__options.crosshairMarkerRadius;
        }
        return 0;
    };
    Series.prototype._private__recreateFormatter = function () {
        switch (this._private__options.priceFormat.type) {
            case 'custom': {
                this._private__formatter = { _internal_format: this._private__options.priceFormat.formatter };
                break;
            }
            case 'volume': {
                this._private__formatter = new VolumeFormatter(this._private__options.priceFormat.precision);
                break;
            }
            case 'percent': {
                this._private__formatter = new PercentageFormatter(this._private__options.priceFormat.precision);
                break;
            }
            default: {
                var priceScale = Math.pow(10, this._private__options.priceFormat.precision);
                this._private__formatter = new PriceFormatter(priceScale, this._private__options.priceFormat.minMove * priceScale, false, undefined);
            }
        }
        if (this._internal__priceScale !== null) {
            this._internal__priceScale._internal_updateFormatter();
        }
    };
    Series.prototype._private__updateBarFunction = function () {
        var priceSource = 'close';
        this._private__barFunction = barFunction(priceSource);
    };
    Series.prototype._private__recalculateMarkers = function () {
        var timeScalePoints = this._internal_model()._internal_timeScale()._internal_points();
        if (timeScalePoints._internal_size() === 0) {
            this._private__indexedMarkers = [];
            return;
        }
        this._private__indexedMarkers = this._private__markers.map(function (marker, index) { return ({
            time: ensureNotNull(timeScalePoints._internal_indexOf(marker.time.timestamp, true)),
            position: marker.position,
            shape: marker.shape,
            color: marker.color,
            id: marker.id,
            _internal_internalId: index,
            text: marker.text,
            size: marker.size,
        }); });
    };
    Series.prototype._private__recreatePaneViews = function () {
        this._private__markersPaneView = new SeriesMarkersPaneView(this, this._internal_model());
        switch (this._private__seriesType) {
            case 'Bar': {
                this._private__paneView = new SeriesBarsPaneView(this, this._internal_model());
                break;
            }
            case 'Candlestick': {
                this._private__paneView = new SeriesCandlesticksPaneView(this, this._internal_model());
                break;
            }
            case 'Line': {
                this._private__paneView = new SeriesLinePaneView(this, this._internal_model());
                break;
            }
            case 'Area': {
                this._private__paneView = new SeriesAreaPaneView(this, this._internal_model());
                break;
            }
            case 'Histogram': {
                this._private__paneView = new SeriesHistogramPaneView(this, this._internal_model());
                break;
            }
            default: throw Error('Unknown chart style assigned: ' + this._private__seriesType);
        }
    };
    return Series;
}(PriceDataSource));
export { Series };
