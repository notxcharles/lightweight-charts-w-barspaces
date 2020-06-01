import { PlotList } from './plot-list';
/**
 * Plot's index in plot list tuple for series (or overlay study)
 * @see {Bar}
 */
export var SeriesPlotIndex;
(function (SeriesPlotIndex) {
    SeriesPlotIndex[SeriesPlotIndex["Open"] = 0] = "Open";
    SeriesPlotIndex[SeriesPlotIndex["High"] = 1] = "High";
    SeriesPlotIndex[SeriesPlotIndex["Low"] = 2] = "Low";
    SeriesPlotIndex[SeriesPlotIndex["Close"] = 3] = "Close";
    SeriesPlotIndex[SeriesPlotIndex["Color"] = 4] = "Color";
})(SeriesPlotIndex || (SeriesPlotIndex = {}));
/** @public */
var barFunctions = {
    open: function (bar) { return bar[0 /* Open */]; },
    high: function (bar) { return bar[1 /* High */]; },
    low: function (bar) { return bar[2 /* Low */]; },
    close: function (bar) { return bar[3 /* Close */]; },
    hl2: function (bar) {
        return (bar[1 /* High */] +
            bar[2 /* Low */]) / 2;
    },
    hlc3: function (bar) {
        return (bar[1 /* High */] +
            bar[2 /* Low */] +
            bar[3 /* Close */]) / 3;
    },
    ohlc4: function (bar) {
        return (bar[0 /* Open */] +
            bar[1 /* High */] +
            bar[2 /* Low */] +
            bar[3 /* Close */]) / 4;
    },
};
var seriesSource = ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'];
function seriesPlotFunctionMap() {
    var result = new Map();
    seriesSource.forEach(function (plot, index) {
        result.set(plot, barFunction(plot));
    });
    return result;
}
export function barFunction(priceSource) {
    return barFunctions[priceSource];
}
var SeriesData = /** @class */ (function () {
    function SeriesData() {
        this._bars = new PlotList(seriesPlotFunctionMap());
    }
    SeriesData.prototype.bars = function () {
        return this._bars;
    };
    SeriesData.prototype.size = function () {
        return this._bars.size();
    };
    SeriesData.prototype.each = function (fun) {
        this._bars.each(fun);
    };
    SeriesData.prototype.clear = function () {
        this._bars.clear();
    };
    SeriesData.prototype.isEmpty = function () {
        return this._bars.isEmpty();
    };
    SeriesData.prototype.first = function () {
        return this._bars.first();
    };
    SeriesData.prototype.last = function () {
        return this._bars.last();
    };
    SeriesData.prototype.search = function (index, options) {
        return this.bars().search(index, options);
    };
    SeriesData.prototype.valueAt = function (index) {
        return this.search(index);
    };
    return SeriesData;
}());
export { SeriesData };
