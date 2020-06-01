import { __assign } from "tslib";
import { assert, ensureDefined, ensureNotNull } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone } from '../helpers/strict-type-checks';
import { isDefaultPriceScale } from './default-price-scale';
import { PriceScale } from './price-scale';
import { sortSources } from './sort-sources';
export var DEFAULT_STRETCH_FACTOR = 1000;
var Pane = /** @class */ (function () {
    function Pane(timeScale, model) {
        this._private__dataSources = [];
        this._private__overlaySourcesByScaleId = new Map();
        this._private__height = 0;
        this._private__width = 0;
        this._private__stretchFactor = DEFAULT_STRETCH_FACTOR;
        this._private__cachedOrderedSources = null;
        this._private__destroyed = new Delegate();
        this._private__timeScale = timeScale;
        this._private__model = model;
        var options = model._internal_options();
        this._private__leftPriceScale = this._private__createPriceScale("left" /* Left */, options.leftPriceScale);
        this._private__rightPriceScale = this._private__createPriceScale("right" /* Right */, options.rightPriceScale);
        this._private__leftPriceScale._internal_modeChanged()._internal_subscribe(this._private__onPriceScaleModeChanged.bind(this, this._private__leftPriceScale), this);
        this._private__rightPriceScale._internal_modeChanged()._internal_subscribe(this._private__onPriceScaleModeChanged.bind(this, this._private__leftPriceScale), this);
        this._internal_applyScaleOptions(options);
    }
    Pane.prototype._internal_applyScaleOptions = function (options) {
        if (options.leftPriceScale) {
            this._private__leftPriceScale._internal_applyOptions(options.leftPriceScale);
        }
        if (options.rightPriceScale) {
            this._private__rightPriceScale._internal_applyOptions(options.rightPriceScale);
        }
        if (options.localization) {
            this._private__leftPriceScale._internal_updateFormatter();
            this._private__rightPriceScale._internal_updateFormatter();
        }
        if (options.overlayPriceScales) {
            var sourceArrays = Array.from(this._private__overlaySourcesByScaleId.values());
            for (var _i = 0, sourceArrays_1 = sourceArrays; _i < sourceArrays_1.length; _i++) {
                var arr = sourceArrays_1[_i];
                var priceScale = ensureNotNull(arr[0]._internal_priceScale());
                priceScale._internal_applyOptions(options.overlayPriceScales);
                if (options.localization) {
                    priceScale._internal_updateFormatter();
                }
            }
        }
    };
    Pane.prototype._internal_priceScaleById = function (id) {
        switch (id) {
            case "left" /* Left */: {
                return this._private__leftPriceScale;
            }
            case "right" /* Right */: {
                return this._private__rightPriceScale;
            }
        }
        if (this._private__overlaySourcesByScaleId.has(id)) {
            return ensureDefined(this._private__overlaySourcesByScaleId.get(id))[0]._internal_priceScale();
        }
        return null;
    };
    Pane.prototype._internal_destroy = function () {
        this._internal_model()._internal_priceScalesOptionsChanged()._internal_unsubscribeAll(this);
        this._private__leftPriceScale._internal_modeChanged()._internal_unsubscribeAll(this);
        this._private__rightPriceScale._internal_modeChanged()._internal_unsubscribeAll(this);
        this._private__dataSources.forEach(function (source) {
            if (source._internal_destroy) {
                source._internal_destroy();
            }
        });
        this._private__destroyed._internal_fire();
    };
    Pane.prototype._internal_stretchFactor = function () {
        return this._private__stretchFactor;
    };
    Pane.prototype._internal_setStretchFactor = function (factor) {
        this._private__stretchFactor = factor;
    };
    Pane.prototype._internal_model = function () {
        return this._private__model;
    };
    Pane.prototype._internal_width = function () {
        return this._private__width;
    };
    Pane.prototype._internal_height = function () {
        return this._private__height;
    };
    Pane.prototype._internal_setWidth = function (width) {
        this._private__width = width;
        this._internal_updateAllViews();
    };
    Pane.prototype._internal_setHeight = function (height) {
        var _this = this;
        this._private__height = height;
        this._private__leftPriceScale._internal_setHeight(height);
        this._private__rightPriceScale._internal_setHeight(height);
        // process overlays
        this._private__dataSources.forEach(function (ds) {
            if (_this._internal_isOverlay(ds)) {
                var priceScale = ds._internal_priceScale();
                if (priceScale !== null) {
                    priceScale._internal_setHeight(height);
                }
            }
        });
        this._internal_updateAllViews();
    };
    Pane.prototype._internal_dataSources = function () {
        return this._private__dataSources;
    };
    Pane.prototype._internal_isOverlay = function (source) {
        var priceScale = source._internal_priceScale();
        if (priceScale === null) {
            return true;
        }
        return this._private__leftPriceScale !== priceScale && this._private__rightPriceScale !== priceScale;
    };
    Pane.prototype._internal_addDataSource = function (source, targetScaleId, zOrder) {
        var targetZOrder = (zOrder !== undefined) ? zOrder : this._private__getZOrderMinMax()._internal_minZOrder - 1;
        this._private__insertDataSource(source, targetScaleId, targetZOrder);
    };
    Pane.prototype._internal_removeDataSource = function (source) {
        var index = this._private__dataSources.indexOf(source);
        assert(index !== -1, 'removeDataSource: invalid data source');
        this._private__dataSources.splice(index, 1);
        var priceScaleId = ensureNotNull(source._internal_priceScale())._internal_id();
        if (this._private__overlaySourcesByScaleId.has(priceScaleId)) {
            var overlaySources = ensureDefined(this._private__overlaySourcesByScaleId.get(priceScaleId));
            var overlayIndex = overlaySources.indexOf(source);
            if (overlayIndex !== -1) {
                overlaySources.splice(overlayIndex, 1);
                if (overlaySources.length === 0) {
                    this._private__overlaySourcesByScaleId.delete(priceScaleId);
                }
            }
        }
        var priceScale = source._internal_priceScale();
        // if source has owner, it returns owner's price scale
        // and it does not have source in their list
        if (priceScale && priceScale._internal_dataSources().indexOf(source) >= 0) {
            priceScale._internal_removeDataSource(source);
        }
        if (priceScale !== null) {
            priceScale._internal_invalidateSourcesCache();
            this._internal_recalculatePriceScale(priceScale);
        }
        this._private__cachedOrderedSources = null;
    };
    Pane.prototype._internal_priceScalePosition = function (priceScale) {
        if (priceScale === this._private__leftPriceScale) {
            return 'left';
        }
        if (priceScale === this._private__rightPriceScale) {
            return 'right';
        }
        return 'overlay';
    };
    Pane.prototype._internal_leftPriceScale = function () {
        return this._private__leftPriceScale;
    };
    Pane.prototype._internal_rightPriceScale = function () {
        return this._private__rightPriceScale;
    };
    Pane.prototype._internal_startScalePrice = function (priceScale, x) {
        priceScale._internal_startScale(x);
    };
    Pane.prototype._internal_scalePriceTo = function (priceScale, x) {
        priceScale._internal_scaleTo(x);
        // TODO: be more smart and update only affected views
        this._internal_updateAllViews();
    };
    Pane.prototype._internal_endScalePrice = function (priceScale) {
        priceScale._internal_endScale();
    };
    Pane.prototype._internal_startScrollPrice = function (priceScale, x) {
        priceScale._internal_startScroll(x);
    };
    Pane.prototype._internal_scrollPriceTo = function (priceScale, x) {
        priceScale._internal_scrollTo(x);
        this._internal_updateAllViews();
    };
    Pane.prototype._internal_endScrollPrice = function (priceScale) {
        priceScale._internal_endScroll();
    };
    Pane.prototype._internal_setPriceAutoScale = function (priceScale, autoScale) {
        priceScale._internal_setMode({
            _internal_autoScale: autoScale,
        });
        if (this._private__timeScale._internal_isEmpty()) {
            priceScale._internal_setPriceRange(null);
            return;
        }
        this._internal_recalculatePriceScale(priceScale);
    };
    Pane.prototype._internal_updateAllViews = function () {
        this._private__dataSources.forEach(function (source) {
            source._internal_updateAllViews();
        });
    };
    Pane.prototype._internal_defaultPriceScale = function () {
        var priceScale = null;
        if (this._private__model._internal_options().rightPriceScale.visible && this._private__rightPriceScale._internal_dataSources().length !== 0) {
            priceScale = this._private__rightPriceScale;
        }
        else if (this._private__model._internal_options().leftPriceScale.visible && this._private__leftPriceScale._internal_dataSources().length !== 0) {
            priceScale = this._private__leftPriceScale;
        }
        else if (this._private__dataSources.length !== 0) {
            priceScale = this._private__dataSources[0]._internal_priceScale();
        }
        if (priceScale === null) {
            priceScale = this._private__rightPriceScale;
        }
        return priceScale;
    };
    Pane.prototype._internal_recalculatePriceScale = function (priceScale) {
        if (priceScale === null || !priceScale._internal_isAutoScale()) {
            return;
        }
        this._private__recalculatePriceScaleImpl(priceScale);
    };
    Pane.prototype._internal_resetPriceScale = function (priceScale) {
        var visibleBars = this._private__timeScale._internal_visibleStrictRange();
        priceScale._internal_setMode({ _internal_autoScale: true });
        if (visibleBars !== null) {
            priceScale._internal_recalculatePriceRange(visibleBars);
        }
        this._internal_updateAllViews();
    };
    Pane.prototype._internal_momentaryAutoScale = function () {
        this._private__recalculatePriceScaleImpl(this._private__leftPriceScale);
        this._private__recalculatePriceScaleImpl(this._private__rightPriceScale);
    };
    Pane.prototype._internal_recalculate = function () {
        var _this = this;
        this._internal_recalculatePriceScale(this._private__leftPriceScale);
        this._internal_recalculatePriceScale(this._private__rightPriceScale);
        this._private__dataSources.forEach(function (ds) {
            if (_this._internal_isOverlay(ds)) {
                _this._internal_recalculatePriceScale(ds._internal_priceScale());
            }
        });
        this._internal_updateAllViews();
        this._private__model._internal_lightUpdate();
    };
    Pane.prototype._internal_isEmpty = function () {
        return this._private__dataSources.length === 0;
    };
    Pane.prototype._internal_orderedSources = function () {
        if (this._private__cachedOrderedSources === null) {
            this._private__cachedOrderedSources = sortSources(this._private__dataSources);
        }
        return this._private__cachedOrderedSources;
    };
    Pane.prototype._internal_onDestroyed = function () {
        return this._private__destroyed;
    };
    Pane.prototype._private__recalculatePriceScaleImpl = function (priceScale) {
        // TODO: can use this checks
        var sourceForAutoScale = priceScale._internal_sourcesForAutoScale();
        if (sourceForAutoScale && sourceForAutoScale.length > 0 && !this._private__timeScale._internal_isEmpty()) {
            var visibleBars = this._private__timeScale._internal_visibleStrictRange();
            if (visibleBars !== null) {
                priceScale._internal_recalculatePriceRange(visibleBars);
            }
        }
        priceScale._internal_updateAllViews();
    };
    Pane.prototype._private__getZOrderMinMax = function () {
        var sources = this._internal_orderedSources();
        if (sources.length === 0) {
            return { _internal_minZOrder: 0, _internal_maxZOrder: 0 };
        }
        var minZOrder = 0;
        var maxZOrder = 0;
        for (var j = 0; j < sources.length; j++) {
            var ds = sources[j];
            var zOrder = ds._internal_zorder();
            if (zOrder !== null) {
                if (zOrder < minZOrder) {
                    minZOrder = zOrder;
                }
                if (zOrder > maxZOrder) {
                    maxZOrder = zOrder;
                }
            }
        }
        return { _internal_minZOrder: minZOrder, _internal_maxZOrder: maxZOrder };
    };
    Pane.prototype._private__insertDataSource = function (source, priceScaleId, zOrder) {
        var priceScale = this._internal_priceScaleById(priceScaleId);
        if (priceScale === null) {
            priceScale = this._private__createPriceScale(priceScaleId, this._private__model._internal_options().overlayPriceScales);
        }
        this._private__dataSources.push(source);
        if (!isDefaultPriceScale(priceScaleId)) {
            var overlaySources = this._private__overlaySourcesByScaleId.get(priceScaleId) || [];
            overlaySources.push(source);
            this._private__overlaySourcesByScaleId.set(priceScaleId, overlaySources);
        }
        priceScale._internal_addDataSource(source);
        source._internal_setPriceScale(priceScale);
        source._internal_setZorder(zOrder);
        this._internal_recalculatePriceScale(priceScale);
        this._private__cachedOrderedSources = null;
    };
    Pane.prototype._private__onPriceScaleModeChanged = function (priceScale, oldMode, newMode) {
        if (oldMode._internal_mode === newMode._internal_mode) {
            return;
        }
        // momentary auto scale if we toggle percentage/indexedTo100 mode
        this._private__recalculatePriceScaleImpl(priceScale);
    };
    Pane.prototype._private__createPriceScale = function (id, options) {
        var actualOptions = __assign({ _internal_visible: true, _internal_autoScale: true }, clone(options));
        var priceScale = new PriceScale(id, actualOptions, this._private__model._internal_options().layout, this._private__model._internal_options().localization);
        priceScale._internal_setHeight(this._internal_height());
        return priceScale;
    };
    return Pane;
}());
export { Pane };
