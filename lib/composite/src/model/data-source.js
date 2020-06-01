var DataSource = /** @class */ (function () {
    function DataSource() {
        this._priceScale = null;
        this._zorder = 0;
    }
    DataSource.prototype.zorder = function () {
        return this._zorder;
    };
    DataSource.prototype.setZorder = function (zorder) {
        this._zorder = zorder;
    };
    DataSource.prototype.priceScale = function () {
        return this._priceScale;
    };
    DataSource.prototype.setPriceScale = function (priceScale) {
        this._priceScale = priceScale;
    };
    DataSource.prototype.priceAxisViews = function (pane, priceScale) {
        return [];
    };
    DataSource.prototype.paneViews = function (pane) {
        return [];
    };
    DataSource.prototype.timeAxisViews = function () {
        return [];
    };
    return DataSource;
}());
export { DataSource };
