import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var SeriesHorizontalBaseLinePaneView = /** @class */ (function (_super) {
    __extends(SeriesHorizontalBaseLinePaneView, _super);
    function SeriesHorizontalBaseLinePaneView(series) {
        return _super.call(this, series) || this;
    }
    SeriesHorizontalBaseLinePaneView.prototype._internal__updateImpl = function (height, width) {
        this._internal__lineRendererData._internal_visible = false;
        var priceScale = this._internal__series._internal_priceScale();
        var mode = priceScale._internal_mode()._internal_mode;
        if (mode !== 2 /* Percentage */ && mode !== 3 /* IndexedTo100 */) {
            return;
        }
        var seriesOptions = this._internal__series._internal_options();
        if (!seriesOptions.baseLineVisible) {
            return;
        }
        var firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return;
        }
        this._internal__lineRendererData._internal_visible = true;
        this._internal__lineRendererData._internal_y = priceScale._internal_priceToCoordinate(firstValue._internal_value, firstValue._internal_value);
        this._internal__lineRendererData._internal_width = width;
        this._internal__lineRendererData._internal_height = height;
        this._internal__lineRendererData._internal_color = seriesOptions.baseLineColor;
        this._internal__lineRendererData._internal_lineWidth = seriesOptions.baseLineWidth;
        this._internal__lineRendererData._internal_lineStyle = seriesOptions.baseLineStyle;
    };
    return SeriesHorizontalBaseLinePaneView;
}(SeriesHorizontalLinePaneView));
export { SeriesHorizontalBaseLinePaneView };
