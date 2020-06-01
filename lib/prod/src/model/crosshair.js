import { __extends } from "tslib";
import { ensureNotNull } from '../helpers/assertions';
import { notNull } from '../helpers/strict-type-checks';
import { CrosshairMarksPaneView } from '../views/pane/crosshair-marks-pane-view';
import { CrosshairPaneView } from '../views/pane/crosshair-pane-view';
import { CrosshairPriceAxisView } from '../views/price-axis/crosshair-price-axis-view';
import { CrosshairTimeAxisView } from '../views/time-axis/crosshair-time-axis-view';
import { DataSource } from './data-source';
/**
 * Enum of possible crosshair behavior modes.
 * Normal means that the crosshair always follows the pointer.
 * Magnet means that the vertical line of the crosshair follows the pointer, while the horizontal line is placed on the corresponding series point.
 */
export var CrosshairMode;
(function (CrosshairMode) {
    CrosshairMode[CrosshairMode["Normal"] = 0] = "Normal";
    CrosshairMode[CrosshairMode["Magnet"] = 1] = "Magnet";
})(CrosshairMode || (CrosshairMode = {}));
var Crosshair = /** @class */ (function (_super) {
    __extends(Crosshair, _super);
    function Crosshair(model, options) {
        var _this = _super.call(this) || this;
        _this._private__pane = null;
        _this._private__price = NaN;
        _this._private__index = 0;
        _this._private__visible = true;
        _this._private__priceAxisViews = new Map();
        _this._private__subscribed = false;
        _this._private__x = NaN;
        _this._private__y = NaN;
        _this._private__originX = NaN;
        _this._private__originY = NaN;
        _this._private__model = model;
        _this._private__options = options;
        _this._private__markersPaneView = new CrosshairMarksPaneView(model, _this);
        var valuePriceProvider = function (rawPriceProvider, rawCoordinateProvider) {
            return function (priceScale) {
                var coordinate = rawCoordinateProvider();
                var rawPrice = rawPriceProvider();
                if (priceScale === ensureNotNull(_this._private__pane)._internal_defaultPriceScale()) {
                    // price must be defined
                    return { _internal_price: rawPrice, _internal_coordinate: coordinate };
                }
                else {
                    // always convert from coordinate
                    var firstValue = ensureNotNull(priceScale._internal_firstValue());
                    var price = priceScale._internal_coordinateToPrice(coordinate, firstValue);
                    return { _internal_price: price, _internal_coordinate: coordinate };
                }
            };
        };
        var valueTimeProvider = function (rawIndexProvider, rawCoordinateProvider) {
            return function () {
                return {
                    _internal_time: _this._private__model._internal_timeScale()._internal_indexToUserTime(rawIndexProvider()),
                    _internal_coordinate: rawCoordinateProvider(),
                };
            };
        };
        // for current position always return both price and coordinate
        _this._private__currentPosPriceProvider = valuePriceProvider(function () { return _this._private__price; }, function () { return _this._private__y; });
        var currentPosTimeProvider = valueTimeProvider(function () { return _this._private__index; }, function () { return _this._internal_appliedX(); });
        _this._private__timeAxisView = new CrosshairTimeAxisView(_this, model, currentPosTimeProvider);
        _this._private__paneView = new CrosshairPaneView(_this);
        return _this;
    }
    Crosshair.prototype._internal_index = function () {
        return this._private__index;
    };
    Crosshair.prototype._internal_options = function () {
        return this._private__options;
    };
    Crosshair.prototype._internal_saveOriginCoord = function (x, y) {
        this._private__originX = x;
        this._private__originY = y;
    };
    Crosshair.prototype._internal_clearOriginCoord = function () {
        this._private__originX = NaN;
        this._private__originY = NaN;
    };
    Crosshair.prototype._internal_originCoordX = function () {
        return this._private__originX;
    };
    Crosshair.prototype._internal_originCoordY = function () {
        return this._private__originY;
    };
    Crosshair.prototype._internal_setPosition = function (index, price, pane) {
        if (!this._private__subscribed) {
            this._private__subscribed = true;
        }
        this._private__visible = true;
        this._private__tryToUpdateViews(index, price, pane);
    };
    Crosshair.prototype._internal_appliedIndex = function () {
        return this._private__index;
    };
    Crosshair.prototype._internal_appliedX = function () {
        return this._private__x;
    };
    Crosshair.prototype._internal_appliedY = function () {
        return this._private__y;
    };
    Crosshair.prototype._internal_visible = function () {
        return this._private__visible;
    };
    Crosshair.prototype._internal_clearPosition = function () {
        this._private__visible = false;
        this._private__setIndexToLastSeriesBarIndex();
        this._private__price = NaN;
        this._private__x = NaN;
        this._private__y = NaN;
        this._private__pane = null;
        this._internal_clearOriginCoord();
    };
    Crosshair.prototype._internal_paneViews = function (pane) {
        return this._private__pane !== null ? [this._private__paneView, this._private__markersPaneView] : [];
    };
    Crosshair.prototype._internal_horzLineVisible = function (pane) {
        return pane === this._private__pane && this._private__options.horzLine.visible;
    };
    Crosshair.prototype._internal_vertLineVisible = function () {
        return this._private__options.vertLine.visible;
    };
    Crosshair.prototype._internal_priceAxisViews = function (pane, priceScale) {
        if (!this._private__visible || this._private__pane !== pane) {
            this._private__priceAxisViews.clear();
        }
        var views = [];
        if (this._private__pane === pane) {
            views.push(this._private__createPriceAxisViewOnDemand(this._private__priceAxisViews, priceScale, this._private__currentPosPriceProvider));
        }
        return views;
    };
    Crosshair.prototype._internal_timeAxisViews = function () {
        return this._private__visible ? [this._private__timeAxisView] : [];
    };
    Crosshair.prototype._internal_pane = function () {
        return this._private__pane;
    };
    Crosshair.prototype._internal_updateAllViews = function () {
        this._private__priceAxisViews.forEach(function (value) { return value._internal_update(); });
        this._private__timeAxisView._internal_update();
        this._private__markersPaneView._internal_update();
    };
    Crosshair.prototype._private__priceScaleByPane = function (pane) {
        if (pane && !pane._internal_defaultPriceScale()._internal_isEmpty()) {
            return pane._internal_defaultPriceScale();
        }
        return null;
    };
    Crosshair.prototype._private__tryToUpdateViews = function (index, price, pane) {
        if (this._private__tryToUpdateData(index, price, pane)) {
            this._internal_updateAllViews();
        }
    };
    Crosshair.prototype._private__tryToUpdateData = function (newIndex, newPrice, newPane) {
        var oldX = this._private__x;
        var oldY = this._private__y;
        var oldPrice = this._private__price;
        var oldIndex = this._private__index;
        var oldPane = this._private__pane;
        var priceScale = this._private__priceScaleByPane(newPane);
        this._private__index = newIndex;
        this._private__x = isNaN(newIndex) ? NaN : this._private__model._internal_timeScale()._internal_indexToCoordinate(newIndex);
        this._private__pane = newPane;
        var firstValue = priceScale !== null ? priceScale._internal_firstValue() : null;
        if (priceScale !== null && firstValue !== null) {
            this._private__price = newPrice;
            this._private__y = priceScale._internal_priceToCoordinate(newPrice, firstValue);
        }
        else {
            this._private__price = NaN;
            this._private__y = NaN;
        }
        return (oldX !== this._private__x || oldY !== this._private__y || oldIndex !== this._private__index ||
            oldPrice !== this._private__price || oldPane !== this._private__pane);
    };
    Crosshair.prototype._private__setIndexToLastSeriesBarIndex = function () {
        var lastIndexes = this._private__model._internal_serieses()
            .map(function (s) { return s._internal_bars()._internal_lastIndex(); })
            .filter(notNull);
        var lastBarIndex = (lastIndexes.length === 0) ? null : Math.max.apply(Math, lastIndexes);
        this._private__index = lastBarIndex !== null ? lastBarIndex : NaN;
    };
    Crosshair.prototype._private__createPriceAxisViewOnDemand = function (map, priceScale, valueProvider) {
        var view = map.get(priceScale);
        if (view === undefined) {
            view = new CrosshairPriceAxisView(this, priceScale, valueProvider);
            map.set(priceScale, view);
        }
        return view;
    };
    return Crosshair;
}(DataSource));
export { Crosshair };
