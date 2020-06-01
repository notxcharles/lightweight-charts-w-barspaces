import { ensure } from '../helpers/assertions';
import { Series } from './series';
var Magnet = /** @class */ (function () {
    function Magnet(options) {
        this._options = options;
    }
    Magnet.prototype.align = function (price, index, pane) {
        var res = price;
        if (this._options.mode === 0 /* Normal */) {
            return res;
        }
        var defaultPriceScale = pane.defaultPriceScale();
        var firstValue = defaultPriceScale.firstValue();
        if (firstValue === null) {
            return res;
        }
        var y = defaultPriceScale.priceToCoordinate(price, firstValue);
        // get all serieses from the pane
        var serieses = pane.dataSources().filter((function (ds) { return (ds instanceof Series); }));
        var candidates = serieses.reduce(function (acc, series) {
            if (pane.isOverlay(series)) {
                return acc;
            }
            var ps = series.priceScale();
            var bars = series.bars();
            if (ps.isEmpty() || !bars.contains(index)) {
                return acc;
            }
            var bar = bars.valueAt(index);
            if (bar === null) {
                return acc;
            }
            var prices = [
                bar.value[3 /* Close */],
            ];
            // convert bar to pixels
            var firstPrice = ensure(series.firstValue());
            return acc.concat(prices.map(function (barPrice) { return ps.priceToCoordinate(barPrice, firstPrice.value); }));
        }, []);
        if (candidates.length === 0) {
            return res;
        }
        candidates.sort(function (y1, y2) { return Math.abs(y1 - y) - Math.abs(y2 - y); });
        var nearest = candidates[0];
        res = defaultPriceScale.coordinateToPrice(nearest, firstValue);
        return res;
    };
    return Magnet;
}());
export { Magnet };
