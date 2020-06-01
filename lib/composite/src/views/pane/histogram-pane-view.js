import { __extends } from "tslib";
import { ensureNotNull } from '../../helpers/assertions';
import { visibleTimedValues } from '../../model/time-data';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererHistogram } from '../../renderers/histogram-renderer';
import { SeriesPaneViewBase } from './series-pane-view-base';
function createEmptyHistogramData(barSpacing) {
    return {
        items: [],
        barSpacing: barSpacing,
        histogramBase: NaN,
        visibleRange: null,
    };
}
function createRawItem(time, price, color) {
    return {
        time: time,
        price: price,
        x: NaN,
        y: NaN,
        color: color,
    };
}
var SeriesHistogramPaneView = /** @class */ (function (_super) {
    __extends(SeriesHistogramPaneView, _super);
    function SeriesHistogramPaneView(series, model) {
        var _this = _super.call(this, series, model, false) || this;
        _this._compositeRenderer = new CompositeRenderer();
        _this._histogramData = createEmptyHistogramData(0);
        _this._colorIndexes = new Int32Array(0);
        _this._renderer = new PaneRendererHistogram();
        return _this;
    }
    SeriesHistogramPaneView.prototype.renderer = function (height, width) {
        this._makeValid();
        return this._compositeRenderer;
    };
    SeriesHistogramPaneView.prototype._fillRawPoints = function () {
        var _this = this;
        var barSpacing = this._model.timeScale().barSpacing();
        var palette = this._series.palette();
        this._histogramData = createEmptyHistogramData(barSpacing);
        var barValueGetter = this._series.barFunction();
        this._colorIndexes = new Int32Array(this._series.bars().size());
        var targetColorIndex = 0;
        var targetIndex = 0;
        var itemIndex = 0;
        var defaultColor = this._series.options().color;
        this._series.bars().each(function (index, bar) {
            var value = barValueGetter(bar.value);
            var paletteColorIndex = bar.value[4 /* Color */];
            var color = paletteColorIndex != null ? palette.colorByIndex(paletteColorIndex) : defaultColor;
            var item = createRawItem(index, value, color);
            // colorIndex is the paneview's internal palette index
            // this internal palette stores defaultColor by 0 index and pallette colors by paletteColorIndex + 1
            var colorIndex = paletteColorIndex == null ? 0 : paletteColorIndex + 1;
            targetIndex++;
            if (targetIndex < _this._histogramData.items.length) {
                _this._histogramData.items[targetIndex] = item;
            }
            else {
                _this._histogramData.items.push(item);
            }
            _this._items[itemIndex++] = { time: index, x: 0 };
            _this._colorIndexes[targetColorIndex++] = colorIndex;
            return false;
        });
        this._renderer.setData(this._histogramData);
        this._compositeRenderer.setRenderers([this._renderer]);
    };
    SeriesHistogramPaneView.prototype._clearVisibleRange = function () {
        _super.prototype._clearVisibleRange.call(this);
        this._histogramData.visibleRange = null;
    };
    SeriesHistogramPaneView.prototype._convertToCoordinates = function (priceScale, timeScale, firstValue) {
        if (this._itemsVisibleRange === null) {
            return;
        }
        var barSpacing = timeScale.barSpacing();
        var visibleBars = ensureNotNull(timeScale.visibleStrictRange());
        var histogramBase = priceScale.priceToCoordinate(this._series.options().base, firstValue);
        timeScale.indexesToCoordinates(this._histogramData.items);
        priceScale.pointsArrayToCoordinates(this._histogramData.items, firstValue);
        this._histogramData.histogramBase = histogramBase;
        this._histogramData.visibleRange = visibleTimedValues(this._histogramData.items, visibleBars, false);
        this._histogramData.barSpacing = barSpacing;
        // need this to update cache
        this._renderer.setData(this._histogramData);
    };
    return SeriesHistogramPaneView;
}(SeriesPaneViewBase));
export { SeriesHistogramPaneView };
