import { DateFormatter } from '../formatters/date-formatter';
import { DateTimeFormatter } from '../formatters/date-time-formatter';
import { ensureNotNull } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clamp } from '../helpers/mathex';
import { isInteger, merge } from '../helpers/strict-type-checks';
import { FormattedLabelsCache } from './formatted-labels-cache';
import { areRangesEqual, RangeImpl } from './range-impl';
import { TickMarks } from './tick-marks';
import { TimePoints } from './time-points';
import { TimeScaleVisibleRange } from './time-scale-visible-range';
;
;
export var TickMarkType;
(function (TickMarkType) {
    TickMarkType[TickMarkType["Year"] = 0] = "Year";
    TickMarkType[TickMarkType["Month"] = 1] = "Month";
    TickMarkType[TickMarkType["DayOfMonth"] = 2] = "DayOfMonth";
    TickMarkType[TickMarkType["Time"] = 3] = "Time";
    TickMarkType[TickMarkType["TimeWithSeconds"] = 4] = "TimeWithSeconds";
})(TickMarkType || (TickMarkType = {}));
var TimeScale = /** @class */ (function () {
    function TimeScale(model, options, localizationOptions) {
        this._private__width = 0;
        this._private__baseIndexOrNull = null;
        this._private__points = new TimePoints();
        this._private__scrollStartPoint = null;
        this._private__scaleStartPoint = null;
        this._private__tickMarks = new TickMarks();
        this._private__formattedBySpan = new Map();
        this._private__visibleRange = TimeScaleVisibleRange._internal_invalid();
        this._private__visibleRangeInvalidated = true;
        this._private__visibleBarsChanged = new Delegate();
        this._private__logicalRangeChanged = new Delegate();
        this._private__optionsApplied = new Delegate();
        this._private__leftEdgeIndex = null;
        this._private__commonTransitionStartState = null;
        this._private__timeMarksCache = null;
        this._private__labels = [];
        this._private__options = options;
        this._private__localizationOptions = localizationOptions;
        this._private__rightOffset = options.rightOffset;
        this._private__barSpacing = options.barSpacing;
        this._private__model = model;
        this._private__updateDateTimeFormatter();
    }
    TimeScale.prototype._internal_options = function () {
        return this._private__options;
    };
    TimeScale.prototype._internal_applyLocalizationOptions = function (localizationOptions) {
        merge(this._private__localizationOptions, localizationOptions);
        this._private__invalidateTickMarks();
        this._private__updateDateTimeFormatter();
    };
    TimeScale.prototype._internal_applyOptions = function (options, localizationOptions) {
        merge(this._private__options, options);
        if (this._private__options.fixLeftEdge) {
            this._private__fixLeftEdge();
        }
        else {
            this._private__leftEdgeIndex = null;
        }
        // note that bar spacing should be applied before right offset
        // because right offset depends on bar spacing
        if (options.barSpacing !== undefined) {
            this._internal_setBarSpacing(options.barSpacing);
        }
        if (options.rightOffset !== undefined) {
            this._internal_setRightOffset(options.rightOffset);
        }
        this._private__invalidateTickMarks();
        this._private__updateDateTimeFormatter();
        this._private__optionsApplied._internal_fire();
    };
    TimeScale.prototype._internal_isEmpty = function () {
        return this._private__width === 0 || this._private__points._internal_size() === 0;
    };
    // strict range: integer indices of the bars in the visible range rounded in more wide direction
    TimeScale.prototype._internal_visibleStrictRange = function () {
        this._private__updateVisibleRange();
        return this._private__visibleRange._internal_strictRange();
    };
    TimeScale.prototype._internal_visibleLogicalRange = function () {
        this._private__updateVisibleRange();
        return this._private__visibleRange._internal_logicalRange();
    };
    TimeScale.prototype._internal_visibleTimeRange = function () {
        var visibleBars = this._internal_visibleStrictRange();
        if (visibleBars === null) {
            return null;
        }
        var range = {
            from: visibleBars._internal_left(),
            to: visibleBars._internal_right(),
        };
        return this._internal_timeRangeForLogicalRange(range);
    };
    TimeScale.prototype._internal_timeRangeForLogicalRange = function (range) {
        var from = Math.round(range.from);
        var to = Math.round(range.to);
        var points = this._private__model._internal_timeScale()._internal_points();
        var firstIndex = ensureNotNull(points._internal_firstIndex());
        var lastIndex = ensureNotNull(points._internal_lastIndex());
        return {
            from: ensureNotNull(points._internal_valueAt(Math.max(firstIndex, from))),
            to: ensureNotNull(points._internal_valueAt(Math.min(lastIndex, to))),
        };
    };
    TimeScale.prototype._internal_logicalRangeForTimeRange = function (range) {
        var points = this._private__model._internal_timeScale()._internal_points();
        return {
            from: ensureNotNull(points._internal_indexOf(range.from.timestamp, true)),
            to: ensureNotNull(points._internal_indexOf(range.to.timestamp, true)),
        };
    };
    TimeScale.prototype._internal_tickMarks = function () {
        return this._private__tickMarks;
    };
    TimeScale.prototype._internal_points = function () {
        return this._private__points;
    };
    TimeScale.prototype._internal_width = function () {
        return this._private__width;
    };
    TimeScale.prototype._internal_setWidth = function (width) {
        if (!isFinite(width) || width <= 0) {
            return;
        }
        if (this._private__width === width) {
            return;
        }
        if (this._private__options.lockVisibleTimeRangeOnResize && this._private__width) {
            // recalculate bar spacing
            var newBarSpacing = this._private__barSpacing * width / this._private__width;
            this._private__setBarSpacing(newBarSpacing);
        }
        // if time scale is scrolled to the end of data and we have fixed right edge
        // keep left edge instead of right
        // we need it to avoid "shaking" if the last bar visibility affects time scale width
        if (this._private__leftEdgeIndex !== null) {
            var firstVisibleBar = ensureNotNull(this._internal_visibleStrictRange())._internal_left();
            // firstVisibleBar could be less than this._leftEdgeIndex
            // since index is a center of bar
            if (firstVisibleBar <= this._private__leftEdgeIndex) {
                var delta = this._private__width - width;
                // reduce  _rightOffset means move right
                // we could move more than required - this will be fixed by _correctOffset()
                this._private__rightOffset -= Math.round(delta / this._private__barSpacing) + 1;
            }
        }
        this._private__width = width;
        this._private__visibleRangeInvalidated = true;
        // updating bar spacing should be first because right offset depends on it
        this._private__correctBarSpacing();
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_indexToCoordinate = function (index) {
        if (this._internal_isEmpty() || !isInteger(index)) {
            return 0;
        }
        var baseIndex = this._internal_baseIndex();
        var deltaFromRight = baseIndex + this._private__rightOffset - index;
        var coordinate = this._private__width - (deltaFromRight + 0.5) * this._private__barSpacing;
        return coordinate;
    };
    TimeScale.prototype._internal_indexesToCoordinates = function (points, visibleRange) {
        var baseIndex = this._internal_baseIndex();
        var indexFrom = (visibleRange === undefined) ? 0 : visibleRange.from;
        var indexTo = (visibleRange === undefined) ? points.length : visibleRange.to;
        for (var i = indexFrom; i < indexTo; i++) {
            var index = points[i]._internal_time;
            var deltaFromRight = baseIndex + this._private__rightOffset - index;
            var coordinate = this._private__width - (deltaFromRight + 0.5) * this._private__barSpacing;
            points[i]._internal_x = coordinate;
        }
    };
    TimeScale.prototype._internal_indexToUserTime = function (index) {
        return this._private__tickMarks._internal_indexToTime(index);
    };
    TimeScale.prototype._internal_coordinateToIndex = function (x) {
        return Math.ceil(this._private__coordinateToFloatIndex(x));
    };
    TimeScale.prototype._internal_setRightOffset = function (offset) {
        this._private__visibleRangeInvalidated = true;
        this._private__rightOffset = offset;
        this._private__correctOffset();
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_barSpacing = function () {
        return this._private__barSpacing;
    };
    TimeScale.prototype._internal_setBarSpacing = function (newBarSpacing) {
        this._private__setBarSpacing(newBarSpacing);
        // do not allow scroll out of visible bars
        this._private__correctOffset();
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_rightOffset = function () {
        return this._private__rightOffset;
    };
    TimeScale.prototype._internal_marks = function () {
        if (this._internal_isEmpty()) {
            return null;
        }
        if (this._private__timeMarksCache !== null) {
            return this._private__timeMarksCache;
        }
        var spacing = this._private__barSpacing;
        var fontSize = this._private__model._internal_options().layout.fontSize;
        var maxLabelWidth = (fontSize + 4) * 5;
        var indexPerLabel = Math.round(maxLabelWidth / spacing);
        var visibleBars = ensureNotNull(this._internal_visibleStrictRange());
        var firstBar = Math.max(visibleBars._internal_left(), visibleBars._internal_left() - indexPerLabel);
        var lastBar = Math.max(visibleBars._internal_right(), visibleBars._internal_right() - indexPerLabel);
        var items = this._private__tickMarks._internal_build(spacing, maxLabelWidth);
        var targetIndex = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var tm = items_1[_i];
            if (!(firstBar <= tm._internal_index && tm._internal_index <= lastBar)) {
                continue;
            }
            var time = this._private__tickMarks._internal_indexToTime(tm._internal_index);
            if (time === null) {
                continue;
            }
            if (targetIndex < this._private__labels.length) {
                var label = this._private__labels[targetIndex];
                label._internal_coord = this._internal_indexToCoordinate(tm._internal_index);
                label._internal_label = this._private__formatLabel(time, tm._internal_span);
                label._internal_span = tm._internal_span;
                label._internal_major = false;
            }
            else {
                this._private__labels.push({
                    _internal_coord: this._internal_indexToCoordinate(tm._internal_index),
                    _internal_label: this._private__formatLabel(time, tm._internal_span),
                    _internal_span: tm._internal_span,
                    _internal_major: false,
                });
            }
            targetIndex++;
        }
        this._private__labels.length = targetIndex;
        this._private__timeMarksCache = this._private__labels;
        return this._private__labels;
    };
    TimeScale.prototype._internal_reset = function () {
        this._private__visibleRangeInvalidated = true;
        this._private__points = new TimePoints();
        this._private__scrollStartPoint = null;
        this._private__scaleStartPoint = null;
        this._private__clearCommonTransitionsStartState();
        this._private__tickMarks._internal_reset();
        this._private__leftEdgeIndex = null;
    };
    TimeScale.prototype._internal_restoreDefault = function () {
        this._private__visibleRangeInvalidated = true;
        this._internal_setBarSpacing(this._private__options.barSpacing);
        this._internal_setRightOffset(this._private__options.rightOffset);
    };
    TimeScale.prototype._internal_fixLeftEdge = function () {
        return this._private__options.fixLeftEdge;
    };
    TimeScale.prototype._internal_setBaseIndex = function (baseIndex) {
        this._private__visibleRangeInvalidated = true;
        this._private__baseIndexOrNull = baseIndex;
        this._private__correctOffset();
        this._private__fixLeftEdge();
    };
    /**
     * Zoom in/out the scale around a `zoomPoint` on `scale` value.
     * @param zoomPoint - X coordinate of the point to apply the zoom.
     *   If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
     * @param scale - Zoom value (in 1/10 parts of current bar spacing).
     *   Negative value means zoom out, positive - zoom in.
     */
    TimeScale.prototype._internal_zoom = function (zoomPoint, scale) {
        var floatIndexAtZoomPoint = this._private__coordinateToFloatIndex(zoomPoint);
        var barSpacing = this._internal_barSpacing();
        var newBarSpacing = barSpacing + scale * (barSpacing / 10);
        // zoom in/out bar spacing
        this._internal_setBarSpacing(newBarSpacing);
        if (!this._private__options.rightBarStaysOnScroll) {
            // and then correct right offset to move index under zoomPoint back to its coordinate
            this._internal_setRightOffset(this._internal_rightOffset() + (floatIndexAtZoomPoint - this._private__coordinateToFloatIndex(zoomPoint)));
        }
    };
    TimeScale.prototype._internal_startScale = function (x) {
        if (this._private__scrollStartPoint) {
            this._internal_endScroll();
        }
        if (this._private__scaleStartPoint !== null || this._private__commonTransitionStartState !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        this._private__scaleStartPoint = x;
        this._private__saveCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scaleTo = function (x) {
        if (this._private__commonTransitionStartState === null) {
            return;
        }
        var startLengthFromRight = clamp(this._private__width - x, 0, this._private__width);
        var currentLengthFromRight = clamp(this._private__width - ensureNotNull(this._private__scaleStartPoint), 0, this._private__width);
        if (startLengthFromRight === 0 || currentLengthFromRight === 0) {
            return;
        }
        this._internal_setBarSpacing(this._private__commonTransitionStartState._internal_barSpacing * startLengthFromRight / currentLengthFromRight);
    };
    TimeScale.prototype._internal_endScale = function () {
        if (this._private__scaleStartPoint === null) {
            return;
        }
        this._private__scaleStartPoint = null;
        this._private__clearCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_startScroll = function (x) {
        if (this._private__scrollStartPoint !== null || this._private__commonTransitionStartState !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        this._private__scrollStartPoint = x;
        this._private__saveCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scrollTo = function (x) {
        if (this._private__scrollStartPoint === null) {
            return;
        }
        var shiftInLogical = (this._private__scrollStartPoint - x) / this._internal_barSpacing();
        this._private__rightOffset = ensureNotNull(this._private__commonTransitionStartState)._internal_rightOffset + shiftInLogical;
        this._private__visibleRangeInvalidated = true;
        // do not allow scroll out of visible bars
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_endScroll = function () {
        if (this._private__scrollStartPoint === null) {
            return;
        }
        this._private__scrollStartPoint = null;
        this._private__clearCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scrollToRealTime = function () {
        this._internal_scrollToOffsetAnimated(this._private__options.rightOffset);
    };
    TimeScale.prototype._internal_scrollToOffsetAnimated = function (offset, animationDuration) {
        var _this = this;
        if (animationDuration === void 0) { animationDuration = 400 /* DefaultAnimationDuration */; }
        if (!isFinite(offset)) {
            throw new RangeError('offset is required and must be finite number');
        }
        if (!isFinite(animationDuration) || animationDuration <= 0) {
            throw new RangeError('animationDuration (optional) must be finite positive number');
        }
        var source = this._private__rightOffset;
        var animationStart = new Date().getTime();
        var animationFn = function () {
            var animationProgress = (new Date().getTime() - animationStart) / animationDuration;
            var finishAnimation = animationProgress >= 1;
            var rightOffset = finishAnimation ? offset : source + (offset - source) * animationProgress;
            _this._internal_setRightOffset(rightOffset);
            if (!finishAnimation) {
                setTimeout(animationFn, 20);
            }
        };
        animationFn();
    };
    TimeScale.prototype._internal_update = function (index, values, marks) {
        this._private__visibleRangeInvalidated = true;
        if (values.length > 0) {
            // we have some time points to merge
            var oldSize = this._private__points._internal_size();
            this._private__points._internal_merge(index, values);
            if (this._private__rightOffset < 0 && (this._private__points._internal_size() === oldSize + 1)) {
                this._private__rightOffset -= 1;
            }
        }
        this._private__tickMarks._internal_merge(marks);
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_visibleBarsChanged = function () {
        return this._private__visibleBarsChanged;
    };
    TimeScale.prototype._internal_logicalRangeChanged = function () {
        return this._private__logicalRangeChanged;
    };
    TimeScale.prototype._internal_optionsApplied = function () {
        return this._private__optionsApplied;
    };
    TimeScale.prototype._internal_baseIndex = function () {
        // null is used to known that baseIndex is not set yet
        // so in methods which should known whether it is set or not
        // we should check field `_baseIndexOrNull` instead of getter `baseIndex()`
        // see minRightOffset for example
        return this._private__baseIndexOrNull || 0;
    };
    TimeScale.prototype._internal_setVisibleRange = function (range) {
        var length = range._internal_count();
        this._private__setBarSpacing(this._private__width / length);
        this._private__rightOffset = range._internal_right() - this._internal_baseIndex();
        this._private__correctOffset();
        this._private__visibleRangeInvalidated = true;
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_fitContent = function () {
        var first = this._private__points._internal_firstIndex();
        var last = this._private__points._internal_lastIndex();
        if (first === null || last === null) {
            return;
        }
        this._internal_setVisibleRange(new RangeImpl(first, last + this._private__options.rightOffset));
    };
    TimeScale.prototype._internal_setLogicalRange = function (range) {
        var barRange = new RangeImpl(range.from, range.to);
        this._internal_setVisibleRange(barRange);
    };
    TimeScale.prototype._internal_formatDateTime = function (time) {
        if (this._private__localizationOptions.timeFormatter !== undefined) {
            return this._private__localizationOptions.timeFormatter(time.businessDay || time.timestamp);
        }
        return this._private__dateTimeFormatter._internal_format(new Date(time.timestamp * 1000));
    };
    TimeScale.prototype._private__rightOffsetForCoordinate = function (x) {
        return (this._private__width + 1 - x) / this._private__barSpacing;
    };
    TimeScale.prototype._private__coordinateToFloatIndex = function (x) {
        var deltaFromRight = this._private__rightOffsetForCoordinate(x);
        var baseIndex = this._internal_baseIndex();
        var index = baseIndex + this._private__rightOffset - deltaFromRight;
        // JavaScript uses very strange rounding
        // we need rounding to avoid problems with calculation errors
        return Math.round(index * 1000000) / 1000000;
    };
    TimeScale.prototype._private__setBarSpacing = function (newBarSpacing) {
        var oldBarSpacing = this._private__barSpacing;
        this._private__barSpacing = newBarSpacing;
        this._private__correctBarSpacing();
        // this._barSpacing might be changed in _correctBarSpacing
        if (oldBarSpacing !== this._private__barSpacing) {
            this._private__visibleRangeInvalidated = true;
            this._private__resetTimeMarksCache();
        }
    };
    TimeScale.prototype._private__updateVisibleRange = function () {
        if (!this._private__visibleRangeInvalidated) {
            return;
        }
        this._private__visibleRangeInvalidated = false;
        if (this._internal_isEmpty()) {
            this._private__setVisibleRange(TimeScaleVisibleRange._internal_invalid());
            return;
        }
        var baseIndex = this._internal_baseIndex();
        var newBarsLength = this._private__width / this._private__barSpacing;
        var rightBorder = this._private__rightOffset + baseIndex;
        var leftBorder = rightBorder - newBarsLength + 1;
        var logicalRange = new RangeImpl(leftBorder, rightBorder);
        this._private__setVisibleRange(new TimeScaleVisibleRange(logicalRange));
    };
    TimeScale.prototype._private__correctBarSpacing = function () {
        if (this._private__barSpacing < 0.5 /* MinBarSpacing */) {
            this._private__barSpacing = 0.5 /* MinBarSpacing */;
            this._private__visibleRangeInvalidated = true;
        }
        if (this._private__width !== 0) {
            // make sure that this (1 / Constants.MinVisibleBarsCount) >= coeff in max bar spacing (it's 0.5 here)
            var maxBarSpacing = this._private__width * 0.5;
            if (this._private__barSpacing > maxBarSpacing) {
                this._private__barSpacing = maxBarSpacing;
                this._private__visibleRangeInvalidated = true;
            }
        }
    };
    TimeScale.prototype._private__correctOffset = function () {
        // block scrolling of to future
        var maxRightOffset = this._private__maxRightOffset();
        if (this._private__rightOffset > maxRightOffset) {
            this._private__rightOffset = maxRightOffset;
            this._private__visibleRangeInvalidated = true;
        }
        // block scrolling of to past
        var minRightOffset = this._private__minRightOffset();
        if (minRightOffset !== null && this._private__rightOffset < minRightOffset) {
            this._private__rightOffset = minRightOffset;
            this._private__visibleRangeInvalidated = true;
        }
    };
    TimeScale.prototype._private__minRightOffset = function () {
        var firstIndex = this._private__points._internal_firstIndex();
        var baseIndex = this._private__baseIndexOrNull;
        if (firstIndex === null || baseIndex === null) {
            return null;
        }
        if (this._private__leftEdgeIndex !== null) {
            var barsEstimation = this._private__width / this._private__barSpacing;
            return this._private__leftEdgeIndex - baseIndex + barsEstimation - 1;
        }
        return firstIndex - baseIndex - 1 + Math.min(2 /* MinVisibleBarsCount */, this._private__points._internal_size());
    };
    TimeScale.prototype._private__maxRightOffset = function () {
        return (this._private__width / this._private__barSpacing) - Math.min(2 /* MinVisibleBarsCount */, this._private__points._internal_size());
    };
    TimeScale.prototype._private__saveCommonTransitionsStartState = function () {
        this._private__commonTransitionStartState = {
            _internal_barSpacing: this._internal_barSpacing(),
            _internal_rightOffset: this._internal_rightOffset(),
        };
    };
    TimeScale.prototype._private__clearCommonTransitionsStartState = function () {
        this._private__commonTransitionStartState = null;
    };
    TimeScale.prototype._private__formatLabel = function (time, span) {
        var _this = this;
        var formatter = this._private__formattedBySpan.get(span);
        if (formatter === undefined) {
            formatter = new FormattedLabelsCache(function (timePoint) {
                return _this._private__formatLabelImpl(timePoint, span);
            });
            this._private__formattedBySpan.set(span, formatter);
        }
        return formatter._internal_format(time);
    };
    TimeScale.prototype._private__formatLabelImpl = function (timePoint, span) {
        var tickMarkType;
        var timeVisible = this._private__options.timeVisible;
        if (span < 20 /* Minute */ && timeVisible) {
            tickMarkType = this._private__options.secondsVisible ? 4 /* TimeWithSeconds */ : 3 /* Time */;
        }
        else if (span < 40 /* Day */ && timeVisible) {
            tickMarkType = 3 /* Time */;
        }
        else if (span < 50 /* Week */) {
            tickMarkType = 2 /* DayOfMonth */;
        }
        else if (span < 60 /* Month */) {
            tickMarkType = 2 /* DayOfMonth */;
        }
        else if (span < 70 /* Year */) {
            tickMarkType = 1 /* Month */;
        }
        else {
            tickMarkType = 0 /* Year */;
        }
        return this._private__options.tickMarkFormatter(timePoint, tickMarkType, this._private__localizationOptions.locale);
    };
    TimeScale.prototype._private__setVisibleRange = function (newVisibleRange) {
        var oldVisibleRange = this._private__visibleRange;
        this._private__visibleRange = newVisibleRange;
        if (!areRangesEqual(oldVisibleRange._internal_strictRange(), this._private__visibleRange._internal_strictRange())) {
            this._private__visibleBarsChanged._internal_fire();
        }
        if (!areRangesEqual(oldVisibleRange._internal_logicalRange(), this._private__visibleRange._internal_logicalRange())) {
            this._private__logicalRangeChanged._internal_fire();
        }
        // TODO: reset only coords in case when this._visibleBars has not been changed
        this._private__resetTimeMarksCache();
    };
    TimeScale.prototype._private__resetTimeMarksCache = function () {
        this._private__timeMarksCache = null;
    };
    TimeScale.prototype._private__invalidateTickMarks = function () {
        this._private__resetTimeMarksCache();
        this._private__formattedBySpan.clear();
    };
    TimeScale.prototype._private__updateDateTimeFormatter = function () {
        var dateFormat = this._private__localizationOptions.dateFormat;
        if (this._private__options.timeVisible) {
            this._private__dateTimeFormatter = new DateTimeFormatter({
                _internal_dateFormat: dateFormat,
                _internal_timeFormat: this._private__options.secondsVisible ? '%h:%m:%s' : '%h:%m',
                _internal_dateTimeSeparator: '   ',
                _internal_locale: this._private__localizationOptions.locale,
            });
        }
        else {
            this._private__dateTimeFormatter = new DateFormatter(dateFormat, this._private__localizationOptions.locale);
        }
    };
    TimeScale.prototype._private__fixLeftEdge = function () {
        if (!this._private__options.fixLeftEdge) {
            return;
        }
        var firstIndex = this._private__points._internal_firstIndex();
        if (firstIndex === null || this._private__leftEdgeIndex === firstIndex) {
            return;
        }
        this._private__leftEdgeIndex = firstIndex;
        var delta = ensureNotNull(this._internal_visibleStrictRange())._internal_left() - firstIndex;
        if (delta < 0) {
            var leftEdgeOffset = this._private__rightOffset - delta - 1;
            this._internal_setRightOffset(leftEdgeOffset);
        }
    };
    return TimeScale;
}());
export { TimeScale };
