import { GridPaneView } from '../views/pane/grid-pane-view';
var Grid = /** @class */ (function () {
    function Grid() {
        this._paneViews = new WeakMap();
        this._invalidated = true;
    }
    Grid.prototype.paneViews = function (pane) {
        var paneViews = this._paneViews.get(pane);
        if (paneViews === undefined) {
            paneViews = [new GridPaneView(pane)];
            this._paneViews.set(pane, paneViews);
        }
        if (this._invalidated) {
            paneViews.forEach(function (view) { return view.update(); });
            this._invalidated = false;
        }
        return paneViews;
    };
    Grid.prototype.invalidate = function () {
        this._invalidated = true;
    };
    return Grid;
}());
export { Grid };
