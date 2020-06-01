import { assert } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone } from '../helpers/strict-type-checks';
import { convertTime } from './data-layer';
var Constants;
(function (Constants) {
    Constants[Constants["AnimationDurationMs"] = 1000] = "AnimationDurationMs";
})(Constants || (Constants = {}));
var TimeScaleApi = /** @class */ (function () {
    function TimeScaleApi(model) {
        this._timeRangeChanged = new Delegate();
        this._logicalRangeChanged = new Delegate();
        this._model = model;
        this._timeScale().visibleBarsChanged().subscribe(this._onVisibleBarsChanged.bind(this));
        this._timeScale().logicalRangeChanged().subscribe(this._onVisibleLogicalRangeChanged.bind(this));
    }
    TimeScaleApi.prototype.destroy = function () {
        this._timeScale().visibleBarsChanged().unsubscribeAll(this);
        this._timeScale().logicalRangeChanged().unsubscribeAll(this);
        this._timeRangeChanged.destroy();
        delete this._model;
    };
    TimeScaleApi.prototype.scrollPosition = function () {
        return this._timeScale().rightOffset();
    };
    TimeScaleApi.prototype.getbarSpacing = function () {
        return this._timeScale().barSpacing();
    };
    TimeScaleApi.prototype.scrollToPosition = function (position, animated) {
        if (!animated) {
            this._timeScale().setRightOffset(position);
            return;
        }
        this._timeScale().scrollToOffsetAnimated(position, 1000 /* AnimationDurationMs */);
    };
    TimeScaleApi.prototype.scrollToRealTime = function () {
        this._timeScale().scrollToRealTime();
    };
    TimeScaleApi.prototype.getVisibleRange = function () {
        var _a, _b;
        var timeRange = this._timeScale().visibleTimeRange();
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
        var logicalRange = this._timeScale().logicalRangeForTimeRange(convertedRange);
        this._model.setTargetLogicalRange(logicalRange);
    };
    TimeScaleApi.prototype.getVisibleLogicalRange = function () {
        var logicalRange = this._timeScale().visibleLogicalRange();
        if (logicalRange === null) {
            return null;
        }
        return {
            from: logicalRange.left(),
            to: logicalRange.right(),
        };
    };
    TimeScaleApi.prototype.setVisibleLogicalRange = function (range) {
        assert(range.from <= range.to, 'The from index cannot be after the to index.');
        this._model.setTargetLogicalRange(range);
    };
    TimeScaleApi.prototype.resetTimeScale = function () {
        this._model.resetTimeScale();
    };
    TimeScaleApi.prototype.fitContent = function () {
        this._model.fitContent();
    };
    TimeScaleApi.prototype.timeToCoordinate = function (time) {
        var timePoint = convertTime(time);
        var timeScale = this._model.timeScale();
        var timePointIndex = timeScale.points().indexOf(timePoint.timestamp, false);
        if (timePointIndex === null) {
            return null;
        }
        return timeScale.indexToCoordinate(timePointIndex);
    };
    TimeScaleApi.prototype.coordinateToTime = function (x) {
        var _a;
        var timeScale = this._model.timeScale();
        var timePointIndex = timeScale.coordinateToIndex(x);
        var timePoint = timeScale.points().valueAt(timePointIndex);
        if (timePoint === null) {
            return null;
        }
        return (_a = timePoint.businessDay) !== null && _a !== void 0 ? _a : timePoint.timestamp;
    };
    TimeScaleApi.prototype.subscribeVisibleTimeRangeChange = function (handler) {
        this._timeRangeChanged.subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleTimeRangeChange = function (handler) {
        this._timeRangeChanged.unsubscribe(handler);
    };
    TimeScaleApi.prototype.subscribeVisibleLogicalRangeChange = function (handler) {
        this._logicalRangeChanged.subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleLogicalRangeChange = function (handler) {
        this._logicalRangeChanged.unsubscribe(handler);
    };
    TimeScaleApi.prototype.applyOptions = function (options) {
        this._timeScale().applyOptions(options);
    };
    TimeScaleApi.prototype.options = function () {
        return clone(this._timeScale().options());
    };
    TimeScaleApi.prototype._timeScale = function () {
        return this._model.timeScale();
    };
    TimeScaleApi.prototype._onVisibleBarsChanged = function () {
        if (this._timeRangeChanged.hasListeners()) {
            this._timeRangeChanged.fire(this.getVisibleRange());
        }
    };
    TimeScaleApi.prototype._onVisibleLogicalRangeChanged = function () {
        if (this._logicalRangeChanged.hasListeners()) {
            this._logicalRangeChanged.fire(this.getVisibleLogicalRange());
        }
    };
    return TimeScaleApi;
}());
export { TimeScaleApi };
