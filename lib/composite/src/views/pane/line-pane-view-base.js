import { __extends } from "tslib";
import { undefinedIfNull } from '../../helpers/strict-type-checks';
import { SeriesPaneViewBase } from './series-pane-view-base';
var LinePaneViewBase = /** @class */ (function (_super) {
    __extends(LinePaneViewBase, _super);
    function LinePaneViewBase(series, model) {
        return _super.call(this, series, model, true) || this;
    }
    LinePaneViewBase.prototype._convertToCoordinates = function (priceScale, timeScale, firstValue) {
        timeScale.indexesToCoordinates(this._items, undefinedIfNull(this._itemsVisibleRange));
        priceScale.pointsArrayToCoordinates(this._items, firstValue, undefinedIfNull(this._itemsVisibleRange));
    };
    LinePaneViewBase.prototype._createRawItemBase = function (time, price) {
        return {
            time: time,
            price: price,
            x: NaN,
            y: NaN,
        };
    };
    LinePaneViewBase.prototype._fillRawPoints = function () {
        var _this = this;
        var barValueGetter = this._series.barFunction();
        var newItems = [];
        var colorer = this._series.barColorer();
        this._series.bars().each(function (index, bar) {
            var value = barValueGetter(bar.value);
            var item = _this._createRawItem(index, value, colorer);
            newItems.push(item);
            return false;
        });
        this._items = newItems;
    };
    return LinePaneViewBase;
}(SeriesPaneViewBase));
export { LinePaneViewBase };
