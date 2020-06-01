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
        this._dataSources = [];
        this._overlaySourcesByScaleId = new Map();
        this._height = 0;
        this._width = 0;
        this._stretchFactor = DEFAULT_STRETCH_FACTOR;
        this._cachedOrderedSources = null;
        this._destroyed = new Delegate();
        this._timeScale = timeScale;
        this._model = model;
        var options = model.options();
        this._leftPriceScale = this._createPriceScale("left" /* Left */, options.leftPriceScale);
        this._rightPriceScale = this._createPriceScale("right" /* Right */, options.rightPriceScale);
        this._leftPriceScale.modeChanged().subscribe(this._onPriceScaleModeChanged.bind(this, this._leftPriceScale), this);
        this._rightPriceScale.modeChanged().subscribe(this._onPriceScaleModeChanged.bind(this, this._leftPriceScale), this);
        this.applyScaleOptions(options);
    }
    Pane.prototype.applyScaleOptions = function (options) {
        if (options.leftPriceScale) {
            this._leftPriceScale.applyOptions(options.leftPriceScale);
        }
        if (options.rightPriceScale) {
            this._rightPriceScale.applyOptions(options.rightPriceScale);
        }
        if (options.localization) {
            this._leftPriceScale.updateFormatter();
            this._rightPriceScale.updateFormatter();
        }
        if (options.overlayPriceScales) {
            var sourceArrays = Array.from(this._overlaySourcesByScaleId.values());
            for (var _i = 0, sourceArrays_1 = sourceArrays; _i < sourceArrays_1.length; _i++) {
                var arr = sourceArrays_1[_i];
                var priceScale = ensureNotNull(arr[0].priceScale());
                priceScale.applyOptions(options.overlayPriceScales);
                if (options.localization) {
                    priceScale.updateFormatter();
                }
            }
        }
    };
    Pane.prototype.priceScaleById = function (id) {
        switch (id) {
            case "left" /* Left */: {
                return this._leftPriceScale;
            }
            case "right" /* Right */: {
                return this._rightPriceScale;
            }
        }
        if (this._overlaySourcesByScaleId.has(id)) {
            return ensureDefined(this._overlaySourcesByScaleId.get(id))[0].priceScale();
        }
        return null;
    };
    Pane.prototype.destroy = function () {
        this.model().priceScalesOptionsChanged().unsubscribeAll(this);
        this._leftPriceScale.modeChanged().unsubscribeAll(this);
        this._rightPriceScale.modeChanged().unsubscribeAll(this);
        this._dataSources.forEach(function (source) {
            if (source.destroy) {
                source.destroy();
            }
        });
        this._destroyed.fire();
    };
    Pane.prototype.stretchFactor = function () {
        return this._stretchFactor;
    };
    Pane.prototype.setStretchFactor = function (factor) {
        this._stretchFactor = factor;
    };
    Pane.prototype.model = function () {
        return this._model;
    };
    Pane.prototype.width = function () {
        return this._width;
    };
    Pane.prototype.height = function () {
        return this._height;
    };
    Pane.prototype.setWidth = function (width) {
        this._width = width;
        this.updateAllViews();
    };
    Pane.prototype.setHeight = function (height) {
        var _this = this;
        this._height = height;
        this._leftPriceScale.setHeight(height);
        this._rightPriceScale.setHeight(height);
        // process overlays
        this._dataSources.forEach(function (ds) {
            if (_this.isOverlay(ds)) {
                var priceScale = ds.priceScale();
                if (priceScale !== null) {
                    priceScale.setHeight(height);
                }
            }
        });
        this.updateAllViews();
    };
    Pane.prototype.dataSources = function () {
        return this._dataSources;
    };
    Pane.prototype.isOverlay = function (source) {
        var priceScale = source.priceScale();
        if (priceScale === null) {
            return true;
        }
        return this._leftPriceScale !== priceScale && this._rightPriceScale !== priceScale;
    };
    Pane.prototype.addDataSource = function (source, targetScaleId, zOrder) {
        var targetZOrder = (zOrder !== undefined) ? zOrder : this._getZOrderMinMax().minZOrder - 1;
        this._insertDataSource(source, targetScaleId, targetZOrder);
    };
    Pane.prototype.removeDataSource = function (source) {
        var index = this._dataSources.indexOf(source);
        assert(index !== -1, 'removeDataSource: invalid data source');
        this._dataSources.splice(index, 1);
        var priceScaleId = ensureNotNull(source.priceScale()).id();
        if (this._overlaySourcesByScaleId.has(priceScaleId)) {
            var overlaySources = ensureDefined(this._overlaySourcesByScaleId.get(priceScaleId));
            var overlayIndex = overlaySources.indexOf(source);
            if (overlayIndex !== -1) {
                overlaySources.splice(overlayIndex, 1);
                if (overlaySources.length === 0) {
                    this._overlaySourcesByScaleId.delete(priceScaleId);
                }
            }
        }
        var priceScale = source.priceScale();
        // if source has owner, it returns owner's price scale
        // and it does not have source in their list
        if (priceScale && priceScale.dataSources().indexOf(source) >= 0) {
            priceScale.removeDataSource(source);
        }
        if (priceScale !== null) {
            priceScale.invalidateSourcesCache();
            this.recalculatePriceScale(priceScale);
        }
        this._cachedOrderedSources = null;
    };
    Pane.prototype.priceScalePosition = function (priceScale) {
        if (priceScale === this._leftPriceScale) {
            return 'left';
        }
        if (priceScale === this._rightPriceScale) {
            return 'right';
        }
        return 'overlay';
    };
    Pane.prototype.leftPriceScale = function () {
        return this._leftPriceScale;
    };
    Pane.prototype.rightPriceScale = function () {
        return this._rightPriceScale;
    };
    Pane.prototype.startScalePrice = function (priceScale, x) {
        priceScale.startScale(x);
    };
    Pane.prototype.scalePriceTo = function (priceScale, x) {
        priceScale.scaleTo(x);
        // TODO: be more smart and update only affected views
        this.updateAllViews();
    };
    Pane.prototype.endScalePrice = function (priceScale) {
        priceScale.endScale();
    };
    Pane.prototype.startScrollPrice = function (priceScale, x) {
        priceScale.startScroll(x);
    };
    Pane.prototype.scrollPriceTo = function (priceScale, x) {
        priceScale.scrollTo(x);
        this.updateAllViews();
    };
    Pane.prototype.endScrollPrice = function (priceScale) {
        priceScale.endScroll();
    };
    Pane.prototype.setPriceAutoScale = function (priceScale, autoScale) {
        priceScale.setMode({
            autoScale: autoScale,
        });
        if (this._timeScale.isEmpty()) {
            priceScale.setPriceRange(null);
            return;
        }
        this.recalculatePriceScale(priceScale);
    };
    Pane.prototype.updateAllViews = function () {
        this._dataSources.forEach(function (source) {
            source.updateAllViews();
        });
    };
    Pane.prototype.defaultPriceScale = function () {
        var priceScale = null;
        if (this._model.options().rightPriceScale.visible && this._rightPriceScale.dataSources().length !== 0) {
            priceScale = this._rightPriceScale;
        }
        else if (this._model.options().leftPriceScale.visible && this._leftPriceScale.dataSources().length !== 0) {
            priceScale = this._leftPriceScale;
        }
        else if (this._dataSources.length !== 0) {
            priceScale = this._dataSources[0].priceScale();
        }
        if (priceScale === null) {
            priceScale = this._rightPriceScale;
        }
        return priceScale;
    };
    Pane.prototype.recalculatePriceScale = function (priceScale) {
        if (priceScale === null || !priceScale.isAutoScale()) {
            return;
        }
        this._recalculatePriceScaleImpl(priceScale);
    };
    Pane.prototype.resetPriceScale = function (priceScale) {
        var visibleBars = this._timeScale.visibleStrictRange();
        priceScale.setMode({ autoScale: true });
        if (visibleBars !== null) {
            priceScale.recalculatePriceRange(visibleBars);
        }
        this.updateAllViews();
    };
    Pane.prototype.momentaryAutoScale = function () {
        this._recalculatePriceScaleImpl(this._leftPriceScale);
        this._recalculatePriceScaleImpl(this._rightPriceScale);
    };
    Pane.prototype.recalculate = function () {
        var _this = this;
        this.recalculatePriceScale(this._leftPriceScale);
        this.recalculatePriceScale(this._rightPriceScale);
        this._dataSources.forEach(function (ds) {
            if (_this.isOverlay(ds)) {
                _this.recalculatePriceScale(ds.priceScale());
            }
        });
        this.updateAllViews();
        this._model.lightUpdate();
    };
    Pane.prototype.isEmpty = function () {
        return this._dataSources.length === 0;
    };
    Pane.prototype.orderedSources = function () {
        if (this._cachedOrderedSources === null) {
            this._cachedOrderedSources = sortSources(this._dataSources);
        }
        return this._cachedOrderedSources;
    };
    Pane.prototype.onDestroyed = function () {
        return this._destroyed;
    };
    Pane.prototype._recalculatePriceScaleImpl = function (priceScale) {
        // TODO: can use this checks
        var sourceForAutoScale = priceScale.sourcesForAutoScale();
        if (sourceForAutoScale && sourceForAutoScale.length > 0 && !this._timeScale.isEmpty()) {
            var visibleBars = this._timeScale.visibleStrictRange();
            if (visibleBars !== null) {
                priceScale.recalculatePriceRange(visibleBars);
            }
        }
        priceScale.updateAllViews();
    };
    Pane.prototype._getZOrderMinMax = function () {
        var sources = this.orderedSources();
        if (sources.length === 0) {
            return { minZOrder: 0, maxZOrder: 0 };
        }
        var minZOrder = 0;
        var maxZOrder = 0;
        for (var j = 0; j < sources.length; j++) {
            var ds = sources[j];
            var zOrder = ds.zorder();
            if (zOrder !== null) {
                if (zOrder < minZOrder) {
                    minZOrder = zOrder;
                }
                if (zOrder > maxZOrder) {
                    maxZOrder = zOrder;
                }
            }
        }
        return { minZOrder: minZOrder, maxZOrder: maxZOrder };
    };
    Pane.prototype._insertDataSource = function (source, priceScaleId, zOrder) {
        var priceScale = this.priceScaleById(priceScaleId);
        if (priceScale === null) {
            priceScale = this._createPriceScale(priceScaleId, this._model.options().overlayPriceScales);
        }
        this._dataSources.push(source);
        if (!isDefaultPriceScale(priceScaleId)) {
            var overlaySources = this._overlaySourcesByScaleId.get(priceScaleId) || [];
            overlaySources.push(source);
            this._overlaySourcesByScaleId.set(priceScaleId, overlaySources);
        }
        priceScale.addDataSource(source);
        source.setPriceScale(priceScale);
        source.setZorder(zOrder);
        this.recalculatePriceScale(priceScale);
        this._cachedOrderedSources = null;
    };
    Pane.prototype._onPriceScaleModeChanged = function (priceScale, oldMode, newMode) {
        if (oldMode.mode === newMode.mode) {
            return;
        }
        // momentary auto scale if we toggle percentage/indexedTo100 mode
        this._recalculatePriceScaleImpl(priceScale);
    };
    Pane.prototype._createPriceScale = function (id, options) {
        var actualOptions = __assign({ visible: true, autoScale: true }, clone(options));
        var priceScale = new PriceScale(id, actualOptions, this._model.options().layout, this._model.options().localization);
        priceScale.setHeight(this.height());
        return priceScale;
    };
    return Pane;
}());
export { Pane };
