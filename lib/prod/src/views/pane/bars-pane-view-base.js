import { __extends } from "tslib";
import { undefinedIfNull } from '../../helpers/strict-type-checks';
import { SeriesPaneViewBase } from './series-pane-view-base';
var BarsPaneViewBase = /** @class */ (function (_super) {
    __extends(BarsPaneViewBase, _super);
    function BarsPaneViewBase(series, model) {
        return _super.call(this, series, model, false) || this;
    }
    BarsPaneViewBase.prototype._internal__convertToCoordinates = function (priceScale, timeScale, firstValue) {
        timeScale._internal_indexesToCoordinates(this._internal__items, undefinedIfNull(this._internal__itemsVisibleRange));
        priceScale._internal_barPricesToCoordinates(this._internal__items, firstValue, undefinedIfNull(this._internal__itemsVisibleRange));
    };
    BarsPaneViewBase.prototype._internal__createDefaultItem = function (time, bar, colorer) {
        return {
            _internal_time: time,
            open: bar._internal_value[0 /* Open */],
            high: bar._internal_value[1 /* High */],
            low: bar._internal_value[2 /* Low */],
            close: bar._internal_value[3 /* Close */],
            _internal_x: NaN,
            _internal_openY: NaN,
            _internal_highY: NaN,
            _internal_lowY: NaN,
            _internal_closeY: NaN,
        };
    };
    BarsPaneViewBase.prototype._internal__fillRawPoints = function () {
        var _this = this;
        var newItems = [];
        var colorer = this._internal__series._internal_barColorer();
        this._internal__series._internal_bars()._internal_each(function (index, bar) {
            var item = _this._internal__createRawItem(index, bar, colorer);
            newItems.push(item);
            return false;
        });
        this._internal__items = newItems;
    };
    return BarsPaneViewBase;
}(SeriesPaneViewBase));
export { BarsPaneViewBase };
