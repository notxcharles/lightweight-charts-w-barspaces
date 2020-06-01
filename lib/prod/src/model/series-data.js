import { PlotList } from './plot-list';
;
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
        this._private__bars = new PlotList(seriesPlotFunctionMap());
    }
    SeriesData.prototype._internal_bars = function () {
        return this._private__bars;
    };
    SeriesData.prototype._internal_size = function () {
        return this._private__bars._internal_size();
    };
    SeriesData.prototype._internal_each = function (fun) {
        this._private__bars._internal_each(fun);
    };
    SeriesData.prototype._internal_clear = function () {
        this._private__bars._internal_clear();
    };
    SeriesData.prototype._internal_isEmpty = function () {
        return this._private__bars._internal_isEmpty();
    };
    SeriesData.prototype._internal_first = function () {
        return this._private__bars._internal_first();
    };
    SeriesData.prototype._internal_last = function () {
        return this._private__bars._internal_last();
    };
    SeriesData.prototype._internal_search = function (index, options) {
        return this._internal_bars()._internal_search(index, options);
    };
    SeriesData.prototype._internal_valueAt = function (index) {
        return this._internal_search(index);
    };
    return SeriesData;
}());
export { SeriesData };
