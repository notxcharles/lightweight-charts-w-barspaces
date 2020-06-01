/// <reference types="_build-time-constants" />
import { assert, ensureNotNull } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { merge } from '../helpers/strict-type-checks';
import { PriceAxisRendererOptionsProvider } from '../renderers/price-axis-renderer-options-provider';
import { Crosshair } from './crosshair';
import { isDefaultPriceScale } from './default-price-scale';
import { Grid } from './grid';
import { InvalidateMask } from './invalidate-mask';
import { Magnet } from './magnet';
import { DEFAULT_STRETCH_FACTOR, Pane } from './pane';
import { Series } from './series';
import { TimeScale } from './time-scale';
import { Watermark } from './watermark';
var ChartModel = /** @class */ (function () {
    function ChartModel(invalidateHandler, options) {
        this._private__panes = [];
        this._private__serieses = [];
        this._private__width = 0;
        this._private__initialTimeScrollPos = null;
        this._private__hoveredSource = null;
        this._private__priceScalesOptionsChanged = new Delegate();
        this._private__crosshairMoved = new Delegate();
        this._private__invalidateHandler = invalidateHandler;
        this._private__options = options;
        this._private__rendererOptionsProvider = new PriceAxisRendererOptionsProvider(this);
        this._private__timeScale = new TimeScale(this, options.timeScale, this._private__options.localization);
        this._private__grid = new Grid();
        this._private__crosshair = new Crosshair(this, options.crosshair);
        this._private__magnet = new Magnet(options.crosshair);
        this._private__watermark = new Watermark(this, options.watermark);
        this._internal_createPane();
        this._private__panes[0]._internal_setStretchFactor(DEFAULT_STRETCH_FACTOR * 2);
    }
    ChartModel.prototype._internal_fullUpdate = function () {
        this._private__invalidate(new InvalidateMask(3 /* Full */));
    };
    ChartModel.prototype._internal_lightUpdate = function () {
        this._private__invalidate(new InvalidateMask(2 /* Light */));
    };
    ChartModel.prototype._internal_updateSource = function (source) {
        var inv = this._private__invalidationMaskForSource(source);
        this._private__invalidate(inv);
    };
    ChartModel.prototype._internal_hoveredSource = function () {
        return this._private__hoveredSource;
    };
    ChartModel.prototype._internal_setHoveredSource = function (source) {
        var prevSource = this._private__hoveredSource;
        this._private__hoveredSource = source;
        if (prevSource !== null) {
            this._internal_updateSource(prevSource._internal_source);
        }
        if (source !== null) {
            this._internal_updateSource(source._internal_source);
        }
    };
    ChartModel.prototype._internal_options = function () {
        return this._private__options;
    };
    ChartModel.prototype._internal_applyOptions = function (options) {
        merge(this._private__options, options);
        this._private__panes.forEach(function (p) { return p._internal_applyScaleOptions(options); });
        if (options.timeScale !== undefined) {
            this._private__timeScale._internal_applyOptions(options.timeScale);
        }
        if (options.localization !== undefined) {
            this._private__timeScale._internal_applyLocalizationOptions(options.localization);
        }
        if (options.leftPriceScale || options.rightPriceScale) {
            this._private__priceScalesOptionsChanged._internal_fire();
        }
        this._internal_fullUpdate();
    };
    ChartModel.prototype._internal_applyPriceScaleOptions = function (priceScaleId, options) {
        var res = this._internal_findPriceScale(priceScaleId);
        if (res === null) {
            if (process.env.NODE_ENV === 'development') {
                throw new Error("Trying to apply price scale options with incorrect ID: " + priceScaleId);
            }
            return;
        }
        res._internal_priceScale._internal_applyOptions(options);
        this._private__priceScalesOptionsChanged._internal_fire();
    };
    ChartModel.prototype._internal_findPriceScale = function (priceScaleId) {
        for (var _i = 0, _a = this._private__panes; _i < _a.length; _i++) {
            var pane = _a[_i];
            var priceScale = pane._internal_priceScaleById(priceScaleId);
            if (priceScale !== null) {
                return {
                    _internal_pane: pane,
                    _internal_priceScale: priceScale,
                };
            }
        }
        return null;
    };
    ChartModel.prototype._internal_updateAllPaneViews = function () {
        this._private__panes.forEach(function (p) { return p._internal_updateAllViews(); });
        this._internal_updateCrosshair();
    };
    ChartModel.prototype._internal_timeScale = function () {
        return this._private__timeScale;
    };
    ChartModel.prototype._internal_panes = function () {
        return this._private__panes;
    };
    ChartModel.prototype._internal_gridSource = function () {
        return this._private__grid;
    };
    ChartModel.prototype._internal_watermarkSource = function () {
        return this._private__watermark;
    };
    ChartModel.prototype._internal_crosshairSource = function () {
        return this._private__crosshair;
    };
    ChartModel.prototype._internal_crosshairMoved = function () {
        return this._private__crosshairMoved;
    };
    ChartModel.prototype._internal_width = function () {
        return this._private__width;
    };
    ChartModel.prototype._internal_setPaneHeight = function (pane, height) {
        pane._internal_setHeight(height);
        this._internal_recalculateAllPanes();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_setWidth = function (width) {
        this._private__width = width;
        this._private__timeScale._internal_setWidth(this._private__width);
        this._private__panes.forEach(function (pane) { return pane._internal_setWidth(width); });
        this._internal_recalculateAllPanes();
    };
    ChartModel.prototype._internal_createPane = function (index) {
        var pane = new Pane(this._private__timeScale, this);
        if (index !== undefined) {
            this._private__panes.splice(index, 0, pane);
        }
        else {
            // adding to the end - common case
            this._private__panes.push(pane);
        }
        var actualIndex = (index === undefined) ? this._private__panes.length - 1 : index;
        // we always do autoscaling on the creation
        // if autoscale option is true, it is ok, just recalculate by invalidation mask
        // if autoscale option is false, autoscale anyway on the first draw
        // also there is a scenario when autoscale is true in constructor and false later on applyOptions
        var mask = new InvalidateMask(3 /* Full */);
        mask._internal_invalidatePane(actualIndex, {
            _internal_level: 0 /* None */,
            _internal_autoScale: true,
        });
        this._internal_invalidate(mask);
        return pane;
    };
    ChartModel.prototype._internal_startScalePrice = function (pane, priceScale, x) {
        pane._internal_startScalePrice(priceScale, x);
    };
    ChartModel.prototype._internal_scalePriceTo = function (pane, priceScale, x) {
        pane._internal_scalePriceTo(priceScale, x);
        this._internal_updateCrosshair();
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_endScalePrice = function (pane, priceScale) {
        pane._internal_endScalePrice(priceScale);
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_startScrollPrice = function (pane, priceScale, x) {
        if (priceScale._internal_isAutoScale()) {
            return;
        }
        pane._internal_startScrollPrice(priceScale, x);
    };
    ChartModel.prototype._internal_scrollPriceTo = function (pane, priceScale, x) {
        if (priceScale._internal_isAutoScale()) {
            return;
        }
        pane._internal_scrollPriceTo(priceScale, x);
        this._internal_updateCrosshair();
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_endScrollPrice = function (pane, priceScale) {
        if (priceScale._internal_isAutoScale()) {
            return;
        }
        pane._internal_endScrollPrice(priceScale);
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_setPriceAutoScale = function (pane, priceScale, autoScale) {
        pane._internal_setPriceAutoScale(priceScale, autoScale);
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_resetPriceScale = function (pane, priceScale) {
        pane._internal_resetPriceScale(priceScale);
        this._private__invalidate(this._private__paneInvalidationMask(pane, 2 /* Light */));
    };
    ChartModel.prototype._internal_startScaleTime = function (position) {
        this._private__timeScale._internal_startScale(position);
    };
    /**
     * Zoom in/out the chart (depends on scale value).
     * @param pointX - X coordinate of the point to apply the zoom (the point which should stay on its place)
     * @param scale - Zoom value. Negative value means zoom out, positive - zoom in.
     */
    ChartModel.prototype._internal_zoomTime = function (pointX, scale) {
        var timeScale = this._internal_timeScale();
        if (timeScale._internal_isEmpty() || scale === 0) {
            return;
        }
        var timeScaleWidth = timeScale._internal_width();
        pointX = Math.max(1, Math.min(pointX, timeScaleWidth));
        timeScale._internal_zoom(pointX, scale);
        this._internal_updateCrosshair();
        this._internal_recalculateAllPanes();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_scrollChart = function (x) {
        this._internal_startScrollTime(0);
        this._internal_scrollTimeTo(x);
        this._internal_endScrollTime();
    };
    ChartModel.prototype._internal_scaleTimeTo = function (x) {
        this._private__timeScale._internal_scaleTo(x);
        this._internal_recalculateAllPanes();
        this._internal_updateCrosshair();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_endScaleTime = function () {
        this._private__timeScale._internal_endScale();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_startScrollTime = function (x) {
        this._private__initialTimeScrollPos = x;
        this._private__timeScale._internal_startScroll(x);
    };
    ChartModel.prototype._internal_scrollTimeTo = function (x) {
        var res = false;
        if (this._private__initialTimeScrollPos !== null && Math.abs(x - this._private__initialTimeScrollPos) > 20) {
            this._private__initialTimeScrollPos = null;
            res = true;
        }
        this._private__timeScale._internal_scrollTo(x);
        this._internal_recalculateAllPanes();
        this._internal_updateCrosshair();
        this._internal_lightUpdate();
        return res;
    };
    ChartModel.prototype._internal_endScrollTime = function () {
        this._private__timeScale._internal_endScroll();
        this._internal_lightUpdate();
        this._private__initialTimeScrollPos = null;
    };
    ChartModel.prototype._internal_resetTimeScale = function () {
        this._private__timeScale._internal_restoreDefault();
        this._internal_recalculateAllPanes();
        this._internal_updateCrosshair();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_invalidate = function (mask) {
        if (this._private__invalidateHandler) {
            this._private__invalidateHandler(mask);
        }
        this._private__grid._internal_invalidate();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_serieses = function () {
        return this._private__serieses;
    };
    ChartModel.prototype._internal_setAndSaveCurrentPosition = function (x, y, pane) {
        this._private__crosshair._internal_saveOriginCoord(x, y);
        var price = NaN;
        var index = this._private__timeScale._internal_coordinateToIndex(x);
        var visibleBars = this._private__timeScale._internal_visibleStrictRange();
        if (visibleBars !== null) {
            index = Math.min(Math.max(visibleBars._internal_left(), index), visibleBars._internal_right());
        }
        var priceScale = pane._internal_defaultPriceScale();
        var firstValue = priceScale._internal_firstValue();
        if (firstValue !== null) {
            price = priceScale._internal_coordinateToPrice(y, firstValue);
        }
        price = this._private__magnet._internal_align(price, index, pane);
        this._private__crosshair._internal_setPosition(index, price, pane);
        this._private__cursorUpdate();
        this._private__crosshairMoved._internal_fire(this._private__crosshair._internal_appliedIndex(), { x: x, y: y });
    };
    ChartModel.prototype._internal_clearCurrentPosition = function () {
        var crosshair = this._internal_crosshairSource();
        crosshair._internal_clearPosition();
        this._private__cursorUpdate();
        this._private__crosshairMoved._internal_fire(null, null);
    };
    ChartModel.prototype._internal_updateCrosshair = function () {
        // apply magnet
        var pane = this._private__crosshair._internal_pane();
        if (pane !== null) {
            var x = this._private__crosshair._internal_originCoordX();
            var y = this._private__crosshair._internal_originCoordY();
            this._internal_setAndSaveCurrentPosition(x, y, pane);
        }
    };
    ChartModel.prototype._internal_updateTimeScale = function (index, values, marks, clearFlag) {
        if (clearFlag) {
            // refresh timescale
            this._private__timeScale._internal_reset();
        }
        this._private__timeScale._internal_update(index, values, marks);
    };
    ChartModel.prototype._internal_updateTimeScaleBaseIndex = function (earliestRowIndex) {
        // get the latest series bar index
        var lastSeriesBarIndex = this._private__serieses.reduce(function (currentRes, series) {
            var seriesBars = series._internal_bars();
            if (seriesBars._internal_isEmpty()) {
                return currentRes;
            }
            var currentLastIndex = ensureNotNull(seriesBars._internal_lastIndex());
            return (currentRes === undefined) ? currentLastIndex : Math.max(currentLastIndex, currentRes);
        }, undefined);
        if (lastSeriesBarIndex !== undefined) {
            var timeScale = this._private__timeScale;
            var currentBaseIndex = timeScale._internal_baseIndex();
            var visibleBars = timeScale._internal_visibleStrictRange();
            // if time scale cannot return current visible bars range (e.g. time scale has zero-width)
            // then we do not need to update right offset to shift visible bars range to have the same right offset as we have before new bar
            // (and actually we cannot)
            if (visibleBars !== null) {
                var isLastSeriesBarVisible = visibleBars._internal_contains(currentBaseIndex);
                if (earliestRowIndex !== undefined && earliestRowIndex > 0 && !isLastSeriesBarVisible) {
                    var compensationShift = lastSeriesBarIndex - currentBaseIndex;
                    timeScale._internal_setRightOffset(timeScale._internal_rightOffset() - compensationShift);
                }
            }
            timeScale._internal_setBaseIndex(lastSeriesBarIndex);
        }
        this._internal_updateCrosshair();
        this._internal_recalculateAllPanes();
        this._internal_lightUpdate();
    };
    ChartModel.prototype._internal_recalculatePane = function (pane) {
        if (pane !== null) {
            pane._internal_recalculate();
        }
    };
    ChartModel.prototype._internal_paneForSource = function (source) {
        var pane = this._private__panes.find(function (p) { return p._internal_orderedSources().includes(source); });
        return pane === undefined ? null : pane;
    };
    ChartModel.prototype._internal_recalculateAllPanes = function () {
        this._private__panes.forEach(function (p) { return p._internal_recalculate(); });
        this._internal_updateAllPaneViews();
    };
    ChartModel.prototype._internal_destroy = function () {
        this._private__panes.forEach(function (p) { return p._internal_destroy(); });
        this._private__panes.length = 0;
        // to avoid memleaks
        this._private__options.localization.priceFormatter = undefined;
        this._private__options.localization.timeFormatter = undefined;
    };
    ChartModel.prototype._internal_rendererOptionsProvider = function () {
        return this._private__rendererOptionsProvider;
    };
    ChartModel.prototype._internal_priceAxisRendererOptions = function () {
        return this._private__rendererOptionsProvider._internal_options();
    };
    ChartModel.prototype._internal_priceScalesOptionsChanged = function () {
        return this._private__priceScalesOptionsChanged;
    };
    ChartModel.prototype._internal_createSeries = function (seriesType, options) {
        var pane = this._private__panes[0];
        var series = this._private__createSeries(options, seriesType, pane);
        this._private__serieses.push(series);
        if (this._private__serieses.length === 1) {
            // call fullUpdate to recalculate chart's parts geometry
            this._internal_fullUpdate();
        }
        else {
            this._internal_lightUpdate();
        }
        return series;
    };
    ChartModel.prototype._internal_removeSeries = function (series) {
        var pane = this._internal_paneForSource(series);
        var seriesIndex = this._private__serieses.indexOf(series);
        assert(seriesIndex !== -1, 'Series not found');
        this._private__serieses.splice(seriesIndex, 1);
        ensureNotNull(pane)._internal_removeDataSource(series);
        if (series._internal_destroy) {
            series._internal_destroy();
        }
    };
    ChartModel.prototype._internal_moveSeriesToScale = function (series, targetScaleId) {
        var pane = ensureNotNull(this._internal_paneForSource(series));
        pane._internal_removeDataSource(series);
        // check if targetScaleId exists
        var target = this._internal_findPriceScale(targetScaleId);
        if (target === null) {
            // new scale on the same pane
            var zOrder = series._internal_zorder();
            pane._internal_addDataSource(series, targetScaleId, zOrder);
        }
        else {
            // if move to the new scale of the same pane, keep zorder
            // if move to new pane
            var zOrder = (target._internal_pane === pane) ? series._internal_zorder() : undefined;
            target._internal_pane._internal_addDataSource(series, targetScaleId, zOrder);
        }
    };
    ChartModel.prototype._internal_fitContent = function () {
        var mask = new InvalidateMask(2 /* Light */);
        mask._internal_setFitContent();
        this._private__invalidate(mask);
    };
    ChartModel.prototype._internal_setTargetLogicalRange = function (range) {
        var mask = new InvalidateMask(2 /* Light */);
        mask._internal_setLogicalRange(range);
        this._private__invalidate(mask);
    };
    ChartModel.prototype._internal_defaultVisiblePriceScaleId = function () {
        return this._private__options.rightPriceScale.visible ? "right" /* Right */ : "left" /* Left */;
    };
    ChartModel.prototype._private__paneInvalidationMask = function (pane, level) {
        var inv = new InvalidateMask(level);
        if (pane !== null) {
            var index = this._private__panes.indexOf(pane);
            inv._internal_invalidatePane(index, {
                _internal_level: level,
            });
        }
        return inv;
    };
    ChartModel.prototype._private__invalidationMaskForSource = function (source, invalidateType) {
        if (invalidateType === undefined) {
            invalidateType = 2 /* Light */;
        }
        return this._private__paneInvalidationMask(this._internal_paneForSource(source), invalidateType);
    };
    ChartModel.prototype._private__invalidate = function (mask) {
        if (this._private__invalidateHandler) {
            this._private__invalidateHandler(mask);
        }
        this._private__grid._internal_invalidate();
    };
    ChartModel.prototype._private__cursorUpdate = function () {
        this._private__invalidate(new InvalidateMask(1 /* Cursor */));
    };
    ChartModel.prototype._private__createSeries = function (options, seriesType, pane) {
        var series = new Series(this, options, seriesType);
        var targetScaleId = options.priceScaleId !== undefined ? options.priceScaleId : this._internal_defaultVisiblePriceScaleId();
        pane._internal_addDataSource(series, targetScaleId);
        if (!isDefaultPriceScale(targetScaleId)) {
            // let's apply that options again to apply margins
            series._internal_applyOptions(options);
        }
        return series;
    };
    return ChartModel;
}());
export { ChartModel };
