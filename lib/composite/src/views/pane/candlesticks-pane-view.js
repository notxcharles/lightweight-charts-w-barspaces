import { __assign, __extends } from "tslib";
import { PaneRendererCandlesticks, } from '../../renderers/candlesticks-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
var SeriesCandlesticksPaneView = /** @class */ (function (_super) {
    __extends(SeriesCandlesticksPaneView, _super);
    function SeriesCandlesticksPaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._renderer = new PaneRendererCandlesticks();
        return _this;
    }
    SeriesCandlesticksPaneView.prototype.renderer = function (height, width) {
        this._makeValid();
        var candlestickStyleProps = this._series.options();
        var data = {
            bars: this._items,
            barSpacing: this._model.timeScale().barSpacing(),
            wickVisible: candlestickStyleProps.wickVisible,
            borderVisible: candlestickStyleProps.borderVisible,
            visibleRange: this._itemsVisibleRange,
        };
        this._renderer.setData(data);
        return this._renderer;
    };
    SeriesCandlesticksPaneView.prototype._createRawItem = function (time, bar, colorer) {
        var style = colorer.barStyle(time);
        return __assign(__assign({}, this._createDefaultItem(time, bar, colorer)), { color: style.barColor, wickColor: style.barWickColor, borderColor: style.barBorderColor });
    };
    return SeriesCandlesticksPaneView;
}(BarsPaneViewBase));
export { SeriesCandlesticksPaneView };
