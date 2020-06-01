import { GridPaneView } from '../views/pane/grid-pane-view';
var Grid = /** @class */ (function () {
    function Grid() {
        this._private__paneViews = new WeakMap();
        this._private__invalidated = true;
    }
    Grid.prototype._internal_paneViews = function (pane) {
        var paneViews = this._private__paneViews.get(pane);
        if (paneViews === undefined) {
            paneViews = [new GridPaneView(pane)];
            this._private__paneViews.set(pane, paneViews);
        }
        if (this._private__invalidated) {
            paneViews.forEach(function (view) { return view._internal_update(); });
            this._private__invalidated = false;
        }
        return paneViews;
    };
    Grid.prototype._internal_invalidate = function () {
        this._private__invalidated = true;
    };
    return Grid;
}());
export { Grid };
