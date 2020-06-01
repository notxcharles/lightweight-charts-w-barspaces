import { ChartWidget } from '../gui/chart-widget';
import { ensureDefined } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { warn } from '../helpers/logger';
import { clone, isBoolean, merge } from '../helpers/strict-type-checks';
import { fillUpDownCandlesticksColors, precisionByMinMove, } from '../model/series-options';
import { CandlestickSeriesApi } from './candlestick-series-api';
import { DataLayer } from './data-layer';
import { chartOptionsDefaults } from './options/chart-options-defaults';
import { areaStyleDefaults, barStyleDefaults, candlestickStyleDefaults, histogramStyleDefaults, lineStyleDefaults, seriesOptionsDefaults, } from './options/series-options-defaults';
import { PriceScaleApi } from './price-scale-api';
import { SeriesApi } from './series-api';
import { TimeScaleApi } from './time-scale-api';
function patchPriceFormat(priceFormat) {
    if (priceFormat === undefined || priceFormat.type === 'custom') {
        return;
    }
    var priceFormatBuiltIn = priceFormat;
    if (priceFormatBuiltIn.minMove !== undefined && priceFormatBuiltIn.precision === undefined) {
        priceFormatBuiltIn.precision = precisionByMinMove(priceFormatBuiltIn.minMove);
    }
}
function migrateHandleScaleScrollOptions(options) {
    if (isBoolean(options.handleScale)) {
        var handleScale = options.handleScale;
        options.handleScale = {
            axisDoubleClickReset: handleScale,
            axisPressedMouseMove: {
                time: handleScale,
                price: handleScale,
            },
            mouseWheel: handleScale,
            pinch: handleScale,
        };
    }
    else if (options.handleScale !== undefined && isBoolean(options.handleScale.axisPressedMouseMove)) {
        var axisPressedMouseMove = options.handleScale.axisPressedMouseMove;
        options.handleScale.axisPressedMouseMove = {
            time: axisPressedMouseMove,
            price: axisPressedMouseMove,
        };
    }
    var handleScroll = options.handleScroll;
    if (isBoolean(handleScroll)) {
        options.handleScroll = {
            horzTouchDrag: handleScroll,
            vertTouchDrag: handleScroll,
            mouseWheel: handleScroll,
            pressedMouseMove: handleScroll,
        };
    }
}
function migratePriceScaleOptions(options) {
    if (options.priceScale) {
        warn('"priceScale" option has been deprecated, use "leftPriceScale", "rightPriceScale" and "overlayPriceScales" instead');
        options.leftPriceScale = options.leftPriceScale || {};
        options.rightPriceScale = options.rightPriceScale || {};
        // tslint:disable-next-line:deprecation
        var position = options.priceScale.position;
        // tslint:disable-next-line:deprecation
        delete options.priceScale.position;
        options.leftPriceScale = merge(options.leftPriceScale, options.priceScale);
        options.rightPriceScale = merge(options.rightPriceScale, options.priceScale);
        if (position === 'left') {
            options.leftPriceScale.visible = true;
            options.rightPriceScale.visible = false;
        }
        if (position === 'right') {
            options.leftPriceScale.visible = false;
            options.rightPriceScale.visible = true;
        }
        if (position === 'none') {
            options.leftPriceScale.visible = false;
            options.rightPriceScale.visible = false;
        }
        // copy defaults for overlays
        options.overlayPriceScales = options.overlayPriceScales || {};
        if (options.priceScale.invertScale !== undefined) {
            options.overlayPriceScales.invertScale = options.priceScale.invertScale;
        }
        // do not migrate mode for backward compatibility
        if (options.priceScale.scaleMargins !== undefined) {
            options.overlayPriceScales.scaleMargins = options.priceScale.scaleMargins;
        }
    }
}
function toInternalOptions(options) {
    migrateHandleScaleScrollOptions(options);
    migratePriceScaleOptions(options);
    return options;
}
var ChartApi = /** @class */ (function () {
    function ChartApi(container, options) {
        var _this = this;
        this._dataLayer = new DataLayer();
        this._seriesMap = new Map();
        this._seriesMapReversed = new Map();
        this._clickedDelegate = new Delegate();
        this._crosshairMovedDelegate = new Delegate();
        var internalOptions = (options === undefined) ?
            clone(chartOptionsDefaults) :
            merge(clone(chartOptionsDefaults), toInternalOptions(options));
        this._chartWidget = new ChartWidget(container, internalOptions);
        this._chartWidget.clicked().subscribe(function (paramSupplier) {
            if (_this._clickedDelegate.hasListeners()) {
                _this._clickedDelegate.fire(_this._convertMouseParams(paramSupplier()));
            }
        }, this);
        this._chartWidget.crosshairMoved().subscribe(function (paramSupplier) {
            if (_this._crosshairMovedDelegate.hasListeners()) {
                _this._crosshairMovedDelegate.fire(_this._convertMouseParams(paramSupplier()));
            }
        }, this);
        var model = this._chartWidget.model();
        this._timeScaleApi = new TimeScaleApi(model);
    }
    ChartApi.prototype.remove = function () {
        this._chartWidget.clicked().unsubscribeAll(this);
        this._chartWidget.crosshairMoved().unsubscribeAll(this);
        this._timeScaleApi.destroy();
        this._chartWidget.destroy();
        delete this._chartWidget;
        this._seriesMap.forEach(function (series, api) {
            api.destroy();
        });
        this._seriesMap.clear();
        this._seriesMapReversed.clear();
        this._clickedDelegate.destroy();
        this._crosshairMovedDelegate.destroy();
        this._dataLayer.destroy();
        delete this._dataLayer;
    };
    ChartApi.prototype.resize = function (width, height, forceRepaint) {
        this._chartWidget.resize(width, height, forceRepaint);
    };
    ChartApi.prototype.addAreaSeries = function (options) {
        if (options === void 0) { options = {}; }
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), areaStyleDefaults, options);
        var series = this._chartWidget.model().createSeries('Area', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._seriesMap.set(res, series);
        this._seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addBarSeries = function (options) {
        if (options === void 0) { options = {}; }
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), barStyleDefaults, options);
        var series = this._chartWidget.model().createSeries('Bar', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._seriesMap.set(res, series);
        this._seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addCandlestickSeries = function (options) {
        if (options === void 0) { options = {}; }
        fillUpDownCandlesticksColors(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), candlestickStyleDefaults, options);
        var series = this._chartWidget.model().createSeries('Candlestick', strictOptions);
        var res = new CandlestickSeriesApi(series, this, this);
        this._seriesMap.set(res, series);
        this._seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addHistogramSeries = function (options) {
        if (options === void 0) { options = {}; }
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), histogramStyleDefaults, options);
        var series = this._chartWidget.model().createSeries('Histogram', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._seriesMap.set(res, series);
        this._seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addLineSeries = function (options) {
        if (options === void 0) { options = {}; }
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), lineStyleDefaults, options);
        var series = this._chartWidget.model().createSeries('Line', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._seriesMap.set(res, series);
        this._seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.removeSeries = function (seriesApi) {
        var seriesObj = seriesApi;
        var series = ensureDefined(this._seriesMap.get(seriesObj));
        var update = this._dataLayer.removeSeries(series);
        var model = this._chartWidget.model();
        model.removeSeries(series);
        var timeScaleUpdate = update.timeScaleUpdate;
        model.updateTimeScale(timeScaleUpdate.index, timeScaleUpdate.changes, timeScaleUpdate.marks, true);
        timeScaleUpdate.seriesUpdates.forEach(function (value, key) {
            key.updateData(value.update);
        });
        model.updateTimeScaleBaseIndex(0);
        this._seriesMap.delete(seriesObj);
        this._seriesMapReversed.delete(series);
    };
    ChartApi.prototype.applyNewData = function (series, data) {
        var update = this._dataLayer.setSeriesData(series, data);
        var model = this._chartWidget.model();
        var timeScaleUpdate = update.timeScaleUpdate;
        model.updateTimeScale(timeScaleUpdate.index, timeScaleUpdate.changes, timeScaleUpdate.marks, true);
        timeScaleUpdate.seriesUpdates.forEach(function (value, key) {
            // the latest arg `true` must be removed in https://github.com/tradingview/lightweight-charts/issues/270
            // here we don't need to clear palettes because they were just filled in DataLayer
            // see https://github.com/tradingview/lightweight-charts/pull/330#discussion_r379415805
            key.updateData(value.update, true);
        });
        model.updateTimeScaleBaseIndex(0);
    };
    ChartApi.prototype.updateData = function (series, data) {
        var update = this._dataLayer.updateSeriesData(series, data);
        var model = this._chartWidget.model();
        var timeScaleUpdate = update.timeScaleUpdate;
        model.updateTimeScale(timeScaleUpdate.index, timeScaleUpdate.changes, timeScaleUpdate.marks, false);
        timeScaleUpdate.seriesUpdates.forEach(function (value, key) {
            key.updateData(value.update);
        });
        model.updateTimeScaleBaseIndex(0);
    };
    ChartApi.prototype.subscribeClick = function (handler) {
        this._clickedDelegate.subscribe(handler);
    };
    ChartApi.prototype.unsubscribeClick = function (handler) {
        this._clickedDelegate.unsubscribe(handler);
    };
    ChartApi.prototype.subscribeCrosshairMove = function (handler) {
        this._crosshairMovedDelegate.subscribe(handler);
    };
    ChartApi.prototype.unsubscribeCrosshairMove = function (handler) {
        this._crosshairMovedDelegate.unsubscribe(handler);
    };
    ChartApi.prototype.priceScale = function (priceScaleId) {
        if (priceScaleId === undefined) {
            warn('Using ChartApi.priceScale() method without arguments has been deprecated, pass valid price scale id instead');
        }
        priceScaleId = priceScaleId || this._chartWidget.model().defaultVisiblePriceScaleId();
        return new PriceScaleApi(this._chartWidget, priceScaleId);
    };
    ChartApi.prototype.timeScale = function () {
        return this._timeScaleApi;
    };
    ChartApi.prototype.applyOptions = function (options) {
        this._chartWidget.applyOptions(toInternalOptions(options));
    };
    ChartApi.prototype.options = function () {
        return this._chartWidget.options();
    };
    ChartApi.prototype.takeScreenshot = function () {
        return this._chartWidget.takeScreenshot();
    };
    ChartApi.prototype._mapSeriesToApi = function (series) {
        return ensureDefined(this._seriesMapReversed.get(series));
    };
    ChartApi.prototype._convertMouseParams = function (param) {
        var _this = this;
        var seriesPrices = new Map();
        param.seriesPrices.forEach(function (price, series) {
            seriesPrices.set(_this._mapSeriesToApi(series), price);
        });
        var hoveredSeries = param.hoveredSeries === undefined ? undefined : this._mapSeriesToApi(param.hoveredSeries);
        return {
            time: param.time && (param.time.businessDay || param.time.timestamp),
            point: param.point,
            hoveredSeries: hoveredSeries,
            hoveredMarkerId: param.hoveredObject,
            seriesPrices: seriesPrices,
        };
    };
    return ChartApi;
}());
export { ChartApi };
