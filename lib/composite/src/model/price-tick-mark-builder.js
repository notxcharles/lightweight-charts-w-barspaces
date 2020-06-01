import { min } from '../helpers/mathex';
import { PriceTickSpanCalculator } from './price-tick-span-calculator';
var TICK_DENSITY = 2.5;
var PriceTickMarkBuilder = /** @class */ (function () {
    function PriceTickMarkBuilder(priceScale, base, coordinateToLogicalFunc, logicalToCoordinateFunc) {
        this._marks = [];
        this._priceScale = priceScale;
        this._base = base;
        this._coordinateToLogicalFunc = coordinateToLogicalFunc;
        this._logicalToCoordinateFunc = logicalToCoordinateFunc;
    }
    PriceTickMarkBuilder.prototype.setBase = function (base) {
        if (base < 0) {
            throw new Error('base < 0');
        }
        this._base = base;
    };
    PriceTickMarkBuilder.prototype.tickSpan = function (high, low) {
        if (high < low) {
            throw new Error('high < low');
        }
        var scaleHeight = this._priceScale.height();
        var markHeight = this._tickMarkHeight();
        var maxTickSpan = (high - low) * markHeight / scaleHeight;
        var spanCalculator1 = new PriceTickSpanCalculator(this._base, [2, 2.5, 2]);
        var spanCalculator2 = new PriceTickSpanCalculator(this._base, [2, 2, 2.5]);
        var spanCalculator3 = new PriceTickSpanCalculator(this._base, [2.5, 2, 2]);
        var spans = [];
        spans.push(spanCalculator1.tickSpan(high, low, maxTickSpan));
        spans.push(spanCalculator2.tickSpan(high, low, maxTickSpan));
        spans.push(spanCalculator3.tickSpan(high, low, maxTickSpan));
        return min(spans);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    PriceTickMarkBuilder.prototype.rebuildTickMarks = function () {
        var priceScale = this._priceScale;
        var firstValue = priceScale.firstValue();
        if (firstValue === null) {
            this._marks = [];
            return;
        }
        var scaleHeight = priceScale.height();
        var bottom = this._coordinateToLogicalFunc(scaleHeight - 1, firstValue);
        var top = this._coordinateToLogicalFunc(0, firstValue);
        var extraTopBottomMargin = this._priceScale.options().entireTextOnly ? this._fontHeight() / 2 : 0;
        var minCoord = extraTopBottomMargin;
        var maxCoord = scaleHeight - 1 - extraTopBottomMargin;
        var high = Math.max(bottom, top);
        var low = Math.min(bottom, top);
        if (high === low) {
            this._marks = [];
            return;
        }
        var span = this.tickSpan(high, low);
        var mod = high % span;
        mod += mod < 0 ? span : 0;
        var sign = (high >= low) ? 1 : -1;
        var prevCoord = null;
        var targetIndex = 0;
        for (var logical = high - mod; logical > low; logical -= span) {
            var coord = this._logicalToCoordinateFunc(logical, firstValue, true);
            // check if there is place for it
            // this is required for log scale
            if (prevCoord !== null && Math.abs(coord - prevCoord) < this._tickMarkHeight()) {
                continue;
            }
            // check if a tick mark is partially visible and skip it if entireTextOnly is true
            if (coord < minCoord || coord > maxCoord) {
                continue;
            }
            if (targetIndex < this._marks.length) {
                this._marks[targetIndex].coord = coord;
                this._marks[targetIndex].label = priceScale.formatLogical(logical);
            }
            else {
                this._marks.push({
                    coord: coord,
                    label: priceScale.formatLogical(logical),
                });
            }
            targetIndex++;
            prevCoord = coord;
            if (priceScale.isLog()) {
                // recalc span
                span = this.tickSpan(logical * sign, low);
            }
        }
        this._marks.length = targetIndex;
    };
    PriceTickMarkBuilder.prototype.marks = function () {
        return this._marks;
    };
    PriceTickMarkBuilder.prototype._fontHeight = function () {
        return this._priceScale.fontSize();
    };
    PriceTickMarkBuilder.prototype._tickMarkHeight = function () {
        return Math.ceil(this._fontHeight() * TICK_DENSITY);
    };
    return PriceTickMarkBuilder;
}());
export { PriceTickMarkBuilder };
