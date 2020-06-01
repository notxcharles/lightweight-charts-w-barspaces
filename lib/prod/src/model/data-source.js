var DataSource = /** @class */ (function () {
    function DataSource() {
        this._internal__priceScale = null;
        this._private__zorder = 0;
    }
    DataSource.prototype._internal_zorder = function () {
        return this._private__zorder;
    };
    DataSource.prototype._internal_setZorder = function (zorder) {
        this._private__zorder = zorder;
    };
    DataSource.prototype._internal_priceScale = function () {
        return this._internal__priceScale;
    };
    DataSource.prototype._internal_setPriceScale = function (priceScale) {
        this._internal__priceScale = priceScale;
    };
    DataSource.prototype._internal_priceAxisViews = function (pane, priceScale) {
        return [];
    };
    DataSource.prototype._internal_paneViews = function (pane) {
        return [];
    };
    DataSource.prototype._internal_timeAxisViews = function () {
        return [];
    };
    return DataSource;
}());
export { DataSource };
