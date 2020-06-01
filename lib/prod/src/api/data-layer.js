/// <reference types="_build-time-constants" />
import { upperbound } from '../helpers/algorithms';
import { ensureDefined, ensureNotNull } from '../helpers/assertions';
import { isString } from '../helpers/strict-type-checks';
import { isBusinessDay, isUTCTimestamp, } from './data-consumer';
function newSeriesUpdatePacket() {
    return {
        _internal_update: [],
    };
}
function businessDayConverter(time) {
    if (!isBusinessDay(time)) {
        throw new Error('time must be of type BusinessDay');
    }
    var date = new Date(Date.UTC(time.year, time.month - 1, time.day, 0, 0, 0, 0));
    return {
        timestamp: Math.round(date.getTime() / 1000),
        businessDay: time,
    };
}
function timestampConverter(time) {
    if (!isUTCTimestamp(time)) {
        throw new Error('time must be of type isUTCTimestamp');
    }
    return {
        timestamp: time,
    };
}
function selectTimeConverter(data) {
    if (data.length === 0) {
        return null;
    }
    if (isBusinessDay(data[0].time)) {
        return businessDayConverter;
    }
    return timestampConverter;
}
export function convertTime(time) {
    if (isUTCTimestamp(time)) {
        return timestampConverter(time);
    }
    if (!isBusinessDay(time)) {
        return businessDayConverter(stringToBusinessDay(time));
    }
    return businessDayConverter(time);
}
function getLineBasedSeriesItemValue(item, palette) {
    var val = item.value;
    // default value
    var color = null;
    if ('color' in item) {
        if (item.color !== undefined) {
            color = palette._internal_addColor(item.color);
        }
    }
    return [val, val, val, val, color];
}
function getOHLCBasedSeriesItemValue(bar, palette) {
    return [bar.open, bar.high, bar.low, bar.close, null];
}
var seriesItemValueFnMap = {
    Candlestick: getOHLCBasedSeriesItemValue,
    Bar: getOHLCBasedSeriesItemValue,
    Area: getLineBasedSeriesItemValue,
    Histogram: getLineBasedSeriesItemValue,
    Line: getLineBasedSeriesItemValue,
};
function seriesItemValueFn(seriesType) {
    return seriesItemValueFnMap[seriesType];
}
function hours(count) {
    return count * 60 * 60 * 1000;
}
function minutes(count) {
    return count * 60 * 1000;
}
function seconds(count) {
    return count * 1000;
}
var spanDivisors = [
    {
        _internal_divisor: 1, _internal_span: 20,
    },
    {
        _internal_divisor: seconds(1), _internal_span: 19,
    },
    {
        _internal_divisor: minutes(1), _internal_span: 20,
    },
    {
        _internal_divisor: minutes(5), _internal_span: 21,
    },
    {
        _internal_divisor: minutes(30), _internal_span: 22,
    },
    {
        _internal_divisor: hours(1), _internal_span: 30,
    },
    {
        _internal_divisor: hours(3), _internal_span: 31,
    },
    {
        _internal_divisor: hours(6), _internal_span: 32,
    },
    {
        _internal_divisor: hours(12), _internal_span: 33,
    },
];
function spanByTime(time, previousTime) {
    // function days(count) { return count * 24 * 60 * 60 * 1000; }
    if (previousTime !== null) {
        var lastTime = new Date(previousTime * 1000);
        var currentTime = new Date(time * 1000);
        if (currentTime.getUTCFullYear() !== lastTime.getUTCFullYear()) {
            return 70;
        }
        else if (currentTime.getUTCMonth() !== lastTime.getUTCMonth()) {
            return 60;
        }
        else if (currentTime.getUTCDate() !== lastTime.getUTCDate()) {
            return 50;
        }
        for (var i = spanDivisors.length - 1; i >= 0; --i) {
            if (Math.floor(lastTime.getTime() / spanDivisors[i]._internal_divisor) !== Math.floor(currentTime.getTime() / spanDivisors[i]._internal_divisor)) {
                return spanDivisors[i]._internal_span;
            }
        }
    }
    return 20;
}
function compareTimePoints(a, b) {
    return a.timestamp < b.timestamp;
}
var validDateRegex = /^\d\d\d\d-\d\d\-\d\d$/;
export function stringToBusinessDay(value) {
    if (process.env.NODE_ENV === 'development') {
        // in some browsers (I look at your Chrome) the Date constructor may accept invalid date string
        // but parses them in "implementation specific" way
        // for example 2019-1-1 isn't the same as 2019-01-01 (for Chrome both are "valid" date strings)
        // see https://bugs.chromium.org/p/chromium/issues/detail?id=968939
        // so, we need to be sure that date has valid format to avoid strange behavior and hours of debugging
        // but let's do this in development build only because of perf
        if (!validDateRegex.test(value)) {
            throw new Error("Invalid date string=" + value + ", expected format=yyyy-mm-dd");
        }
    }
    var d = new Date(value);
    if (isNaN(d.getTime())) {
        throw new Error("Invalid date string=" + value + ", expected format=yyyy-mm-dd");
    }
    return {
        day: d.getUTCDate(),
        month: d.getUTCMonth() + 1,
        year: d.getUTCFullYear(),
    };
}
function convertStringToBusinessDay(value) {
    if (isString(value.time)) {
        value.time = stringToBusinessDay(value.time);
    }
}
function convertStringsToBusinessDays(data) {
    return data.forEach(convertStringToBusinessDay);
}
var DataLayer = /** @class */ (function () {
    function DataLayer() {
        this._private__pointDataByTimePoint = new Map();
        this._private__timePointsByIndex = new Map();
        this._private__sortedTimePoints = [];
    }
    DataLayer.prototype._internal_destroy = function () {
        this._private__pointDataByTimePoint.clear();
        this._private__timePointsByIndex.clear();
        this._private__sortedTimePoints = [];
    };
    DataLayer.prototype._internal_setSeriesData = function (series, data) {
        var _this = this;
        series._internal_clearData();
        convertStringsToBusinessDays(data);
        this._private__pointDataByTimePoint.forEach(function (value) { return value._internal_mapping.delete(series); });
        var timeConverter = selectTimeConverter(data);
        if (timeConverter !== null) {
            data.forEach(function (item) {
                var time = timeConverter(item.time);
                var timePointData = _this._private__pointDataByTimePoint.get(time.timestamp) ||
                    { _internal_index: 0, _internal_mapping: new Map(), _internal_timePoint: time };
                timePointData._internal_mapping.set(series, item);
                _this._private__pointDataByTimePoint.set(time.timestamp, timePointData);
            });
        }
        // remove from points items without series
        var newPoints = new Map();
        this._private__pointDataByTimePoint.forEach(function (pointData, key) {
            if (pointData._internal_mapping.size > 0) {
                newPoints.set(key, pointData);
            }
        });
        return this._private__setNewPoints(newPoints);
    };
    DataLayer.prototype._internal_removeSeries = function (series) {
        return this._internal_setSeriesData(series, []);
    };
    DataLayer.prototype._internal_updateSeriesData = function (series, data) {
        // check types
        convertStringToBusinessDay(data);
        var bars = series._internal_data()._internal_bars();
        if (bars._internal_size() > 0) {
            var lastTime = ensureNotNull(bars._internal_last())._internal_time;
            if (lastTime.businessDay !== undefined) {
                // time must be BusinessDay
                if (!isBusinessDay(data.time)) {
                    throw new Error('time must be of type BusinessDay');
                }
            }
            else {
                if (!isUTCTimestamp(data.time)) {
                    throw new Error('time must be of type isUTCTimestamp');
                }
            }
        }
        var changedTimePointTime = ensureNotNull(selectTimeConverter([data]))(data.time);
        var pointData = this._private__pointDataByTimePoint.get(changedTimePointTime.timestamp) ||
            { _internal_index: 0, _internal_mapping: new Map(), _internal_timePoint: changedTimePointTime };
        var newPoint = pointData._internal_mapping.size === 0;
        pointData._internal_mapping.set(series, data);
        var updateAllSeries = false;
        if (newPoint) {
            var index = this._private__pointDataByTimePoint.size;
            if (this._private__sortedTimePoints.length > 0 && this._private__sortedTimePoints[this._private__sortedTimePoints.length - 1].timestamp > changedTimePointTime.timestamp) {
                // new point in the middle
                index = upperbound(this._private__sortedTimePoints, changedTimePointTime, compareTimePoints);
                this._private__sortedTimePoints.splice(index, 0, changedTimePointTime);
                this._private__incrementIndicesFrom(index);
                updateAllSeries = true;
            }
            else {
                // new point in the end
                this._private__sortedTimePoints.push(changedTimePointTime);
            }
            pointData._internal_index = index;
            this._private__timePointsByIndex.set(pointData._internal_index, changedTimePointTime);
        }
        this._private__pointDataByTimePoint.set(changedTimePointTime.timestamp, pointData);
        var seriesUpdates = new Map();
        var _loop_1 = function (index) {
            var timePoint = ensureDefined(this_1._private__timePointsByIndex.get(index));
            var currentIndexData = ensureDefined(this_1._private__pointDataByTimePoint.get(timePoint.timestamp));
            currentIndexData._internal_mapping.forEach(function (currentData, currentSeries) {
                if (!updateAllSeries && currentSeries !== series) {
                    return;
                }
                var getItemValues = seriesItemValueFn(currentSeries._internal_seriesType());
                var packet = seriesUpdates.get(currentSeries) || newSeriesUpdatePacket();
                var seriesUpdate = {
                    _internal_index: index,
                    _internal_time: timePoint,
                    _internal_value: getItemValues(currentData, currentSeries._internal_palette()),
                };
                packet._internal_update.push(seriesUpdate);
                seriesUpdates.set(currentSeries, packet);
            });
        };
        var this_1 = this;
        for (var index = pointData._internal_index; index < this._private__pointDataByTimePoint.size; ++index) {
            _loop_1(index);
        }
        var marks = newPoint ? this._private__generateMarksSinceIndex(pointData._internal_index) : [];
        var timePointChanges = newPoint ? this._private__sortedTimePoints.slice(pointData._internal_index) : [];
        var timeScaleUpdate = {
            _internal_seriesUpdates: seriesUpdates,
            _internal_changes: timePointChanges,
            _internal_index: pointData._internal_index,
            _internal_marks: marks,
        };
        return {
            _internal_timeScaleUpdate: timeScaleUpdate,
        };
    };
    DataLayer.prototype._private__setNewPoints = function (newPoints) {
        var _this = this;
        this._private__pointDataByTimePoint = newPoints;
        this._private__sortedTimePoints = Array.from(this._private__pointDataByTimePoint.values()).map(function (d) { return d._internal_timePoint; });
        this._private__sortedTimePoints.sort(function (t1, t2) { return t1.timestamp - t2.timestamp; });
        var seriesUpdates = new Map();
        this._private__sortedTimePoints.forEach(function (time, index) {
            var pointData = ensureDefined(_this._private__pointDataByTimePoint.get(time.timestamp));
            pointData._internal_index = index;
            pointData._internal_mapping.forEach(function (targetData, targetSeries) {
                // add point to series
                var getItemValues = seriesItemValueFn(targetSeries._internal_seriesType());
                var packet = seriesUpdates.get(targetSeries) || newSeriesUpdatePacket();
                var seriesUpdate = {
                    _internal_index: index,
                    _internal_time: time,
                    _internal_value: getItemValues(targetData, targetSeries._internal_palette()),
                };
                packet._internal_update.push(seriesUpdate);
                seriesUpdates.set(targetSeries, packet);
            });
        });
        var prevTime = null;
        var totalTimeDiff = 0;
        var marks = this._private__sortedTimePoints.map(function (time, index) {
            totalTimeDiff += time.timestamp - (prevTime || time.timestamp);
            var span = spanByTime(time.timestamp, prevTime);
            prevTime = time.timestamp;
            return {
                _internal_span: span,
                _internal_time: time,
                _internal_index: index,
            };
        });
        if (marks.length > 1) {
            // let's guess a span for the first mark
            // let's say the previous point was average time back in the history
            var averageTimeDiff = Math.ceil(totalTimeDiff / (marks.length - 1));
            var approxPrevTime = (marks[0]._internal_time.timestamp - averageTimeDiff);
            marks[0]._internal_span = spanByTime(marks[0]._internal_time.timestamp, approxPrevTime);
        }
        var timeScaleUpdate = {
            _internal_seriesUpdates: seriesUpdates,
            _internal_changes: this._private__sortedTimePoints.slice(),
            _internal_index: 0,
            _internal_marks: marks,
        };
        this._private__rebuildTimePointsByIndex();
        return {
            _internal_timeScaleUpdate: timeScaleUpdate,
        };
    };
    DataLayer.prototype._private__incrementIndicesFrom = function (index) {
        for (var indexToUpdate = this._private__timePointsByIndex.size - 1; indexToUpdate >= index; --indexToUpdate) {
            var timePoint = ensureDefined(this._private__timePointsByIndex.get(indexToUpdate));
            var updatedData = ensureDefined(this._private__pointDataByTimePoint.get(timePoint.timestamp));
            var newIndex = indexToUpdate + 1;
            updatedData._internal_index = newIndex;
            this._private__timePointsByIndex.delete(indexToUpdate);
            this._private__timePointsByIndex.set(newIndex, timePoint);
        }
    };
    DataLayer.prototype._private__rebuildTimePointsByIndex = function () {
        var _this = this;
        this._private__timePointsByIndex.clear();
        this._private__pointDataByTimePoint.forEach(function (data, timePoint) {
            _this._private__timePointsByIndex.set(data._internal_index, data._internal_timePoint);
        });
    };
    DataLayer.prototype._private__generateMarksSinceIndex = function (startIndex) {
        var _a;
        var result = [];
        var prevTime = ((_a = this._private__timePointsByIndex.get(startIndex - 1)) === null || _a === void 0 ? void 0 : _a.timestamp) || null;
        for (var index = startIndex; index < this._private__timePointsByIndex.size; ++index) {
            var time = ensureDefined(this._private__timePointsByIndex.get(index));
            var span = spanByTime(time.timestamp, prevTime);
            prevTime = time.timestamp;
            result.push({
                _internal_span: span,
                _internal_time: time,
                _internal_index: index,
            });
        }
        return result;
    };
    return DataLayer;
}());
export { DataLayer };
