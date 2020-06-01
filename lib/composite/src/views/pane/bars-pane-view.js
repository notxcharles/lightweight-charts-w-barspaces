import { __assign, __extends } from "tslib";
import { PaneRendererBars, } from '../../renderers/bars-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
var SeriesBarsPaneView = /** @class */ (function (_super) {
    __extends(SeriesBarsPaneView, _super);
    function SeriesBarsPaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._renderer = new PaneRendererBars();
        return _this;
    }
    SeriesBarsPaneView.prototype.renderer = function (height, width) {
        this._makeValid();
        var barStyleProps = this._series.options();
        var data = {
            bars: this._items,
            barSpacing: this._model.timeScale().barSpacing(),
            openVisible: barStyleProps.openVisible,
            thinBars: barStyleProps.thinBars,
            visibleRange: this._itemsVisibleRange,
        };
        this._renderer.setData(data);
        return this._renderer;
    };
    SeriesBarsPaneView.prototype._createRawItem = function (time, bar, colorer) {
        return __assign(__assign({}, this._createDefaultItem(time, bar, colorer)), { color: colorer.barStyle(time).barColor });
    };
    return SeriesBarsPaneView;
}(BarsPaneViewBase));
export { SeriesBarsPaneView };
