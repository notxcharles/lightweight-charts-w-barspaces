import { PercentageFormatter } from '../formatters/percentage-formatter';
import { PriceFormatter } from '../formatters/price-formatter';
import { ensureDefined, ensureNotNull } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { merge } from '../helpers/strict-type-checks';
import { PriceRangeImpl } from './price-range-impl';
import { canConvertPriceRangeFromLog, convertPriceRangeFromLog, convertPriceRangeToLog, fromIndexedTo100, fromLog, fromPercent, toIndexedTo100, toIndexedTo100Range, toLog, toPercent, toPercentRange, } from './price-scale-conversions';
import { PriceTickMarkBuilder } from './price-tick-mark-builder';
import { sortSources } from './sort-sources';
/**
 * Enum of possible price scale modes
 * Normal mode displays original price values
 * Logarithmic mode makes price scale show logarithms of series values instead of original values
 * Percentage turns the percentage mode on.
 * IndexedTo100 turns the "indexed to 100" mode on
 */
export var PriceScaleMode;
(function (PriceScaleMode) {
    PriceScaleMode[PriceScaleMode["Normal"] = 0] = "Normal";
    PriceScaleMode[PriceScaleMode["Logarithmic"] = 1] = "Logarithmic";
    PriceScaleMode[PriceScaleMode["Percentage"] = 2] = "Percentage";
    PriceScaleMode[PriceScaleMode["IndexedTo100"] = 3] = "IndexedTo100";
})(PriceScaleMode || (PriceScaleMode = {}));
var percentageFormatter = new PercentageFormatter();
var defaultPriceFormatter = new PriceFormatter(100, 1);
var PriceScale = /** @class */ (function () {
    function PriceScale(id, options, layoutOptions, localizationOptions) {
        this._height = 0;
        this._internalHeightCache = null;
        this._internalHeightChanged = new Delegate();
        this._priceRange = null;
        this._priceRangeSnapshot = null;
        this._priceRangeChanged = new Delegate();
        this._invalidatedForRange = { isValid: false, visibleBars: null };
        this._marginAbove = 0;
        this._marginBelow = 0;
        this._onMarksChanged = new Delegate();
        this._modeChanged = new Delegate();
        this._dataSources = [];
        this._cachedOrderedSources = null;
        this._marksCache = null;
        this._scaleStartPoint = null;
        this._scrollStartPoint = null;
        this._formatter = defaultPriceFormatter;
        this._optionsChanged = new Delegate();
        this._id = id;
        this._options = options;
        this._layoutOptions = layoutOptions;
        this._localizationOptions = localizationOptions;
        this._markBuilder = new PriceTickMarkBuilder(this, 100, this._coordinateToLogical.bind(this), this._logicalToCoordinate.bind(this));
    }
    PriceScale.prototype.id = function () {
        return this._id;
    };
    PriceScale.prototype.options = function () {
        return this._options;
    };
    PriceScale.prototype.applyOptions = function (options) {
        merge(this._options, options);
        this.updateFormatter();
        if (options.mode !== undefined) {
            this.setMode({ mode: options.mode });
        }
        this._optionsChanged.fire();
        if (options.scaleMargins !== undefined) {
            var top_1 = ensureDefined(options.scaleMargins.top);
            var bottom = ensureDefined(options.scaleMargins.bottom);
            if (top_1 < 0 || top_1 > 1) {
                throw new Error("Invalid top margin - expect value between 0 and 1, given=" + top_1);
            }
            if (bottom < 0 || bottom > 1 || top_1 + bottom > 1) {
                throw new Error("Invalid bottom margin - expect value between 0 and 1, given=" + bottom);
            }
            if (top_1 + bottom > 1) {
                throw new Error("Invalid margins - sum of margins must be less than 1, given=" + (top_1 + bottom));
            }
            this._invalidateInternalHeightCache();
            this._marksCache = null;
        }
    };
    PriceScale.prototype.optionsChanged = function () {
        return this._optionsChanged;
    };
    PriceScale.prototype.isAutoScale = function () {
        return this._options.autoScale;
    };
    PriceScale.prototype.isLog = function () {
        return this._options.mode === 1 /* Logarithmic */;
    };
    PriceScale.prototype.isPercentage = function () {
        return this._options.mode === 2 /* Percentage */;
    };
    PriceScale.prototype.isIndexedTo100 = function () {
        return this._options.mode === 3 /* IndexedTo100 */;
    };
    PriceScale.prototype.mode = function () {
        return {
            autoScale: this._options.autoScale,
            isInverted: this._options.invertScale,
            mode: this._options.mode,
        };
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceScale.prototype.setMode = function (newMode) {
        var oldMode = this.mode();
        var priceRange = null;
        if (newMode.autoScale !== undefined) {
            this._options.autoScale = newMode.autoScale;
        }
        if (newMode.mode !== undefined) {
            this._options.mode = newMode.mode;
            if (newMode.mode === 2 /* Percentage */ || newMode.mode === 3 /* IndexedTo100 */) {
                this._options.autoScale = true;
            }
            // TODO: Remove after making rebuildTickMarks lazy
            this._invalidatedForRange.isValid = false;
        }
        // define which scale converted from
        if (oldMode.mode === 1 /* Logarithmic */ && newMode.mode !== oldMode.mode) {
            if (canConvertPriceRangeFromLog(this._priceRange)) {
                priceRange = convertPriceRangeFromLog(this._priceRange);
                if (priceRange !== null) {
                    this.setPriceRange(priceRange);
                }
            }
            else {
                this._options.autoScale = true;
            }
        }
        // define which scale converted to
        if (newMode.mode === 1 /* Logarithmic */ && newMode.mode !== oldMode.mode) {
            priceRange = convertPriceRangeToLog(this._priceRange);
            if (priceRange !== null) {
                this.setPriceRange(priceRange);
            }
        }
        var modeChanged = oldMode.mode !== this._options.mode;
        if (modeChanged && (oldMode.mode === 2 /* Percentage */ || this.isPercentage())) {
            this.updateFormatter();
        }
        if (modeChanged && (oldMode.mode === 3 /* IndexedTo100 */ || this.isIndexedTo100())) {
            this.updateFormatter();
        }
        if (newMode.isInverted !== undefined && oldMode.isInverted !== newMode.isInverted) {
            this._options.invertScale = newMode.isInverted;
            this._onIsInvertedChanged();
        }
        this._modeChanged.fire(oldMode, this.mode());
    };
    PriceScale.prototype.modeChanged = function () {
        return this._modeChanged;
    };
    PriceScale.prototype.fontSize = function () {
        return this._layoutOptions.fontSize;
    };
    PriceScale.prototype.height = function () {
        return this._height;
    };
    PriceScale.prototype.setHeight = function (value) {
        if (this._height === value) {
            return;
        }
        this._height = value;
        this._invalidateInternalHeightCache();
        this._marksCache = null;
    };
    PriceScale.prototype.internalHeight = function () {
        if (this._internalHeightCache) {
            return this._internalHeightCache;
        }
        var res = this.height() - this._topMarginPx() - this._bottomMarginPx();
        this._internalHeightCache = res;
        return res;
    };
    PriceScale.prototype.internalHeightChanged = function () {
        return this._internalHeightChanged;
    };
    PriceScale.prototype.priceRange = function () {
        this._makeSureItIsValid();
        return this._priceRange;
    };
    PriceScale.prototype.priceRangeChanged = function () {
        return this._priceRangeChanged;
    };
    PriceScale.prototype.setPriceRange = function (newPriceRange, isForceSetValue, onlyPriceScaleUpdate) {
        var oldPriceRange = this._priceRange;
        if (!isForceSetValue &&
            !(oldPriceRange === null && newPriceRange !== null) &&
            (oldPriceRange === null || oldPriceRange.equals(newPriceRange))) {
            return;
        }
        this._marksCache = null;
        this._priceRange = newPriceRange;
        if (!onlyPriceScaleUpdate) {
            this._priceRangeChanged.fire(oldPriceRange, newPriceRange);
        }
    };
    PriceScale.prototype.isEmpty = function () {
        this._makeSureItIsValid();
        return this._height === 0 || !this._priceRange || this._priceRange.isEmpty();
    };
    PriceScale.prototype.invertedCoordinate = function (coordinate) {
        return this.isInverted() ? coordinate : this.height() - 1 - coordinate;
    };
    PriceScale.prototype.priceToCoordinate = function (price, baseValue) {
        if (this.isPercentage()) {
            price = toPercent(price, baseValue);
        }
        else if (this.isIndexedTo100()) {
            price = toIndexedTo100(price, baseValue);
        }
        return this._logicalToCoordinate(price, baseValue);
    };
    PriceScale.prototype.pointsArrayToCoordinates = function (points, baseValue, visibleRange) {
        this._makeSureItIsValid();
        var bh = this._bottomMarginPx();
        var range = ensureNotNull(this.priceRange());
        var min = range.minValue();
        var max = range.maxValue();
        var ih = (this.internalHeight() - 1);
        var isInverted = this.isInverted();
        var hmm = ih / (max - min);
        var fromIndex = (visibleRange === undefined) ? 0 : visibleRange.from;
        var toIndex = (visibleRange === undefined) ? points.length : visibleRange.to;
        var transformFn = this._getCoordinateTransformer();
        for (var i = fromIndex; i < toIndex; i++) {
            var point = points[i];
            var price = point.price;
            if (isNaN(price)) {
                continue;
            }
            var logical = price;
            if (transformFn !== null) {
                logical = transformFn(point.price, baseValue);
            }
            var invCoordinate = bh + hmm * (logical - min);
            var coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
            point.y = coordinate;
        }
    };
    PriceScale.prototype.barPricesToCoordinates = function (pricesList, baseValue, visibleRange) {
        this._makeSureItIsValid();
        var bh = this._bottomMarginPx();
        var range = ensureNotNull(this.priceRange());
        var min = range.minValue();
        var max = range.maxValue();
        var ih = (this.internalHeight() - 1);
        var isInverted = this.isInverted();
        var hmm = ih / (max - min);
        var fromIndex = (visibleRange === undefined) ? 0 : visibleRange.from;
        var toIndex = (visibleRange === undefined) ? pricesList.length : visibleRange.to;
        var transformFn = this._getCoordinateTransformer();
        for (var i = fromIndex; i < toIndex; i++) {
            var bar = pricesList[i];
            var openLogical = bar.open;
            var highLogical = bar.high;
            var lowLogical = bar.low;
            var closeLogical = bar.close;
            if (transformFn !== null) {
                openLogical = transformFn(bar.open, baseValue);
                highLogical = transformFn(bar.high, baseValue);
                lowLogical = transformFn(bar.low, baseValue);
                closeLogical = transformFn(bar.close, baseValue);
            }
            var invCoordinate = bh + hmm * (openLogical - min);
            var coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
            bar.openY = coordinate;
            invCoordinate = bh + hmm * (highLogical - min);
            coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
            bar.highY = coordinate;
            invCoordinate = bh + hmm * (lowLogical - min);
            coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
            bar.lowY = coordinate;
            invCoordinate = bh + hmm * (closeLogical - min);
            coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
            bar.closeY = coordinate;
        }
    };
    PriceScale.prototype.coordinateToPrice = function (coordinate, baseValue) {
        var logical = this._coordinateToLogical(coordinate, baseValue);
        return this.logicalToPrice(logical, baseValue);
    };
    PriceScale.prototype.logicalToPrice = function (logical, baseValue) {
        var value = logical;
        if (this.isPercentage()) {
            value = fromPercent(value, baseValue);
        }
        else if (this.isIndexedTo100()) {
            value = fromIndexedTo100(value, baseValue);
        }
        return value;
    };
    PriceScale.prototype.dataSources = function () {
        return this._dataSources;
    };
    PriceScale.prototype.orderedSources = function () {
        if (this._cachedOrderedSources) {
            return this._cachedOrderedSources;
        }
        var sources = [];
        for (var i = 0; i < this._dataSources.length; i++) {
            var ds = this._dataSources[i];
            if (ds.zorder() === null) {
                ds.setZorder(i + 1);
            }
            sources.push(ds);
        }
        sources = sortSources(sources);
        this._cachedOrderedSources = sources;
        return this._cachedOrderedSources;
    };
    PriceScale.prototype.addDataSource = function (source) {
        if (this._dataSources.indexOf(source) !== -1) {
            return;
        }
        this._dataSources.push(source);
        this.updateFormatter();
        this.invalidateSourcesCache();
    };
    PriceScale.prototype.removeDataSource = function (source) {
        var index = this._dataSources.indexOf(source);
        if (index === -1) {
            throw new Error('source is not attached to scale');
        }
        this._dataSources.splice(index, 1);
        if (this.isEmpty()) {
            this.setMode({
                autoScale: true,
            });
        }
        this.updateFormatter();
        this.invalidateSourcesCache();
    };
    PriceScale.prototype.firstValue = function () {
        // TODO: cache the result
        var result = null;
        for (var _i = 0, _a = this._dataSources; _i < _a.length; _i++) {
            var source = _a[_i];
            var firstValue = source.firstValue();
            if (firstValue === null) {
                continue;
            }
            if (result === null || firstValue.timePoint < result.timePoint) {
                result = firstValue;
            }
        }
        return result === null ? null : result.value;
    };
    PriceScale.prototype.isInverted = function () {
        return this._options.invertScale;
    };
    PriceScale.prototype.marks = function () {
        if (this._marksCache) {
            return this._marksCache;
        }
        this._markBuilder.rebuildTickMarks();
        this._marksCache = this._markBuilder.marks();
        this._onMarksChanged.fire();
        return this._marksCache;
    };
    PriceScale.prototype.onMarksChanged = function () {
        return this._onMarksChanged;
    };
    PriceScale.prototype.startScale = function (x) {
        if (this.isPercentage() || this.isIndexedTo100()) {
            return;
        }
        if (this._scaleStartPoint !== null || this._priceRangeSnapshot !== null) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        // invert x
        this._scaleStartPoint = this._height - x;
        this._priceRangeSnapshot = ensureNotNull(this.priceRange()).clone();
    };
    PriceScale.prototype.scaleTo = function (x) {
        if (this.isPercentage() || this.isIndexedTo100()) {
            return;
        }
        if (this._scaleStartPoint === null) {
            return;
        }
        this.setMode({
            autoScale: false,
        });
        // invert x
        x = this._height - x;
        if (x < 0) {
            x = 0;
        }
        var scaleCoeff = (this._scaleStartPoint + (this._height - 1) * 0.2) / (x + (this._height - 1) * 0.2);
        var newPriceRange = ensureNotNull(this._priceRangeSnapshot).clone();
        scaleCoeff = Math.max(scaleCoeff, 0.1);
        newPriceRange.scaleAroundCenter(scaleCoeff);
        this.setPriceRange(newPriceRange);
    };
    PriceScale.prototype.endScale = function () {
        if (this.isPercentage() || this.isIndexedTo100()) {
            return;
        }
        this._scaleStartPoint = null;
        this._priceRangeSnapshot = null;
    };
    PriceScale.prototype.startScroll = function (x) {
        if (this.isAutoScale()) {
            return;
        }
        if (this._scrollStartPoint !== null || this._priceRangeSnapshot !== null) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        this._scrollStartPoint = x;
        this._priceRangeSnapshot = ensureNotNull(this.priceRange()).clone();
    };
    PriceScale.prototype.scrollTo = function (x) {
        if (this.isAutoScale()) {
            return;
        }
        if (this._scrollStartPoint === null) {
            return;
        }
        var priceUnitsPerPixel = ensureNotNull(this.priceRange()).length() / (this.internalHeight() - 1);
        var pixelDelta = x - this._scrollStartPoint;
        if (this.isInverted()) {
            pixelDelta *= -1;
        }
        var priceDelta = pixelDelta * priceUnitsPerPixel;
        var newPriceRange = ensureNotNull(this._priceRangeSnapshot).clone();
        newPriceRange.shift(priceDelta);
        this.setPriceRange(newPriceRange, true);
        this._marksCache = null;
    };
    PriceScale.prototype.endScroll = function () {
        if (this.isAutoScale()) {
            return;
        }
        if (this._scrollStartPoint === null) {
            return;
        }
        this._scrollStartPoint = null;
        this._priceRangeSnapshot = null;
    };
    PriceScale.prototype.formatter = function () {
        if (!this._formatter) {
            this.updateFormatter();
        }
        return this._formatter;
    };
    PriceScale.prototype.formatPrice = function (price, firstValue) {
        switch (this._options.mode) {
            case 2 /* Percentage */:
                return this.formatter().format(toPercent(price, firstValue));
            case 3 /* IndexedTo100 */:
                return this.formatter().format(toIndexedTo100(price, firstValue));
            default:
                return this._formatPrice(price);
        }
    };
    PriceScale.prototype.formatLogical = function (logical) {
        switch (this._options.mode) {
            case 2 /* Percentage */:
            case 3 /* IndexedTo100 */:
                return this.formatter().format(logical);
            default:
                return this._formatPrice(logical);
        }
    };
    PriceScale.prototype.formatPriceAbsolute = function (price) {
        return this._formatPrice(price, ensureNotNull(this._formatterSource()).formatter());
    };
    PriceScale.prototype.formatPricePercentage = function (price, baseValue) {
        price = toPercent(price, baseValue);
        return percentageFormatter.format(price);
    };
    PriceScale.prototype.sourcesForAutoScale = function () {
        return this._dataSources;
    };
    PriceScale.prototype.recalculatePriceRange = function (visibleBars) {
        this._invalidatedForRange = {
            visibleBars: visibleBars,
            isValid: false,
        };
    };
    PriceScale.prototype.updateAllViews = function () {
        this._dataSources.forEach(function (s) { return s.updateAllViews(); });
    };
    PriceScale.prototype.updateFormatter = function () {
        this._marksCache = null;
        var formatterSource = this._formatterSource();
        var base = 100;
        if (formatterSource !== null) {
            base = Math.round(1 / formatterSource.minMove());
        }
        this._formatter = defaultPriceFormatter;
        if (this.isPercentage()) {
            this._formatter = percentageFormatter;
            base = 100;
        }
        else if (this.isIndexedTo100()) {
            this._formatter = new PriceFormatter(100, 1);
            base = 100;
        }
        else {
            if (formatterSource !== null) {
                // user
                this._formatter = formatterSource.formatter();
            }
        }
        this._markBuilder = new PriceTickMarkBuilder(this, base, this._coordinateToLogical.bind(this), this._logicalToCoordinate.bind(this));
        this._markBuilder.rebuildTickMarks();
    };
    PriceScale.prototype.invalidateSourcesCache = function () {
        this._cachedOrderedSources = null;
    };
    /**
     * Returns the source which will be used as "formatter source" (take minMove for formatter)
     */
    PriceScale.prototype._formatterSource = function () {
        return this._dataSources[0] || null;
    };
    PriceScale.prototype._topMarginPx = function () {
        return this.isInverted()
            ? this._options.scaleMargins.bottom * this.height() + this._marginBelow
            : this._options.scaleMargins.top * this.height() + this._marginAbove;
    };
    PriceScale.prototype._bottomMarginPx = function () {
        return this.isInverted()
            ? this._options.scaleMargins.top * this.height() + this._marginAbove
            : this._options.scaleMargins.bottom * this.height() + this._marginBelow;
    };
    PriceScale.prototype._makeSureItIsValid = function () {
        if (!this._invalidatedForRange.isValid) {
            this._invalidatedForRange.isValid = true;
            this._recalculatePriceRangeImpl();
        }
    };
    PriceScale.prototype._invalidateInternalHeightCache = function () {
        this._internalHeightCache = null;
        this._internalHeightChanged.fire();
    };
    PriceScale.prototype._logicalToCoordinate = function (logical, baseValue) {
        this._makeSureItIsValid();
        if (this.isEmpty()) {
            return 0;
        }
        logical = this.isLog() && logical ? toLog(logical) : logical;
        var range = ensureNotNull(this.priceRange());
        var invCoordinate = this._bottomMarginPx() +
            (this.internalHeight() - 1) * (logical - range.minValue()) / range.length();
        var coordinate = this.invertedCoordinate(invCoordinate);
        return coordinate;
    };
    PriceScale.prototype._coordinateToLogical = function (coordinate, baseValue) {
        this._makeSureItIsValid();
        if (this.isEmpty()) {
            return 0;
        }
        var invCoordinate = this.invertedCoordinate(coordinate);
        var range = ensureNotNull(this.priceRange());
        var logical = range.minValue() + range.length() *
            ((invCoordinate - this._bottomMarginPx()) / (this.internalHeight() - 1));
        return this.isLog() ? fromLog(logical) : logical;
    };
    PriceScale.prototype._onIsInvertedChanged = function () {
        this._marksCache = null;
        this._markBuilder.rebuildTickMarks();
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceScale.prototype._recalculatePriceRangeImpl = function () {
        var visibleBars = this._invalidatedForRange.visibleBars;
        if (visibleBars === null) {
            return;
        }
        var priceRange = null;
        var sources = this.sourcesForAutoScale();
        var marginAbove = 0;
        var marginBelow = 0;
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            var firstValue = source.firstValue();
            if (firstValue === null) {
                continue;
            }
            var autoScaleInfo = source.autoscaleInfo(visibleBars.left(), visibleBars.right());
            var sourceRange = autoScaleInfo && autoScaleInfo.priceRange();
            if (sourceRange !== null) {
                switch (this._options.mode) {
                    case 1 /* Logarithmic */:
                        sourceRange = convertPriceRangeToLog(sourceRange);
                        break;
                    case 2 /* Percentage */:
                        sourceRange = toPercentRange(sourceRange, firstValue.value);
                        break;
                    case 3 /* IndexedTo100 */:
                        sourceRange = toIndexedTo100Range(sourceRange, firstValue.value);
                        break;
                }
                if (priceRange === null) {
                    priceRange = sourceRange;
                }
                else {
                    priceRange = priceRange.merge(ensureNotNull(sourceRange));
                }
                if (autoScaleInfo !== null) {
                    var margins = autoScaleInfo.margins();
                    if (margins !== null) {
                        marginAbove = Math.max(marginAbove, margins.above);
                        marginBelow = Math.max(marginAbove, margins.below);
                    }
                }
            }
        }
        if (marginAbove !== this._marginAbove || marginBelow !== this._marginBelow) {
            this._marginAbove = marginAbove;
            this._marginBelow = marginBelow;
            this._marksCache = null;
            this._invalidateInternalHeightCache();
        }
        if (priceRange !== null) {
            // keep current range is new is empty
            if (priceRange.minValue() === priceRange.maxValue()) {
                var formatterSource = this._formatterSource();
                var minMove = formatterSource === null || this.isPercentage() || this.isIndexedTo100() ? 1 : formatterSource.minMove();
                // if price range is degenerated to 1 point let's extend it by 10 min move values
                // to avoid incorrect range and empty (blank) scale (in case of min tick much greater than 1)
                var extendValue = 5 * minMove;
                priceRange = new PriceRangeImpl(priceRange.minValue() - extendValue, priceRange.maxValue() + extendValue);
            }
            this.setPriceRange(priceRange);
        }
        else {
            // reset empty to default
            if (this._priceRange === null) {
                this.setPriceRange(new PriceRangeImpl(-0.5, 0.5));
            }
        }
        this._invalidatedForRange.isValid = true;
    };
    PriceScale.prototype._getCoordinateTransformer = function () {
        if (this.isPercentage()) {
            return toPercent;
        }
        else if (this.isIndexedTo100()) {
            return toIndexedTo100;
        }
        else if (this.isLog()) {
            return toLog;
        }
        return null;
    };
    PriceScale.prototype._formatPrice = function (price, fallbackFormatter) {
        if (this._localizationOptions.priceFormatter === undefined) {
            if (fallbackFormatter === undefined) {
                fallbackFormatter = this.formatter();
            }
            return fallbackFormatter.format(price);
        }
        return this._localizationOptions.priceFormatter(price);
    };
    return PriceScale;
}());
export { PriceScale };
