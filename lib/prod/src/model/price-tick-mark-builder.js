import { min } from '../helpers/mathex';
import { PriceTickSpanCalculator } from './price-tick-span-calculator';
var TICK_DENSITY = 2.5;
var PriceTickMarkBuilder = /** @class */ (function () {
    function PriceTickMarkBuilder(priceScale, base, coordinateToLogicalFunc, logicalToCoordinateFunc) {
        this._private__marks = [];
        this._private__priceScale = priceScale;
        this._private__base = base;
        this._private__coordinateToLogicalFunc = coordinateToLogicalFunc;
        this._private__logicalToCoordinateFunc = logicalToCoordinateFunc;
    }
    PriceTickMarkBuilder.prototype._internal_setBase = function (base) {
        if (base < 0) {
            throw new Error('base < 0');
        }
        this._private__base = base;
    };
    PriceTickMarkBuilder.prototype._internal_tickSpan = function (high, low) {
        if (high < low) {
            throw new Error('high < low');
        }
        var scaleHeight = this._private__priceScale._internal_height();
        var markHeight = this._private__tickMarkHeight();
        var maxTickSpan = (high - low) * markHeight / scaleHeight;
        var spanCalculator1 = new PriceTickSpanCalculator(this._private__base, [2, 2.5, 2]);
        var spanCalculator2 = new PriceTickSpanCalculator(this._private__base, [2, 2, 2.5]);
        var spanCalculator3 = new PriceTickSpanCalculator(this._private__base, [2.5, 2, 2]);
        var spans = [];
        spans.push(spanCalculator1._internal_tickSpan(high, low, maxTickSpan));
        spans.push(spanCalculator2._internal_tickSpan(high, low, maxTickSpan));
        spans.push(spanCalculator3._internal_tickSpan(high, low, maxTickSpan));
        return min(spans);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceTickMarkBuilder.prototype._internal_rebuildTickMarks = function () {
        var priceScale = this._private__priceScale;
        var firstValue = priceScale._internal_firstValue();
        if (firstValue === null) {
            this._private__marks = [];
            return;
        }
        var scaleHeight = priceScale._internal_height();
        var bottom = this._private__coordinateToLogicalFunc(scaleHeight - 1, firstValue);
        var top = this._private__coordinateToLogicalFunc(0, firstValue);
        var extraTopBottomMargin = this._private__priceScale._internal_options().entireTextOnly ? this._private__fontHeight() / 2 : 0;
        var minCoord = extraTopBottomMargin;
        var maxCoord = scaleHeight - 1 - extraTopBottomMargin;
        var high = Math.max(bottom, top);
        var low = Math.min(bottom, top);
        if (high === low) {
            this._private__marks = [];
            return;
        }
        var span = this._internal_tickSpan(high, low);
        var mod = high % span;
        mod += mod < 0 ? span : 0;
        var sign = (high >= low) ? 1 : -1;
        var prevCoord = null;
        var targetIndex = 0;
        for (var logical = high - mod; logical > low; logical -= span) {
            var coord = this._private__logicalToCoordinateFunc(logical, firstValue, true);
            // check if there is place for it
            // this is required for log scale
            if (prevCoord !== null && Math.abs(coord - prevCoord) < this._private__tickMarkHeight()) {
                continue;
            }
            // check if a tick mark is partially visible and skip it if entireTextOnly is true
            if (coord < minCoord || coord > maxCoord) {
                continue;
            }
            if (targetIndex < this._private__marks.length) {
                this._private__marks[targetIndex]._internal_coord = coord;
                this._private__marks[targetIndex]._internal_label = priceScale._internal_formatLogical(logical);
            }
            else {
                this._private__marks.push({
                    _internal_coord: coord,
                    _internal_label: priceScale._internal_formatLogical(logical),
                });
            }
            targetIndex++;
            prevCoord = coord;
            if (priceScale._internal_isLog()) {
                // recalc span
                span = this._internal_tickSpan(logical * sign, low);
            }
        }
        this._private__marks.length = targetIndex;
    };
    PriceTickMarkBuilder.prototype._internal_marks = function () {
        return this._private__marks;
    };
    PriceTickMarkBuilder.prototype._private__fontHeight = function () {
        return this._private__priceScale._internal_fontSize();
    };
    PriceTickMarkBuilder.prototype._private__tickMarkHeight = function () {
        return Math.ceil(this._private__fontHeight() * TICK_DENSITY);
    };
    return PriceTickMarkBuilder;
}());
export { PriceTickMarkBuilder };
