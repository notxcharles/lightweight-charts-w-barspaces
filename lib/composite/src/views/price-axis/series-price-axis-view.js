import { __extends } from "tslib";
import { generateTextColor } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var SeriesPriceAxisView = /** @class */ (function (_super) {
    __extends(SeriesPriceAxisView, _super);
    function SeriesPriceAxisView(source, data) {
        var _this = _super.call(this) || this;
        _this._source = source;
        _this._data = data;
        return _this;
    }
    SeriesPriceAxisView.prototype._getSource = function () {
        return this._source;
    };
    SeriesPriceAxisView.prototype._getData = function () {
        return this._data;
    };
    // tslint:disable-next-line:cyclomatic-complexity
    SeriesPriceAxisView.prototype._updateRendererData = function (axisRendererData, paneRendererData, commonRendererData) {
        axisRendererData.visible = false;
        paneRendererData.visible = false;
        var seriesOptions = this._source.options();
        var showSeriesLastValue = seriesOptions.lastValueVisible;
        var showSymbolLabel = this._source.title() !== '';
        var showPriceAndPercentage = seriesOptions.seriesLastValueMode === 0 /* LastPriceAndPercentageValue */;
        var lastValueData = this._source.lastValueData(undefined, false);
        if (lastValueData.noData) {
            return;
        }
        if (showSeriesLastValue) {
            axisRendererData.text = this._axisText(lastValueData, showSeriesLastValue, showPriceAndPercentage);
            axisRendererData.visible = axisRendererData.text.length !== 0;
        }
        if (showSymbolLabel || showPriceAndPercentage) {
            paneRendererData.text = this._paneText(lastValueData, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage);
            paneRendererData.visible = paneRendererData.text.length > 0;
        }
        commonRendererData.background = this._source.priceLineColor(lastValueData.color);
        commonRendererData.color = generateTextColor(commonRendererData.background);
        commonRendererData.coordinate = lastValueData.coordinate;
        paneRendererData.borderColor = this._source.model().options().layout.backgroundColor;
        axisRendererData.borderColor = commonRendererData.background;
    };
    SeriesPriceAxisView.prototype._paneText = function (lastValue, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage) {
        var result = '';
        var title = this._source.title();
        if (showSymbolLabel && title.length !== 0) {
            result += title + " ";
        }
        if (showSeriesLastValue && showPriceAndPercentage) {
            result += this._source.priceScale().isPercentage() ?
                lastValue.formattedPriceAbsolute : lastValue.formattedPricePercentage;
        }
        return result.trim();
    };
    SeriesPriceAxisView.prototype._axisText = function (lastValueData, showSeriesLastValue, showPriceAndPercentage) {
        if (!showSeriesLastValue) {
            return '';
        }
        if (!showPriceAndPercentage) {
            return lastValueData.text;
        }
        return this._source.priceScale().isPercentage() ?
            lastValueData.formattedPricePercentage : lastValueData.formattedPriceAbsolute;
    };
    return SeriesPriceAxisView;
}(PriceAxisView));
export { SeriesPriceAxisView };
