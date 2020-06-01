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
        this._private__height = 0;
        this._private__internalHeightCache = null;
        this._private__internalHeightChanged = new Delegate();
        this._private__priceRange = null;
        this._private__priceRangeSnapshot = null;
        this._private__priceRangeChanged = new Delegate();
        this._private__invalidatedForRange = { _internal_isValid: false, _internal_visibleBars: null };
        this._private__marginAbove = 0;
        this._private__marginBelow = 0;
        this._private__onMarksChanged = new Delegate();
        this._private__modeChanged = new Delegate();
        this._private__dataSources = [];
        this._private__cachedOrderedSources = null;
        this._private__marksCache = null;
        this._private__scaleStartPoint = null;
        this._private__scrollStartPoint = null;
        this._private__formatter = defaultPriceFormatter;
        this._private__optionsChanged = new Delegate();
        this._private__id = id;
        this._private__options = options;
        this._private__layoutOptions = layoutOptions;
        this._private__localizationOptions = localizationOptions;
        this._private__markBuilder = new PriceTickMarkBuilder(this, 100, this._private__coordinateToLogical.bind(this), this._private__logicalToCoordinate.bind(this));
    }
    PriceScale.prototype._internal_id = function () {
        return this._private__id;
    };
    PriceScale.prototype._internal_options = function () {
        return this._private__options;
    };
    PriceScale.prototype._internal_applyOptions = function (options) {
        merge(this._private__options, options);
        this._internal_updateFormatter();
        if (options.mode !== undefined) {
            this._internal_setMode({ _internal_mode: options.mode });
        }
        this._private__optionsChanged._internal_fire();
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
            this._private__invalidateInternalHeightCache();
            this._private__marksCache = null;
        }
    };
    PriceScale.prototype._internal_optionsChanged = function () {
        return this._private__optionsChanged;
    };
    PriceScale.prototype._internal_isAutoScale = function () {
        return this._private__options.autoScale;
    };
    PriceScale.prototype._internal_isLog = function () {
        return this._private__options.mode === 1 /* Logarithmic */;
    };
    PriceScale.prototype._internal_isPercentage = function () {
        return this._private__options.mode === 2 /* Percentage */;
    };
    PriceScale.prototype._internal_isIndexedTo100 = function () {
        return this._private__options.mode === 3 /* IndexedTo100 */;
    };
    PriceScale.prototype._internal_mode = function () {
        return {
            _internal_autoScale: this._private__options.autoScale,
            _internal_isInverted: this._private__options.invertScale,
            _internal_mode: this._private__options.mode,
        };
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceScale.prototype._internal_setMode = function (newMode) {
        var oldMode = this._internal_mode();
        var priceRange = null;
        if (newMode._internal_autoScale !== undefined) {
            this._private__options.autoScale = newMode._internal_autoScale;
        }
        if (newMode._internal_mode !== undefined) {
            this._private__options.mode = newMode._internal_mode;
            if (newMode._internal_mode === 2 /* Percentage */ || newMode._internal_mode === 3 /* IndexedTo100 */) {
                this._private__options.autoScale = true;
            }
            // TODO: Remove after making rebuildTickMarks lazy
            this._private__invalidatedForRange._internal_isValid = false;
        }
        // define which scale converted from
        if (oldMode._internal_mode === 1 /* Logarithmic */ && newMode._internal_mode !== oldMode._internal_mode) {
            if (canConvertPriceRangeFromLog(this._private__priceRange)) {
                priceRange = convertPriceRangeFromLog(this._private__priceRange);
                if (priceRange !== null) {
                    this._internal_setPriceRange(priceRange);
                }
            }
            else {
                this._private__options.autoScale = true;
            }
        }
        // define which scale converted to
        if (newMode._internal_mode === 1 /* Logarithmic */ && newMode._internal_mode !== oldMode._internal_mode) {
            priceRange = convertPriceRangeToLog(this._private__priceRange);
            if (priceRange !== null) {
                this._internal_setPriceRange(priceRange);
            }
        }
        var modeChanged = oldMode._internal_mode !== this._private__options.mode;
        if (modeChanged && (oldMode._internal_mode === 2 /* Percentage */ || this._internal_isPercentage())) {
            this._internal_updateFormatter();
        }
        if (modeChanged && (oldMode._internal_mode === 3 /* IndexedTo100 */ || this._internal_isIndexedTo100())) {
            this._internal_updateFormatter();
        }
        if (newMode._internal_isInverted !== undefined && oldMode._internal_isInverted !== newMode._internal_isInverted) {
            this._private__options.invertScale = newMode._internal_isInverted;
            this._private__onIsInvertedChanged();
        }
        this._private__modeChanged._internal_fire(oldMode, this._internal_mode());
    };
    PriceScale.prototype._internal_modeChanged = function () {
        return this._private__modeChanged;
    };
    PriceScale.prototype._internal_fontSize = function () {
        return this._private__layoutOptions.fontSize;
    };
    PriceScale.prototype._internal_height = function () {
        return this._private__height;
    };
    PriceScale.prototype._internal_setHeight = function (value) {
        if (this._private__height === value) {
            return;
        }
        this._private__height = value;
        this._private__invalidateInternalHeightCache();
        this._private__marksCache = null;
    };
    PriceScale.prototype._internal_internalHeight = function () {
        if (this._private__internalHeightCache) {
            return this._private__internalHeightCache;
        }
        var res = this._internal_height() - this._private__topMarginPx() - this._private__bottomMarginPx();
        this._private__internalHeightCache = res;
        return res;
    };
    PriceScale.prototype._internal_internalHeightChanged = function () {
        return this._private__internalHeightChanged;
    };
    PriceScale.prototype._internal_priceRange = function () {
        this._private__makeSureItIsValid();
        return this._private__priceRange;
    };
    PriceScale.prototype._internal_priceRangeChanged = function () {
        return this._private__priceRangeChanged;
    };
    PriceScale.prototype._internal_setPriceRange = function (newPriceRange, isForceSetValue, onlyPriceScaleUpdate) {
        var oldPriceRange = this._private__priceRange;
        if (!isForceSetValue &&
            !(oldPriceRange === null && newPriceRange !== null) &&
            (oldPriceRange === null || oldPriceRange._internal_equals(newPriceRange))) {
            return;
        }
        this._private__marksCache = null;
        this._private__priceRange = newPriceRange;
        if (!onlyPriceScaleUpdate) {
            this._private__priceRangeChanged._internal_fire(oldPriceRange, newPriceRange);
        }
    };
    PriceScale.prototype._internal_isEmpty = function () {
        this._private__makeSureItIsValid();
        return this._private__height === 0 || !this._private__priceRange || this._private__priceRange._internal_isEmpty();
    };
    PriceScale.prototype._internal_invertedCoordinate = function (coordinate) {
        return this._internal_isInverted() ? coordinate : this._internal_height() - 1 - coordinate;
    };
    PriceScale.prototype._internal_priceToCoordinate = function (price, baseValue) {
        if (this._internal_isPercentage()) {
            price = toPercent(price, baseValue);
        }
        else if (this._internal_isIndexedTo100()) {
            price = toIndexedTo100(price, baseValue);
        }
        return this._private__logicalToCoordinate(price, baseValue);
    };
    PriceScale.prototype._internal_pointsArrayToCoordinates = function (points, baseValue, visibleRange) {
        this._private__makeSureItIsValid();
        var bh = this._private__bottomMarginPx();
        var range = ensureNotNull(this._internal_priceRange());
        var min = range._internal_minValue();
        var max = range._internal_maxValue();
        var ih = (this._internal_internalHeight() - 1);
        var isInverted = this._internal_isInverted();
        var hmm = ih / (max - min);
        var fromIndex = (visibleRange === undefined) ? 0 : visibleRange.from;
        var toIndex = (visibleRange === undefined) ? points.length : visibleRange.to;
        var transformFn = this._private__getCoordinateTransformer();
        for (var i = fromIndex; i < toIndex; i++) {
            var point = points[i];
            var price = point._internal_price;
            if (isNaN(price)) {
                continue;
            }
            var logical = price;
            if (transformFn !== null) {
                logical = transformFn(point._internal_price, baseValue);
            }
            var invCoordinate = bh + hmm * (logical - min);
            var coordinate = isInverted ? invCoordinate : this._private__height - 1 - invCoordinate;
            point._internal_y = coordinate;
        }
    };
    PriceScale.prototype._internal_barPricesToCoordinates = function (pricesList, baseValue, visibleRange) {
        this._private__makeSureItIsValid();
        var bh = this._private__bottomMarginPx();
        var range = ensureNotNull(this._internal_priceRange());
        var min = range._internal_minValue();
        var max = range._internal_maxValue();
        var ih = (this._internal_internalHeight() - 1);
        var isInverted = this._internal_isInverted();
        var hmm = ih / (max - min);
        var fromIndex = (visibleRange === undefined) ? 0 : visibleRange.from;
        var toIndex = (visibleRange === undefined) ? pricesList.length : visibleRange.to;
        var transformFn = this._private__getCoordinateTransformer();
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
            var coordinate = isInverted ? invCoordinate : this._private__height - 1 - invCoordinate;
            bar._internal_openY = coordinate;
            invCoordinate = bh + hmm * (highLogical - min);
            coordinate = isInverted ? invCoordinate : this._private__height - 1 - invCoordinate;
            bar._internal_highY = coordinate;
            invCoordinate = bh + hmm * (lowLogical - min);
            coordinate = isInverted ? invCoordinate : this._private__height - 1 - invCoordinate;
            bar._internal_lowY = coordinate;
            invCoordinate = bh + hmm * (closeLogical - min);
            coordinate = isInverted ? invCoordinate : this._private__height - 1 - invCoordinate;
            bar._internal_closeY = coordinate;
        }
    };
    PriceScale.prototype._internal_coordinateToPrice = function (coordinate, baseValue) {
        var logical = this._private__coordinateToLogical(coordinate, baseValue);
        return this._internal_logicalToPrice(logical, baseValue);
    };
    PriceScale.prototype._internal_logicalToPrice = function (logical, baseValue) {
        var value = logical;
        if (this._internal_isPercentage()) {
            value = fromPercent(value, baseValue);
        }
        else if (this._internal_isIndexedTo100()) {
            value = fromIndexedTo100(value, baseValue);
        }
        return value;
    };
    PriceScale.prototype._internal_dataSources = function () {
        return this._private__dataSources;
    };
    PriceScale.prototype._internal_orderedSources = function () {
        if (this._private__cachedOrderedSources) {
            return this._private__cachedOrderedSources;
        }
        var sources = [];
        for (var i = 0; i < this._private__dataSources.length; i++) {
            var ds = this._private__dataSources[i];
            if (ds._internal_zorder() === null) {
                ds._internal_setZorder(i + 1);
            }
            sources.push(ds);
        }
        sources = sortSources(sources);
        this._private__cachedOrderedSources = sources;
        return this._private__cachedOrderedSources;
    };
    PriceScale.prototype._internal_addDataSource = function (source) {
        if (this._private__dataSources.indexOf(source) !== -1) {
            return;
        }
        this._private__dataSources.push(source);
        this._internal_updateFormatter();
        this._internal_invalidateSourcesCache();
    };
    PriceScale.prototype._internal_removeDataSource = function (source) {
        var index = this._private__dataSources.indexOf(source);
        if (index === -1) {
            throw new Error('source is not attached to scale');
        }
        this._private__dataSources.splice(index, 1);
        if (this._internal_isEmpty()) {
            this._internal_setMode({
                _internal_autoScale: true,
            });
        }
        this._internal_updateFormatter();
        this._internal_invalidateSourcesCache();
    };
    PriceScale.prototype._internal_firstValue = function () {
        // TODO: cache the result
        var result = null;
        for (var _i = 0, _a = this._private__dataSources; _i < _a.length; _i++) {
            var source = _a[_i];
            var firstValue = source._internal_firstValue();
            if (firstValue === null) {
                continue;
            }
            if (result === null || firstValue._internal_timePoint < result._internal_timePoint) {
                result = firstValue;
            }
        }
        return result === null ? null : result._internal_value;
    };
    PriceScale.prototype._internal_isInverted = function () {
        return this._private__options.invertScale;
    };
    PriceScale.prototype._internal_marks = function () {
        if (this._private__marksCache) {
            return this._private__marksCache;
        }
        this._private__markBuilder._internal_rebuildTickMarks();
        this._private__marksCache = this._private__markBuilder._internal_marks();
        this._private__onMarksChanged._internal_fire();
        return this._private__marksCache;
    };
    PriceScale.prototype._internal_onMarksChanged = function () {
        return this._private__onMarksChanged;
    };
    PriceScale.prototype._internal_startScale = function (x) {
        if (this._internal_isPercentage() || this._internal_isIndexedTo100()) {
            return;
        }
        if (this._private__scaleStartPoint !== null || this._private__priceRangeSnapshot !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        // invert x
        this._private__scaleStartPoint = this._private__height - x;
        this._private__priceRangeSnapshot = ensureNotNull(this._internal_priceRange())._internal_clone();
    };
    PriceScale.prototype._internal_scaleTo = function (x) {
        if (this._internal_isPercentage() || this._internal_isIndexedTo100()) {
            return;
        }
        if (this._private__scaleStartPoint === null) {
            return;
        }
        this._internal_setMode({
            _internal_autoScale: false,
        });
        // invert x
        x = this._private__height - x;
        if (x < 0) {
            x = 0;
        }
        var scaleCoeff = (this._private__scaleStartPoint + (this._private__height - 1) * 0.2) / (x + (this._private__height - 1) * 0.2);
        var newPriceRange = ensureNotNull(this._private__priceRangeSnapshot)._internal_clone();
        scaleCoeff = Math.max(scaleCoeff, 0.1);
        newPriceRange._internal_scaleAroundCenter(scaleCoeff);
        this._internal_setPriceRange(newPriceRange);
    };
    PriceScale.prototype._internal_endScale = function () {
        if (this._internal_isPercentage() || this._internal_isIndexedTo100()) {
            return;
        }
        this._private__scaleStartPoint = null;
        this._private__priceRangeSnapshot = null;
    };
    PriceScale.prototype._internal_startScroll = function (x) {
        if (this._internal_isAutoScale()) {
            return;
        }
        if (this._private__scrollStartPoint !== null || this._private__priceRangeSnapshot !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        this._private__scrollStartPoint = x;
        this._private__priceRangeSnapshot = ensureNotNull(this._internal_priceRange())._internal_clone();
    };
    PriceScale.prototype._internal_scrollTo = function (x) {
        if (this._internal_isAutoScale()) {
            return;
        }
        if (this._private__scrollStartPoint === null) {
            return;
        }
        var priceUnitsPerPixel = ensureNotNull(this._internal_priceRange())._internal_length() / (this._internal_internalHeight() - 1);
        var pixelDelta = x - this._private__scrollStartPoint;
        if (this._internal_isInverted()) {
            pixelDelta *= -1;
        }
        var priceDelta = pixelDelta * priceUnitsPerPixel;
        var newPriceRange = ensureNotNull(this._private__priceRangeSnapshot)._internal_clone();
        newPriceRange._internal_shift(priceDelta);
        this._internal_setPriceRange(newPriceRange, true);
        this._private__marksCache = null;
    };
    PriceScale.prototype._internal_endScroll = function () {
        if (this._internal_isAutoScale()) {
            return;
        }
        if (this._private__scrollStartPoint === null) {
            return;
        }
        this._private__scrollStartPoint = null;
        this._private__priceRangeSnapshot = null;
    };
    PriceScale.prototype._internal_formatter = function () {
        if (!this._private__formatter) {
            this._internal_updateFormatter();
        }
        return this._private__formatter;
    };
    PriceScale.prototype._internal_formatPrice = function (price, firstValue) {
        switch (this._private__options.mode) {
            case 2 /* Percentage */:
                return this._internal_formatter()._internal_format(toPercent(price, firstValue));
            case 3 /* IndexedTo100 */:
                return this._internal_formatter()._internal_format(toIndexedTo100(price, firstValue));
            default:
                return this._private__formatPrice(price);
        }
    };
    PriceScale.prototype._internal_formatLogical = function (logical) {
        switch (this._private__options.mode) {
            case 2 /* Percentage */:
            case 3 /* IndexedTo100 */:
                return this._internal_formatter()._internal_format(logical);
            default:
                return this._private__formatPrice(logical);
        }
    };
    PriceScale.prototype._internal_formatPriceAbsolute = function (price) {
        return this._private__formatPrice(price, ensureNotNull(this._private__formatterSource())._internal_formatter());
    };
    PriceScale.prototype._internal_formatPricePercentage = function (price, baseValue) {
        price = toPercent(price, baseValue);
        return percentageFormatter._internal_format(price);
    };
    PriceScale.prototype._internal_sourcesForAutoScale = function () {
        return this._private__dataSources;
    };
    PriceScale.prototype._internal_recalculatePriceRange = function (visibleBars) {
        this._private__invalidatedForRange = {
            _internal_visibleBars: visibleBars,
            _internal_isValid: false,
        };
    };
    PriceScale.prototype._internal_updateAllViews = function () {
        this._private__dataSources.forEach(function (s) { return s._internal_updateAllViews(); });
    };
    PriceScale.prototype._internal_updateFormatter = function () {
        this._private__marksCache = null;
        var formatterSource = this._private__formatterSource();
        var base = 100;
        if (formatterSource !== null) {
            base = Math.round(1 / formatterSource._internal_minMove());
        }
        this._private__formatter = defaultPriceFormatter;
        if (this._internal_isPercentage()) {
            this._private__formatter = percentageFormatter;
            base = 100;
        }
        else if (this._internal_isIndexedTo100()) {
            this._private__formatter = new PriceFormatter(100, 1);
            base = 100;
        }
        else {
            if (formatterSource !== null) {
                // user
                this._private__formatter = formatterSource._internal_formatter();
            }
        }
        this._private__markBuilder = new PriceTickMarkBuilder(this, base, this._private__coordinateToLogical.bind(this), this._private__logicalToCoordinate.bind(this));
        this._private__markBuilder._internal_rebuildTickMarks();
    };
    PriceScale.prototype._internal_invalidateSourcesCache = function () {
        this._private__cachedOrderedSources = null;
    };
    /**
     * Returns the source which will be used as "formatter source" (take minMove for formatter)
     */
    PriceScale.prototype._private__formatterSource = function () {
        return this._private__dataSources[0] || null;
    };
    PriceScale.prototype._private__topMarginPx = function () {
        return this._internal_isInverted()
            ? this._private__options.scaleMargins.bottom * this._internal_height() + this._private__marginBelow
            : this._private__options.scaleMargins.top * this._internal_height() + this._private__marginAbove;
    };
    PriceScale.prototype._private__bottomMarginPx = function () {
        return this._internal_isInverted()
            ? this._private__options.scaleMargins.top * this._internal_height() + this._private__marginAbove
            : this._private__options.scaleMargins.bottom * this._internal_height() + this._private__marginBelow;
    };
    PriceScale.prototype._private__makeSureItIsValid = function () {
        if (!this._private__invalidatedForRange._internal_isValid) {
            this._private__invalidatedForRange._internal_isValid = true;
            this._private__recalculatePriceRangeImpl();
        }
    };
    PriceScale.prototype._private__invalidateInternalHeightCache = function () {
        this._private__internalHeightCache = null;
        this._private__internalHeightChanged._internal_fire();
    };
    PriceScale.prototype._private__logicalToCoordinate = function (logical, baseValue) {
        this._private__makeSureItIsValid();
        if (this._internal_isEmpty()) {
            return 0;
        }
        logical = this._internal_isLog() && logical ? toLog(logical) : logical;
        var range = ensureNotNull(this._internal_priceRange());
        var invCoordinate = this._private__bottomMarginPx() +
            (this._internal_internalHeight() - 1) * (logical - range._internal_minValue()) / range._internal_length();
        var coordinate = this._internal_invertedCoordinate(invCoordinate);
        return coordinate;
    };
    PriceScale.prototype._private__coordinateToLogical = function (coordinate, baseValue) {
        this._private__makeSureItIsValid();
        if (this._internal_isEmpty()) {
            return 0;
        }
        var invCoordinate = this._internal_invertedCoordinate(coordinate);
        var range = ensureNotNull(this._internal_priceRange());
        var logical = range._internal_minValue() + range._internal_length() *
            ((invCoordinate - this._private__bottomMarginPx()) / (this._internal_internalHeight() - 1));
        return this._internal_isLog() ? fromLog(logical) : logical;
    };
    PriceScale.prototype._private__onIsInvertedChanged = function () {
        this._private__marksCache = null;
        this._private__markBuilder._internal_rebuildTickMarks();
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceScale.prototype._private__recalculatePriceRangeImpl = function () {
        var visibleBars = this._private__invalidatedForRange._internal_visibleBars;
        if (visibleBars === null) {
            return;
        }
        var priceRange = null;
        var sources = this._internal_sourcesForAutoScale();
        var marginAbove = 0;
        var marginBelow = 0;
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            var firstValue = source._internal_firstValue();
            if (firstValue === null) {
                continue;
            }
            var autoScaleInfo = source._internal_autoscaleInfo(visibleBars._internal_left(), visibleBars._internal_right());
            var sourceRange = autoScaleInfo && autoScaleInfo._internal_priceRange();
            if (sourceRange !== null) {
                switch (this._private__options.mode) {
                    case 1 /* Logarithmic */:
                        sourceRange = convertPriceRangeToLog(sourceRange);
                        break;
                    case 2 /* Percentage */:
                        sourceRange = toPercentRange(sourceRange, firstValue._internal_value);
                        break;
                    case 3 /* IndexedTo100 */:
                        sourceRange = toIndexedTo100Range(sourceRange, firstValue._internal_value);
                        break;
                }
                if (priceRange === null) {
                    priceRange = sourceRange;
                }
                else {
                    priceRange = priceRange._internal_merge(ensureNotNull(sourceRange));
                }
                if (autoScaleInfo !== null) {
                    var margins = autoScaleInfo._internal_margins();
                    if (margins !== null) {
                        marginAbove = Math.max(marginAbove, margins.above);
                        marginBelow = Math.max(marginAbove, margins.below);
                    }
                }
            }
        }
        if (marginAbove !== this._private__marginAbove || marginBelow !== this._private__marginBelow) {
            this._private__marginAbove = marginAbove;
            this._private__marginBelow = marginBelow;
            this._private__marksCache = null;
            this._private__invalidateInternalHeightCache();
        }
        if (priceRange !== null) {
            // keep current range is new is empty
            if (priceRange._internal_minValue() === priceRange._internal_maxValue()) {
                var formatterSource = this._private__formatterSource();
                var minMove = formatterSource === null || this._internal_isPercentage() || this._internal_isIndexedTo100() ? 1 : formatterSource._internal_minMove();
                // if price range is degenerated to 1 point let's extend it by 10 min move values
                // to avoid incorrect range and empty (blank) scale (in case of min tick much greater than 1)
                var extendValue = 5 * minMove;
                priceRange = new PriceRangeImpl(priceRange._internal_minValue() - extendValue, priceRange._internal_maxValue() + extendValue);
            }
            this._internal_setPriceRange(priceRange);
        }
        else {
            // reset empty to default
            if (this._private__priceRange === null) {
                this._internal_setPriceRange(new PriceRangeImpl(-0.5, 0.5));
            }
        }
        this._private__invalidatedForRange._internal_isValid = true;
    };
    PriceScale.prototype._private__getCoordinateTransformer = function () {
        if (this._internal_isPercentage()) {
            return toPercent;
        }
        else if (this._internal_isIndexedTo100()) {
            return toIndexedTo100;
        }
        else if (this._internal_isLog()) {
            return toLog;
        }
        return null;
    };
    PriceScale.prototype._private__formatPrice = function (price, fallbackFormatter) {
        if (this._private__localizationOptions.priceFormatter === undefined) {
            if (fallbackFormatter === undefined) {
                fallbackFormatter = this._internal_formatter();
            }
            return fallbackFormatter._internal_format(price);
        }
        return this._private__localizationOptions.priceFormatter(price);
    };
    return PriceScale;
}());
export { PriceScale };
