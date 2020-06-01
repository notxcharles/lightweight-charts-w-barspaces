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
var Constants;
(function (Constants) {
    Constants[Constants["DefaultAnimationDuration"] = 400] = "DefaultAnimationDuration";
    Constants[Constants["MinBarSpacing"] = 0.5] = "MinBarSpacing";
    // make sure that this (1 / MinVisibleBarsCount) >= coeff in max bar spacing
    Constants[Constants["MinVisibleBarsCount"] = 2] = "MinVisibleBarsCount";
})(Constants || (Constants = {}));
var MarkSpanBorder;
(function (MarkSpanBorder) {
    MarkSpanBorder[MarkSpanBorder["Minute"] = 20] = "Minute";
    MarkSpanBorder[MarkSpanBorder["Hour"] = 30] = "Hour";
    MarkSpanBorder[MarkSpanBorder["Day"] = 40] = "Day";
    MarkSpanBorder[MarkSpanBorder["Week"] = 50] = "Week";
    MarkSpanBorder[MarkSpanBorder["Month"] = 60] = "Month";
    MarkSpanBorder[MarkSpanBorder["Year"] = 70] = "Year";
})(MarkSpanBorder || (MarkSpanBorder = {}));
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
        this._width = 0;
        this._baseIndexOrNull = null;
        this._points = new TimePoints();
        this._scrollStartPoint = null;
        this._scaleStartPoint = null;
        this._tickMarks = new TickMarks();
        this._formattedBySpan = new Map();
        this._visibleRange = TimeScaleVisibleRange.invalid();
        this._visibleRangeInvalidated = true;
        this._visibleBarsChanged = new Delegate();
        this._logicalRangeChanged = new Delegate();
        this._optionsApplied = new Delegate();
        this._leftEdgeIndex = null;
        this._commonTransitionStartState = null;
        this._timeMarksCache = null;
        this._labels = [];
        this._options = options;
        this._localizationOptions = localizationOptions;
        this._rightOffset = options.rightOffset;
        this._barSpacing = options.barSpacing;
        this._model = model;
        this._updateDateTimeFormatter();
    }
    TimeScale.prototype.options = function () {
        return this._options;
    };
    TimeScale.prototype.applyLocalizationOptions = function (localizationOptions) {
        merge(this._localizationOptions, localizationOptions);
        this._invalidateTickMarks();
        this._updateDateTimeFormatter();
    };
    TimeScale.prototype.applyOptions = function (options, localizationOptions) {
        merge(this._options, options);
        if (this._options.fixLeftEdge) {
            this._fixLeftEdge();
        }
        else {
            this._leftEdgeIndex = null;
        }
        // note that bar spacing should be applied before right offset
        // because right offset depends on bar spacing
        if (options.barSpacing !== undefined) {
            this.setBarSpacing(options.barSpacing);
        }
        if (options.rightOffset !== undefined) {
            this.setRightOffset(options.rightOffset);
        }
        this._invalidateTickMarks();
        this._updateDateTimeFormatter();
        this._optionsApplied.fire();
    };
    TimeScale.prototype.isEmpty = function () {
        return this._width === 0 || this._points.size() === 0;
    };
    // strict range: integer indices of the bars in the visible range rounded in more wide direction
    TimeScale.prototype.visibleStrictRange = function () {
        this._updateVisibleRange();
        return this._visibleRange.strictRange();
    };
    TimeScale.prototype.visibleLogicalRange = function () {
        this._updateVisibleRange();
        return this._visibleRange.logicalRange();
    };
    TimeScale.prototype.visibleTimeRange = function () {
        var visibleBars = this.visibleStrictRange();
        if (visibleBars === null) {
            return null;
        }
        var range = {
            from: visibleBars.left(),
            to: visibleBars.right(),
        };
        return this.timeRangeForLogicalRange(range);
    };
    TimeScale.prototype.timeRangeForLogicalRange = function (range) {
        var from = Math.round(range.from);
        var to = Math.round(range.to);
        var points = this._model.timeScale().points();
        var firstIndex = ensureNotNull(points.firstIndex());
        var lastIndex = ensureNotNull(points.lastIndex());
        return {
            from: ensureNotNull(points.valueAt(Math.max(firstIndex, from))),
            to: ensureNotNull(points.valueAt(Math.min(lastIndex, to))),
        };
    };
    TimeScale.prototype.logicalRangeForTimeRange = function (range) {
        var points = this._model.timeScale().points();
        return {
            from: ensureNotNull(points.indexOf(range.from.timestamp, true)),
            to: ensureNotNull(points.indexOf(range.to.timestamp, true)),
        };
    };
    TimeScale.prototype.tickMarks = function () {
        return this._tickMarks;
    };
    TimeScale.prototype.points = function () {
        return this._points;
    };
    TimeScale.prototype.width = function () {
        return this._width;
    };
    TimeScale.prototype.setWidth = function (width) {
        if (!isFinite(width) || width <= 0) {
            return;
        }
        if (this._width === width) {
            return;
        }
        if (this._options.lockVisibleTimeRangeOnResize && this._width) {
            // recalculate bar spacing
            var newBarSpacing = this._barSpacing * width / this._width;
            this._setBarSpacing(newBarSpacing);
        }
        // if time scale is scrolled to the end of data and we have fixed right edge
        // keep left edge instead of right
        // we need it to avoid "shaking" if the last bar visibility affects time scale width
        if (this._leftEdgeIndex !== null) {
            var firstVisibleBar = ensureNotNull(this.visibleStrictRange()).left();
            // firstVisibleBar could be less than this._leftEdgeIndex
            // since index is a center of bar
            if (firstVisibleBar <= this._leftEdgeIndex) {
                var delta = this._width - width;
                // reduce  _rightOffset means move right
                // we could move more than required - this will be fixed by _correctOffset()
                this._rightOffset -= Math.round(delta / this._barSpacing) + 1;
            }
        }
        this._width = width;
        this._visibleRangeInvalidated = true;
        // updating bar spacing should be first because right offset depends on it
        this._correctBarSpacing();
        this._correctOffset();
    };
    TimeScale.prototype.indexToCoordinate = function (index) {
        if (this.isEmpty() || !isInteger(index)) {
            return 0;
        }
        var baseIndex = this.baseIndex();
        var deltaFromRight = baseIndex + this._rightOffset - index;
        var coordinate = this._width - (deltaFromRight + 0.5) * this._barSpacing;
        return coordinate;
    };
    TimeScale.prototype.indexesToCoordinates = function (points, visibleRange) {
        var baseIndex = this.baseIndex();
        var indexFrom = (visibleRange === undefined) ? 0 : visibleRange.from;
        var indexTo = (visibleRange === undefined) ? points.length : visibleRange.to;
        for (var i = indexFrom; i < indexTo; i++) {
            var index = points[i].time;
            var deltaFromRight = baseIndex + this._rightOffset - index;
            var coordinate = this._width - (deltaFromRight + 0.5) * this._barSpacing;
            points[i].x = coordinate;
        }
    };
    TimeScale.prototype.indexToUserTime = function (index) {
        return this._tickMarks.indexToTime(index);
    };
    TimeScale.prototype.coordinateToIndex = function (x) {
        return Math.ceil(this._coordinateToFloatIndex(x));
    };
    TimeScale.prototype.setRightOffset = function (offset) {
        this._visibleRangeInvalidated = true;
        this._rightOffset = offset;
        this._correctOffset();
        this._model.recalculateAllPanes();
        this._model.lightUpdate();
    };
    TimeScale.prototype.barSpacing = function () {
        return this._barSpacing;
    };
    TimeScale.prototype.setBarSpacing = function (newBarSpacing) {
        this._setBarSpacing(newBarSpacing);
        // do not allow scroll out of visible bars
        this._correctOffset();
        this._model.recalculateAllPanes();
        this._model.lightUpdate();
    };
    TimeScale.prototype.rightOffset = function () {
        return this._rightOffset;
    };
    TimeScale.prototype.marks = function () {
        if (this.isEmpty()) {
            return null;
        }
        if (this._timeMarksCache !== null) {
            return this._timeMarksCache;
        }
        var spacing = this._barSpacing;
        var fontSize = this._model.options().layout.fontSize;
        var maxLabelWidth = (fontSize + 4) * 5;
        var indexPerLabel = Math.round(maxLabelWidth / spacing);
        var visibleBars = ensureNotNull(this.visibleStrictRange());
        var firstBar = Math.max(visibleBars.left(), visibleBars.left() - indexPerLabel);
        var lastBar = Math.max(visibleBars.right(), visibleBars.right() - indexPerLabel);
        var items = this._tickMarks.build(spacing, maxLabelWidth);
        var targetIndex = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var tm = items_1[_i];
            if (!(firstBar <= tm.index && tm.index <= lastBar)) {
                continue;
            }
            var time = this._tickMarks.indexToTime(tm.index);
            if (time === null) {
                continue;
            }
            if (targetIndex < this._labels.length) {
                var label = this._labels[targetIndex];
                label.coord = this.indexToCoordinate(tm.index);
                label.label = this._formatLabel(time, tm.span);
                label.span = tm.span;
                label.major = false;
            }
            else {
                this._labels.push({
                    coord: this.indexToCoordinate(tm.index),
                    label: this._formatLabel(time, tm.span),
                    span: tm.span,
                    major: false,
                });
            }
            targetIndex++;
        }
        this._labels.length = targetIndex;
        this._timeMarksCache = this._labels;
        return this._labels;
    };
    TimeScale.prototype.reset = function () {
        this._visibleRangeInvalidated = true;
        this._points = new TimePoints();
        this._scrollStartPoint = null;
        this._scaleStartPoint = null;
        this._clearCommonTransitionsStartState();
        this._tickMarks.reset();
        this._leftEdgeIndex = null;
    };
    TimeScale.prototype.restoreDefault = function () {
        this._visibleRangeInvalidated = true;
        this.setBarSpacing(this._options.barSpacing);
        this.setRightOffset(this._options.rightOffset);
    };
    TimeScale.prototype.fixLeftEdge = function () {
        return this._options.fixLeftEdge;
    };
    TimeScale.prototype.setBaseIndex = function (baseIndex) {
        this._visibleRangeInvalidated = true;
        this._baseIndexOrNull = baseIndex;
        this._correctOffset();
        this._fixLeftEdge();
    };
    /**
     * Zoom in/out the scale around a `zoomPoint` on `scale` value.
     * @param zoomPoint - X coordinate of the point to apply the zoom.
     *   If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
     * @param scale - Zoom value (in 1/10 parts of current bar spacing).
     *   Negative value means zoom out, positive - zoom in.
     */
    TimeScale.prototype.zoom = function (zoomPoint, scale) {
        var floatIndexAtZoomPoint = this._coordinateToFloatIndex(zoomPoint);
        var barSpacing = this.barSpacing();
        var newBarSpacing = barSpacing + scale * (barSpacing / 10);
        // zoom in/out bar spacing
        this.setBarSpacing(newBarSpacing);
        if (!this._options.rightBarStaysOnScroll) {
            // and then correct right offset to move index under zoomPoint back to its coordinate
            this.setRightOffset(this.rightOffset() + (floatIndexAtZoomPoint - this._coordinateToFloatIndex(zoomPoint)));
        }
    };
    TimeScale.prototype.startScale = function (x) {
        if (this._scrollStartPoint) {
            this.endScroll();
        }
        if (this._scaleStartPoint !== null || this._commonTransitionStartState !== null) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        this._scaleStartPoint = x;
        this._saveCommonTransitionsStartState();
    };
    TimeScale.prototype.scaleTo = function (x) {
        if (this._commonTransitionStartState === null) {
            return;
        }
        var startLengthFromRight = clamp(this._width - x, 0, this._width);
        var currentLengthFromRight = clamp(this._width - ensureNotNull(this._scaleStartPoint), 0, this._width);
        if (startLengthFromRight === 0 || currentLengthFromRight === 0) {
            return;
        }
        this.setBarSpacing(this._commonTransitionStartState.barSpacing * startLengthFromRight / currentLengthFromRight);
    };
    TimeScale.prototype.endScale = function () {
        if (this._scaleStartPoint === null) {
            return;
        }
        this._scaleStartPoint = null;
        this._clearCommonTransitionsStartState();
    };
    TimeScale.prototype.startScroll = function (x) {
        if (this._scrollStartPoint !== null || this._commonTransitionStartState !== null) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        this._scrollStartPoint = x;
        this._saveCommonTransitionsStartState();
    };
    TimeScale.prototype.scrollTo = function (x) {
        if (this._scrollStartPoint === null) {
            return;
        }
        var shiftInLogical = (this._scrollStartPoint - x) / this.barSpacing();
        this._rightOffset = ensureNotNull(this._commonTransitionStartState).rightOffset + shiftInLogical;
        this._visibleRangeInvalidated = true;
        // do not allow scroll out of visible bars
        this._correctOffset();
    };
    TimeScale.prototype.endScroll = function () {
        if (this._scrollStartPoint === null) {
            return;
        }
        this._scrollStartPoint = null;
        this._clearCommonTransitionsStartState();
    };
    TimeScale.prototype.scrollToRealTime = function () {
        this.scrollToOffsetAnimated(this._options.rightOffset);
    };
    TimeScale.prototype.scrollToOffsetAnimated = function (offset, animationDuration) {
        var _this = this;
        if (animationDuration === void 0) { animationDuration = 400 /* DefaultAnimationDuration */; }
        if (!isFinite(offset)) {
            throw new RangeError('offset is required and must be finite number');
        }
        if (!isFinite(animationDuration) || animationDuration <= 0) {
            throw new RangeError('animationDuration (optional) must be finite positive number');
        }
        var source = this._rightOffset;
        var animationStart = new Date().getTime();
        var animationFn = function () {
            var animationProgress = (new Date().getTime() - animationStart) / animationDuration;
            var finishAnimation = animationProgress >= 1;
            var rightOffset = finishAnimation ? offset : source + (offset - source) * animationProgress;
            _this.setRightOffset(rightOffset);
            if (!finishAnimation) {
                setTimeout(animationFn, 20);
            }
        };
        animationFn();
    };
    TimeScale.prototype.update = function (index, values, marks) {
        this._visibleRangeInvalidated = true;
        if (values.length > 0) {
            // we have some time points to merge
            var oldSize = this._points.size();
            this._points.merge(index, values);
            if (this._rightOffset < 0 && (this._points.size() === oldSize + 1)) {
                this._rightOffset -= 1;
            }
        }
        this._tickMarks.merge(marks);
        this._correctOffset();
    };
    TimeScale.prototype.visibleBarsChanged = function () {
        return this._visibleBarsChanged;
    };
    TimeScale.prototype.logicalRangeChanged = function () {
        return this._logicalRangeChanged;
    };
    TimeScale.prototype.optionsApplied = function () {
        return this._optionsApplied;
    };
    TimeScale.prototype.baseIndex = function () {
        // null is used to known that baseIndex is not set yet
        // so in methods which should known whether it is set or not
        // we should check field `_baseIndexOrNull` instead of getter `baseIndex()`
        // see minRightOffset for example
        return this._baseIndexOrNull || 0;
    };
    TimeScale.prototype.setVisibleRange = function (range) {
        var length = range.count();
        this._setBarSpacing(this._width / length);
        this._rightOffset = range.right() - this.baseIndex();
        this._correctOffset();
        this._visibleRangeInvalidated = true;
        this._model.recalculateAllPanes();
        this._model.lightUpdate();
    };
    TimeScale.prototype.fitContent = function () {
        var first = this._points.firstIndex();
        var last = this._points.lastIndex();
        if (first === null || last === null) {
            return;
        }
        this.setVisibleRange(new RangeImpl(first, last + this._options.rightOffset));
    };
    TimeScale.prototype.setLogicalRange = function (range) {
        var barRange = new RangeImpl(range.from, range.to);
        this.setVisibleRange(barRange);
    };
    TimeScale.prototype.formatDateTime = function (time) {
        if (this._localizationOptions.timeFormatter !== undefined) {
            return this._localizationOptions.timeFormatter(time.businessDay || time.timestamp);
        }
        return this._dateTimeFormatter.format(new Date(time.timestamp * 1000));
    };
    TimeScale.prototype._rightOffsetForCoordinate = function (x) {
        return (this._width + 1 - x) / this._barSpacing;
    };
    TimeScale.prototype._coordinateToFloatIndex = function (x) {
        var deltaFromRight = this._rightOffsetForCoordinate(x);
        var baseIndex = this.baseIndex();
        var index = baseIndex + this._rightOffset - deltaFromRight;
        // JavaScript uses very strange rounding
        // we need rounding to avoid problems with calculation errors
        return Math.round(index * 1000000) / 1000000;
    };
    TimeScale.prototype._setBarSpacing = function (newBarSpacing) {
        var oldBarSpacing = this._barSpacing;
        this._barSpacing = newBarSpacing;
        this._correctBarSpacing();
        // this._barSpacing might be changed in _correctBarSpacing
        if (oldBarSpacing !== this._barSpacing) {
            this._visibleRangeInvalidated = true;
            this._resetTimeMarksCache();
        }
    };
    TimeScale.prototype._updateVisibleRange = function () {
        if (!this._visibleRangeInvalidated) {
            return;
        }
        this._visibleRangeInvalidated = false;
        if (this.isEmpty()) {
            this._setVisibleRange(TimeScaleVisibleRange.invalid());
            return;
        }
        var baseIndex = this.baseIndex();
        var newBarsLength = this._width / this._barSpacing;
        var rightBorder = this._rightOffset + baseIndex;
        var leftBorder = rightBorder - newBarsLength + 1;
        var logicalRange = new RangeImpl(leftBorder, rightBorder);
        this._setVisibleRange(new TimeScaleVisibleRange(logicalRange));
    };
    TimeScale.prototype._correctBarSpacing = function () {
        if (this._barSpacing < 0.5 /* MinBarSpacing */) {
            this._barSpacing = 0.5 /* MinBarSpacing */;
            this._visibleRangeInvalidated = true;
        }
        if (this._width !== 0) {
            // make sure that this (1 / Constants.MinVisibleBarsCount) >= coeff in max bar spacing (it's 0.5 here)
            var maxBarSpacing = this._width * 0.5;
            if (this._barSpacing > maxBarSpacing) {
                this._barSpacing = maxBarSpacing;
                this._visibleRangeInvalidated = true;
            }
        }
    };
    TimeScale.prototype._correctOffset = function () {
        // block scrolling of to future
        var maxRightOffset = this._maxRightOffset();
        if (this._rightOffset > maxRightOffset) {
            this._rightOffset = maxRightOffset;
            this._visibleRangeInvalidated = true;
        }
        // block scrolling of to past
        var minRightOffset = this._minRightOffset();
        if (minRightOffset !== null && this._rightOffset < minRightOffset) {
            this._rightOffset = minRightOffset;
            this._visibleRangeInvalidated = true;
        }
    };
    TimeScale.prototype._minRightOffset = function () {
        var firstIndex = this._points.firstIndex();
        var baseIndex = this._baseIndexOrNull;
        if (firstIndex === null || baseIndex === null) {
            return null;
        }
        if (this._leftEdgeIndex !== null) {
            var barsEstimation = this._width / this._barSpacing;
            return this._leftEdgeIndex - baseIndex + barsEstimation - 1;
        }
        return firstIndex - baseIndex - 1 + Math.min(2 /* MinVisibleBarsCount */, this._points.size());
    };
    TimeScale.prototype._maxRightOffset = function () {
        return (this._width / this._barSpacing) - Math.min(2 /* MinVisibleBarsCount */, this._points.size());
    };
    TimeScale.prototype._saveCommonTransitionsStartState = function () {
        this._commonTransitionStartState = {
            barSpacing: this.barSpacing(),
            rightOffset: this.rightOffset(),
        };
    };
    TimeScale.prototype._clearCommonTransitionsStartState = function () {
        this._commonTransitionStartState = null;
    };
    TimeScale.prototype._formatLabel = function (time, span) {
        var _this = this;
        var formatter = this._formattedBySpan.get(span);
        if (formatter === undefined) {
            formatter = new FormattedLabelsCache(function (timePoint) {
                return _this._formatLabelImpl(timePoint, span);
            });
            this._formattedBySpan.set(span, formatter);
        }
        return formatter.format(time);
    };
    TimeScale.prototype._formatLabelImpl = function (timePoint, span) {
        var tickMarkType;
        var timeVisible = this._options.timeVisible;
        if (span < 20 /* Minute */ && timeVisible) {
            tickMarkType = this._options.secondsVisible ? 4 /* TimeWithSeconds */ : 3 /* Time */;
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
        return this._options.tickMarkFormatter(timePoint, tickMarkType, this._localizationOptions.locale);
    };
    TimeScale.prototype._setVisibleRange = function (newVisibleRange) {
        var oldVisibleRange = this._visibleRange;
        this._visibleRange = newVisibleRange;
        if (!areRangesEqual(oldVisibleRange.strictRange(), this._visibleRange.strictRange())) {
            this._visibleBarsChanged.fire();
        }
        if (!areRangesEqual(oldVisibleRange.logicalRange(), this._visibleRange.logicalRange())) {
            this._logicalRangeChanged.fire();
        }
        // TODO: reset only coords in case when this._visibleBars has not been changed
        this._resetTimeMarksCache();
    };
    TimeScale.prototype._resetTimeMarksCache = function () {
        this._timeMarksCache = null;
    };
    TimeScale.prototype._invalidateTickMarks = function () {
        this._resetTimeMarksCache();
        this._formattedBySpan.clear();
    };
    TimeScale.prototype._updateDateTimeFormatter = function () {
        var dateFormat = this._localizationOptions.dateFormat;
        if (this._options.timeVisible) {
            this._dateTimeFormatter = new DateTimeFormatter({
                dateFormat: dateFormat,
                timeFormat: this._options.secondsVisible ? '%h:%m:%s' : '%h:%m',
                dateTimeSeparator: '   ',
                locale: this._localizationOptions.locale,
            });
        }
        else {
            this._dateTimeFormatter = new DateFormatter(dateFormat, this._localizationOptions.locale);
        }
    };
    TimeScale.prototype._fixLeftEdge = function () {
        if (!this._options.fixLeftEdge) {
            return;
        }
        var firstIndex = this._points.firstIndex();
        if (firstIndex === null || this._leftEdgeIndex === firstIndex) {
            return;
        }
        this._leftEdgeIndex = firstIndex;
        var delta = ensureNotNull(this.visibleStrictRange()).left() - firstIndex;
        if (delta < 0) {
            var leftEdgeOffset = this._rightOffset - delta - 1;
            this.setRightOffset(leftEdgeOffset);
        }
    };
    return TimeScale;
}());
export { TimeScale };
