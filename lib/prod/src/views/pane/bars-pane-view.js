import { __assign, __extends } from "tslib";
import { PaneRendererBars, } from '../../renderers/bars-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
var SeriesBarsPaneView = /** @class */ (function (_super) {
    __extends(SeriesBarsPaneView, _super);
    function SeriesBarsPaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._private__renderer = new PaneRendererBars();
        return _this;
    }
    SeriesBarsPaneView.prototype._internal_renderer = function (height, width) {
        this._internal__makeValid();
        var barStyleProps = this._internal__series._internal_options();
        var data = {
            _internal_bars: this._internal__items,
            _internal_barSpacing: this._internal__model._internal_timeScale()._internal_barSpacing(),
            _internal_openVisible: barStyleProps.openVisible,
            _internal_thinBars: barStyleProps.thinBars,
            _internal_visibleRange: this._internal__itemsVisibleRange,
        };
        this._private__renderer._internal_setData(data);
        return this._private__renderer;
    };
    SeriesBarsPaneView.prototype._internal__createRawItem = function (time, bar, colorer) {
        return __assign(__assign({}, this._internal__createDefaultItem(time, bar, colorer)), { _internal_color: colorer._internal_barStyle(time)._internal_barColor });
    };
    return SeriesBarsPaneView;
}(BarsPaneViewBase));
export { SeriesBarsPaneView };
