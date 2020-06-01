import { GridRenderer } from '../../renderers/grid-renderer';
var GridPaneView = /** @class */ (function () {
    function GridPaneView(pane) {
        this._renderer = new GridRenderer();
        this._invalidated = true;
        this._pane = pane;
    }
    GridPaneView.prototype.update = function () {
        this._invalidated = true;
    };
    GridPaneView.prototype.renderer = function (height, width) {
        if (this._invalidated) {
            var gridOptions = this._pane.model().options().grid;
            var data = {
                h: height,
                w: width,
                horzLinesVisible: gridOptions.horzLines.visible,
                vertLinesVisible: gridOptions.vertLines.visible,
                horzLinesColor: gridOptions.horzLines.color,
                vertLinesColor: gridOptions.vertLines.color,
                horzLineStyle: gridOptions.horzLines.style,
                vertLineStyle: gridOptions.vertLines.style,
                priceMarks: this._pane.defaultPriceScale().marks(),
                timeMarks: this._pane.model().timeScale().marks() || [],
            };
            this._renderer.setData(data);
            this._invalidated = false;
        }
        return this._renderer;
    };
    return GridPaneView;
}());
export { GridPaneView };
