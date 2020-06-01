import { __extends } from "tslib";
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
var SeriesPriceLinePaneView = /** @class */ (function (_super) {
    __extends(SeriesPriceLinePaneView, _super);
    function SeriesPriceLinePaneView(series) {
        return _super.call(this, series) || this;
    }
    SeriesPriceLinePaneView.prototype._internal__updateImpl = function (height, width) {
        var data = this._internal__lineRendererData;
        data._internal_visible = false;
        var seriesOptions = this._internal__series._internal_options();
        if (!seriesOptions.priceLineVisible) {
            return;
        }
        var lastValueData = this._internal__series._internal_lastValueData(undefined, seriesOptions.priceLineSource === 0 /* LastBar */);
        if (lastValueData._internal_noData) {
            return;
        }
        data._internal_visible = true;
        data._internal_y = lastValueData._internal_coordinate;
        data._internal_color = this._internal__series._internal_priceLineColor(lastValueData._internal_color);
        data._internal_width = width;
        data._internal_height = height;
        data._internal_lineWidth = seriesOptions.priceLineWidth;
        data._internal_lineStyle = seriesOptions.priceLineStyle;
    };
    return SeriesPriceLinePaneView;
}(SeriesHorizontalLinePaneView));
export { SeriesPriceLinePaneView };
