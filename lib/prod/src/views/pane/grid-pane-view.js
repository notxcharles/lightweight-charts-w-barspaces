import { GridRenderer } from '../../renderers/grid-renderer';
var GridPaneView = /** @class */ (function () {
    function GridPaneView(pane) {
        this._private__renderer = new GridRenderer();
        this._private__invalidated = true;
        this._private__pane = pane;
    }
    GridPaneView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    GridPaneView.prototype._internal_renderer = function (height, width) {
        if (this._private__invalidated) {
            var gridOptions = this._private__pane._internal_model()._internal_options().grid;
            var data = {
                _internal_h: height,
                _internal_w: width,
                _internal_horzLinesVisible: gridOptions.horzLines.visible,
                _internal_vertLinesVisible: gridOptions.vertLines.visible,
                _internal_horzLinesColor: gridOptions.horzLines.color,
                _internal_vertLinesColor: gridOptions.vertLines.color,
                _internal_horzLineStyle: gridOptions.horzLines.style,
                _internal_vertLineStyle: gridOptions.vertLines.style,
                _internal_priceMarks: this._private__pane._internal_defaultPriceScale()._internal_marks(),
                _internal_timeMarks: this._private__pane._internal_model()._internal_timeScale()._internal_marks() || [],
            };
            this._private__renderer._internal_setData(data);
            this._private__invalidated = false;
        }
        return this._private__renderer;
    };
    return GridPaneView;
}());
export { GridPaneView };
