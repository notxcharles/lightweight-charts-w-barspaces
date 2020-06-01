import { ensure } from '../helpers/assertions';
import { Series } from './series';
var Magnet = /** @class */ (function () {
    function Magnet(options) {
        this._private__options = options;
    }
    Magnet.prototype._internal_align = function (price, index, pane) {
        var res = price;
        if (this._private__options.mode === 0 /* Normal */) {
            return res;
        }
        var defaultPriceScale = pane._internal_defaultPriceScale();
        var firstValue = defaultPriceScale._internal_firstValue();
        if (firstValue === null) {
            return res;
        }
        var y = defaultPriceScale._internal_priceToCoordinate(price, firstValue);
        // get all serieses from the pane
        var serieses = pane._internal_dataSources().filter((function (ds) { return (ds instanceof Series); }));
        var candidates = serieses.reduce(function (acc, series) {
            if (pane._internal_isOverlay(series)) {
                return acc;
            }
            var ps = series._internal_priceScale();
            var bars = series._internal_bars();
            if (ps._internal_isEmpty() || !bars._internal_contains(index)) {
                return acc;
            }
            var bar = bars._internal_valueAt(index);
            if (bar === null) {
                return acc;
            }
            var prices = [
                bar._internal_value[3 /* Close */],
            ];
            // convert bar to pixels
            var firstPrice = ensure(series._internal_firstValue());
            return acc.concat(prices.map(function (barPrice) { return ps._internal_priceToCoordinate(barPrice, firstPrice._internal_value); }));
        }, []);
        if (candidates.length === 0) {
            return res;
        }
        candidates.sort(function (y1, y2) { return Math.abs(y1 - y) - Math.abs(y2 - y); });
        var nearest = candidates[0];
        res = defaultPriceScale._internal_coordinateToPrice(nearest, firstValue);
        return res;
    };
    return Magnet;
}());
export { Magnet };
