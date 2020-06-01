import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var SeriesHorizontalBaseLinePaneView = /** @class */ (function (_super) {
    __extends(SeriesHorizontalBaseLinePaneView, _super);
    function SeriesHorizontalBaseLinePaneView(series) {
        return _super.call(this, series) || this;
    }
    SeriesHorizontalBaseLinePaneView.prototype._updateImpl = function (height, width) {
        this._lineRendererData.visible = false;
        var priceScale = this._series.priceScale();
        var mode = priceScale.mode().mode;
        if (mode !== 2 /* Percentage */ && mode !== 3 /* IndexedTo100 */) {
            return;
        }
        var seriesOptions = this._series.options();
        if (!seriesOptions.baseLineVisible) {
            return;
        }
        var firstValue = this._series.firstValue();
        if (firstValue === null) {
            return;
        }
        this._lineRendererData.visible = true;
        this._lineRendererData.y = priceScale.priceToCoordinate(firstValue.value, firstValue.value);
        this._lineRendererData.width = width;
        this._lineRendererData.height = height;
        this._lineRendererData.color = seriesOptions.baseLineColor;
        this._lineRendererData.lineWidth = seriesOptions.baseLineWidth;
        this._lineRendererData.lineStyle = seriesOptions.baseLineStyle;
    };
    return SeriesHorizontalBaseLinePaneView;
}(SeriesHorizontalLinePaneView));
export { SeriesHorizontalBaseLinePaneView };
