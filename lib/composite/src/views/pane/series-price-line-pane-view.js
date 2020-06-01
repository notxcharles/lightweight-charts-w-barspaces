import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var SeriesPriceLinePaneView = /** @class */ (function (_super) {
    __extends(SeriesPriceLinePaneView, _super);
    function SeriesPriceLinePaneView(series) {
        return _super.call(this, series) || this;
    }
    SeriesPriceLinePaneView.prototype._updateImpl = function (height, width) {
        var data = this._lineRendererData;
        data.visible = false;
        var seriesOptions = this._series.options();
        if (!seriesOptions.priceLineVisible) {
            return;
        }
        var lastValueData = this._series.lastValueData(undefined, seriesOptions.priceLineSource === 0 /* LastBar */);
        if (lastValueData.noData) {
            return;
        }
        data.visible = true;
        data.y = lastValueData.coordinate;
        data.color = this._series.priceLineColor(lastValueData.color);
        data.width = width;
        data.height = height;
        data.lineWidth = seriesOptions.priceLineWidth;
        data.lineStyle = seriesOptions.priceLineStyle;
    };
    return SeriesPriceLinePaneView;
}(SeriesHorizontalLinePaneView));
export { SeriesPriceLinePaneView };
