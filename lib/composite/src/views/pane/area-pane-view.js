import { __extends } from "tslib";
import { PaneRendererArea } from '../../renderers/area-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererLine } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
var SeriesAreaPaneView = /** @class */ (function (_super) {
    __extends(SeriesAreaPaneView, _super);
    function SeriesAreaPaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._renderer = new CompositeRenderer();
        _this._areaRenderer = new PaneRendererArea();
        _this._lineRenderer = new PaneRendererLine();
        _this._renderer.setRenderers([_this._areaRenderer, _this._lineRenderer]);
        return _this;
    }
    SeriesAreaPaneView.prototype.renderer = function (height, width) {
        this._makeValid();
        var areaStyleProperties = this._series.options();
        var data = {
            lineType: areaStyleProperties.lineType,
            items: this._items,
            lineColor: areaStyleProperties.lineColor,
            lineStyle: areaStyleProperties.lineStyle,
            lineWidth: areaStyleProperties.lineWidth,
            topColor: areaStyleProperties.topColor,
            bottomColor: areaStyleProperties.bottomColor,
            bottom: height,
            visibleRange: this._itemsVisibleRange,
        };
        this._areaRenderer.setData(data);
        this._lineRenderer.setData(data);
        return this._renderer;
    };
    SeriesAreaPaneView.prototype._createRawItem = function (time, price) {
        return this._createRawItemBase(time, price);
    };
    return SeriesAreaPaneView;
}(LinePaneViewBase));
export { SeriesAreaPaneView };
