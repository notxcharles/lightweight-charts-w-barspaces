import { assert } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone } from '../helpers/strict-type-checks';
import { convertTime } from './data-layer';
;
var TimeScaleApi = /** @class */ (function () {
    function TimeScaleApi(model) {
        this._private__timeRangeChanged = new Delegate();
        this._private__logicalRangeChanged = new Delegate();
        this._private__model = model;
        this._private__timeScale()._internal_visibleBarsChanged()._internal_subscribe(this._private__onVisibleBarsChanged.bind(this));
        this._private__timeScale()._internal_logicalRangeChanged()._internal_subscribe(this._private__onVisibleLogicalRangeChanged.bind(this));
    }
    TimeScaleApi.prototype._internal_destroy = function () {
        this._private__timeScale()._internal_visibleBarsChanged()._internal_unsubscribeAll(this);
        this._private__timeScale()._internal_logicalRangeChanged()._internal_unsubscribeAll(this);
        this._private__timeRangeChanged._internal_destroy();
        delete this._private__model;
    };
    TimeScaleApi.prototype.scrollPosition = function () {
        return this._private__timeScale()._internal_rightOffset();
    };
    TimeScaleApi.prototype.getbarSpacing = function () {
        return this._private__timeScale()._internal_barSpacing();
    };
    TimeScaleApi.prototype.scrollToPosition = function (position, animated) {
        if (!animated) {
            this._private__timeScale()._internal_setRightOffset(position);
            return;
        }
        this._private__timeScale()._internal_scrollToOffsetAnimated(position, 1000 /* AnimationDurationMs */);
    };
    TimeScaleApi.prototype.scrollToRealTime = function () {
        this._private__timeScale()._internal_scrollToRealTime();
    };
    TimeScaleApi.prototype.getVisibleRange = function () {
        var _a, _b;
        var timeRange = this._private__timeScale()._internal_visibleTimeRange();
        if (timeRange === null) {
            return null;
        }
        return {
            from: (_a = timeRange.from.businessDay) !== null && _a !== void 0 ? _a : timeRange.from.timestamp,
            to: (_b = timeRange.to.businessDay) !== null && _b !== void 0 ? _b : timeRange.to.timestamp,
        };
    };
    TimeScaleApi.prototype.setVisibleRange = function (range) {
        var convertedRange = {
            from: convertTime(range.from),
            to: convertTime(range.to),
        };
        var logicalRange = this._private__timeScale()._internal_logicalRangeForTimeRange(convertedRange);
        this._private__model._internal_setTargetLogicalRange(logicalRange);
    };
    TimeScaleApi.prototype.getVisibleLogicalRange = function () {
        var logicalRange = this._private__timeScale()._internal_visibleLogicalRange();
        if (logicalRange === null) {
            return null;
        }
        return {
            from: logicalRange._internal_left(),
            to: logicalRange._internal_right(),
        };
    };
    TimeScaleApi.prototype.setVisibleLogicalRange = function (range) {
        assert(range.from <= range.to, 'The from index cannot be after the to index.');
        this._private__model._internal_setTargetLogicalRange(range);
    };
    TimeScaleApi.prototype.resetTimeScale = function () {
        this._private__model._internal_resetTimeScale();
    };
    TimeScaleApi.prototype.fitContent = function () {
        this._private__model._internal_fitContent();
    };
    TimeScaleApi.prototype.timeToCoordinate = function (time) {
        var timePoint = convertTime(time);
        var timeScale = this._private__model._internal_timeScale();
        var timePointIndex = timeScale._internal_points()._internal_indexOf(timePoint.timestamp, false);
        if (timePointIndex === null) {
            return null;
        }
        return timeScale._internal_indexToCoordinate(timePointIndex);
    };
    TimeScaleApi.prototype.coordinateToTime = function (x) {
        var _a;
        var timeScale = this._private__model._internal_timeScale();
        var timePointIndex = timeScale._internal_coordinateToIndex(x);
        var timePoint = timeScale._internal_points()._internal_valueAt(timePointIndex);
        if (timePoint === null) {
            return null;
        }
        return (_a = timePoint.businessDay) !== null && _a !== void 0 ? _a : timePoint.timestamp;
    };
    TimeScaleApi.prototype.subscribeVisibleTimeRangeChange = function (handler) {
        this._private__timeRangeChanged._internal_subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleTimeRangeChange = function (handler) {
        this._private__timeRangeChanged._internal_unsubscribe(handler);
    };
    TimeScaleApi.prototype.subscribeVisibleLogicalRangeChange = function (handler) {
        this._private__logicalRangeChanged._internal_subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleLogicalRangeChange = function (handler) {
        this._private__logicalRangeChanged._internal_unsubscribe(handler);
    };
    TimeScaleApi.prototype.applyOptions = function (options) {
        this._private__timeScale()._internal_applyOptions(options);
    };
    TimeScaleApi.prototype.options = function () {
        return clone(this._private__timeScale()._internal_options());
    };
    TimeScaleApi.prototype._private__timeScale = function () {
        return this._private__model._internal_timeScale();
    };
    TimeScaleApi.prototype._private__onVisibleBarsChanged = function () {
        if (this._private__timeRangeChanged._internal_hasListeners()) {
            this._private__timeRangeChanged._internal_fire(this.getVisibleRange());
        }
    };
    TimeScaleApi.prototype._private__onVisibleLogicalRangeChanged = function () {
        if (this._private__logicalRangeChanged._internal_hasListeners()) {
            this._private__logicalRangeChanged._internal_fire(this.getVisibleLogicalRange());
        }
    };
    return TimeScaleApi;
}());
export { TimeScaleApi };
