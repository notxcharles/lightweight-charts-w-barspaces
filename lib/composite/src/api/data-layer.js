/// <reference types="_build-time-constants" />
import { upperbound } from '../helpers/algorithms';
import { ensureDefined, ensureNotNull } from '../helpers/assertions';
import { isString } from '../helpers/strict-type-checks';
import { isBusinessDay, isUTCTimestamp, } from './data-consumer';
function newSeriesUpdatePacket() {
    return {
        update: [],
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
            color = palette.addColor(item.color);
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
        divisor: 1, span: 20,
    },
    {
        divisor: seconds(1), span: 19,
    },
    {
        divisor: minutes(1), span: 20,
    },
    {
        divisor: minutes(5), span: 21,
    },
    {
        divisor: minutes(30), span: 22,
    },
    {
        divisor: hours(1), span: 30,
    },
    {
        divisor: hours(3), span: 31,
    },
    {
        divisor: hours(6), span: 32,
    },
    {
        divisor: hours(12), span: 33,
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
            if (Math.floor(lastTime.getTime() / spanDivisors[i].divisor) !== Math.floor(currentTime.getTime() / spanDivisors[i].divisor)) {
                return spanDivisors[i].span;
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
        this._pointDataByTimePoint = new Map();
        this._timePointsByIndex = new Map();
        this._sortedTimePoints = [];
    }
    DataLayer.prototype.destroy = function () {
        this._pointDataByTimePoint.clear();
        this._timePointsByIndex.clear();
        this._sortedTimePoints = [];
    };
    DataLayer.prototype.setSeriesData = function (series, data) {
        var _this = this;
        series.clearData();
        convertStringsToBusinessDays(data);
        this._pointDataByTimePoint.forEach(function (value) { return value.mapping.delete(series); });
        var timeConverter = selectTimeConverter(data);
        if (timeConverter !== null) {
            data.forEach(function (item) {
                var time = timeConverter(item.time);
                var timePointData = _this._pointDataByTimePoint.get(time.timestamp) ||
                    { index: 0, mapping: new Map(), timePoint: time };
                timePointData.mapping.set(series, item);
                _this._pointDataByTimePoint.set(time.timestamp, timePointData);
            });
        }
        // remove from points items without series
        var newPoints = new Map();
        this._pointDataByTimePoint.forEach(function (pointData, key) {
            if (pointData.mapping.size > 0) {
                newPoints.set(key, pointData);
            }
        });
        return this._setNewPoints(newPoints);
    };
    DataLayer.prototype.removeSeries = function (series) {
        return this.setSeriesData(series, []);
    };
    DataLayer.prototype.updateSeriesData = function (series, data) {
        // check types
        convertStringToBusinessDay(data);
        var bars = series.data().bars();
        if (bars.size() > 0) {
            var lastTime = ensureNotNull(bars.last()).time;
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
        var pointData = this._pointDataByTimePoint.get(changedTimePointTime.timestamp) ||
            { index: 0, mapping: new Map(), timePoint: changedTimePointTime };
        var newPoint = pointData.mapping.size === 0;
        pointData.mapping.set(series, data);
        var updateAllSeries = false;
        if (newPoint) {
            var index = this._pointDataByTimePoint.size;
            if (this._sortedTimePoints.length > 0 && this._sortedTimePoints[this._sortedTimePoints.length - 1].timestamp > changedTimePointTime.timestamp) {
                // new point in the middle
                index = upperbound(this._sortedTimePoints, changedTimePointTime, compareTimePoints);
                this._sortedTimePoints.splice(index, 0, changedTimePointTime);
                this._incrementIndicesFrom(index);
                updateAllSeries = true;
            }
            else {
                // new point in the end
                this._sortedTimePoints.push(changedTimePointTime);
            }
            pointData.index = index;
            this._timePointsByIndex.set(pointData.index, changedTimePointTime);
        }
        this._pointDataByTimePoint.set(changedTimePointTime.timestamp, pointData);
        var seriesUpdates = new Map();
        var _loop_1 = function (index) {
            var timePoint = ensureDefined(this_1._timePointsByIndex.get(index));
            var currentIndexData = ensureDefined(this_1._pointDataByTimePoint.get(timePoint.timestamp));
            currentIndexData.mapping.forEach(function (currentData, currentSeries) {
                if (!updateAllSeries && currentSeries !== series) {
                    return;
                }
                var getItemValues = seriesItemValueFn(currentSeries.seriesType());
                var packet = seriesUpdates.get(currentSeries) || newSeriesUpdatePacket();
                var seriesUpdate = {
                    index: index,
                    time: timePoint,
                    value: getItemValues(currentData, currentSeries.palette()),
                };
                packet.update.push(seriesUpdate);
                seriesUpdates.set(currentSeries, packet);
            });
        };
        var this_1 = this;
        for (var index = pointData.index; index < this._pointDataByTimePoint.size; ++index) {
            _loop_1(index);
        }
        var marks = newPoint ? this._generateMarksSinceIndex(pointData.index) : [];
        var timePointChanges = newPoint ? this._sortedTimePoints.slice(pointData.index) : [];
        var timeScaleUpdate = {
            seriesUpdates: seriesUpdates,
            changes: timePointChanges,
            index: pointData.index,
            marks: marks,
        };
        return {
            timeScaleUpdate: timeScaleUpdate,
        };
    };
    DataLayer.prototype._setNewPoints = function (newPoints) {
        var _this = this;
        this._pointDataByTimePoint = newPoints;
        this._sortedTimePoints = Array.from(this._pointDataByTimePoint.values()).map(function (d) { return d.timePoint; });
        this._sortedTimePoints.sort(function (t1, t2) { return t1.timestamp - t2.timestamp; });
        var seriesUpdates = new Map();
        this._sortedTimePoints.forEach(function (time, index) {
            var pointData = ensureDefined(_this._pointDataByTimePoint.get(time.timestamp));
            pointData.index = index;
            pointData.mapping.forEach(function (targetData, targetSeries) {
                // add point to series
                var getItemValues = seriesItemValueFn(targetSeries.seriesType());
                var packet = seriesUpdates.get(targetSeries) || newSeriesUpdatePacket();
                var seriesUpdate = {
                    index: index,
                    time: time,
                    value: getItemValues(targetData, targetSeries.palette()),
                };
                packet.update.push(seriesUpdate);
                seriesUpdates.set(targetSeries, packet);
            });
        });
        var prevTime = null;
        var totalTimeDiff = 0;
        var marks = this._sortedTimePoints.map(function (time, index) {
            totalTimeDiff += time.timestamp - (prevTime || time.timestamp);
            var span = spanByTime(time.timestamp, prevTime);
            prevTime = time.timestamp;
            return {
                span: span,
                time: time,
                index: index,
            };
        });
        if (marks.length > 1) {
            // let's guess a span for the first mark
            // let's say the previous point was average time back in the history
            var averageTimeDiff = Math.ceil(totalTimeDiff / (marks.length - 1));
            var approxPrevTime = (marks[0].time.timestamp - averageTimeDiff);
            marks[0].span = spanByTime(marks[0].time.timestamp, approxPrevTime);
        }
        var timeScaleUpdate = {
            seriesUpdates: seriesUpdates,
            changes: this._sortedTimePoints.slice(),
            index: 0,
            marks: marks,
        };
        this._rebuildTimePointsByIndex();
        return {
            timeScaleUpdate: timeScaleUpdate,
        };
    };
    DataLayer.prototype._incrementIndicesFrom = function (index) {
        for (var indexToUpdate = this._timePointsByIndex.size - 1; indexToUpdate >= index; --indexToUpdate) {
            var timePoint = ensureDefined(this._timePointsByIndex.get(indexToUpdate));
            var updatedData = ensureDefined(this._pointDataByTimePoint.get(timePoint.timestamp));
            var newIndex = indexToUpdate + 1;
            updatedData.index = newIndex;
            this._timePointsByIndex.delete(indexToUpdate);
            this._timePointsByIndex.set(newIndex, timePoint);
        }
    };
    DataLayer.prototype._rebuildTimePointsByIndex = function () {
        var _this = this;
        this._timePointsByIndex.clear();
        this._pointDataByTimePoint.forEach(function (data, timePoint) {
            _this._timePointsByIndex.set(data.index, data.timePoint);
        });
    };
    DataLayer.prototype._generateMarksSinceIndex = function (startIndex) {
        var _a;
        var result = [];
        var prevTime = ((_a = this._timePointsByIndex.get(startIndex - 1)) === null || _a === void 0 ? void 0 : _a.timestamp) || null;
        for (var index = startIndex; index < this._timePointsByIndex.size; ++index) {
            var time = ensureDefined(this._timePointsByIndex.get(index));
            var span = spanByTime(time.timestamp, prevTime);
            prevTime = time.timestamp;
            result.push({
                span: span,
                time: time,
                index: index,
            });
        }
        return result;
    };
    return DataLayer;
}());
export { DataLayer };
