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
        _this._pane = null;
        _this._price = NaN;
        _this._index = 0;
        _this._visible = true;
        _this._priceAxisViews = new Map();
        _this._subscribed = false;
        _this._x = NaN;
        _this._y = NaN;
        _this._originX = NaN;
        _this._originY = NaN;
        _this._model = model;
        _this._options = options;
        _this._markersPaneView = new CrosshairMarksPaneView(model, _this);
        var valuePriceProvider = function (rawPriceProvider, rawCoordinateProvider) {
            return function (priceScale) {
                var coordinate = rawCoordinateProvider();
                var rawPrice = rawPriceProvider();
                if (priceScale === ensureNotNull(_this._pane).defaultPriceScale()) {
                    // price must be defined
                    return { price: rawPrice, coordinate: coordinate };
                }
                else {
                    // always convert from coordinate
                    var firstValue = ensureNotNull(priceScale.firstValue());
                    var price = priceScale.coordinateToPrice(coordinate, firstValue);
                    return { price: price, coordinate: coordinate };
                }
            };
        };
        var valueTimeProvider = function (rawIndexProvider, rawCoordinateProvider) {
            return function () {
                return {
                    time: _this._model.timeScale().indexToUserTime(rawIndexProvider()),
                    coordinate: rawCoordinateProvider(),
                };
            };
        };
        // for current position always return both price and coordinate
        _this._currentPosPriceProvider = valuePriceProvider(function () { return _this._price; }, function () { return _this._y; });
        var currentPosTimeProvider = valueTimeProvider(function () { return _this._index; }, function () { return _this.appliedX(); });
        _this._timeAxisView = new CrosshairTimeAxisView(_this, model, currentPosTimeProvider);
        _this._paneView = new CrosshairPaneView(_this);
        return _this;
    }
    Crosshair.prototype.index = function () {
        return this._index;
    };
    Crosshair.prototype.options = function () {
        return this._options;
    };
    Crosshair.prototype.saveOriginCoord = function (x, y) {
        this._originX = x;
        this._originY = y;
    };
    Crosshair.prototype.clearOriginCoord = function () {
        this._originX = NaN;
        this._originY = NaN;
    };
    Crosshair.prototype.originCoordX = function () {
        return this._originX;
    };
    Crosshair.prototype.originCoordY = function () {
        return this._originY;
    };
    Crosshair.prototype.setPosition = function (index, price, pane) {
        if (!this._subscribed) {
            this._subscribed = true;
        }
        this._visible = true;
        this._tryToUpdateViews(index, price, pane);
    };
    Crosshair.prototype.appliedIndex = function () {
        return this._index;
    };
    Crosshair.prototype.appliedX = function () {
        return this._x;
    };
    Crosshair.prototype.appliedY = function () {
        return this._y;
    };
    Crosshair.prototype.visible = function () {
        return this._visible;
    };
    Crosshair.prototype.clearPosition = function () {
        this._visible = false;
        this._setIndexToLastSeriesBarIndex();
        this._price = NaN;
        this._x = NaN;
        this._y = NaN;
        this._pane = null;
        this.clearOriginCoord();
    };
    Crosshair.prototype.paneViews = function (pane) {
        return this._pane !== null ? [this._paneView, this._markersPaneView] : [];
    };
    Crosshair.prototype.horzLineVisible = function (pane) {
        return pane === this._pane && this._options.horzLine.visible;
    };
    Crosshair.prototype.vertLineVisible = function () {
        return this._options.vertLine.visible;
    };
    Crosshair.prototype.priceAxisViews = function (pane, priceScale) {
        if (!this._visible || this._pane !== pane) {
            this._priceAxisViews.clear();
        }
        var views = [];
        if (this._pane === pane) {
            views.push(this._createPriceAxisViewOnDemand(this._priceAxisViews, priceScale, this._currentPosPriceProvider));
        }
        return views;
    };
    Crosshair.prototype.timeAxisViews = function () {
        return this._visible ? [this._timeAxisView] : [];
    };
    Crosshair.prototype.pane = function () {
        return this._pane;
    };
    Crosshair.prototype.updateAllViews = function () {
        this._priceAxisViews.forEach(function (value) { return value.update(); });
        this._timeAxisView.update();
        this._markersPaneView.update();
    };
    Crosshair.prototype._priceScaleByPane = function (pane) {
        if (pane && !pane.defaultPriceScale().isEmpty()) {
            return pane.defaultPriceScale();
        }
        return null;
    };
    Crosshair.prototype._tryToUpdateViews = function (index, price, pane) {
        if (this._tryToUpdateData(index, price, pane)) {
            this.updateAllViews();
        }
    };
    Crosshair.prototype._tryToUpdateData = function (newIndex, newPrice, newPane) {
        var oldX = this._x;
        var oldY = this._y;
        var oldPrice = this._price;
        var oldIndex = this._index;
        var oldPane = this._pane;
        var priceScale = this._priceScaleByPane(newPane);
        this._index = newIndex;
        this._x = isNaN(newIndex) ? NaN : this._model.timeScale().indexToCoordinate(newIndex);
        this._pane = newPane;
        var firstValue = priceScale !== null ? priceScale.firstValue() : null;
        if (priceScale !== null && firstValue !== null) {
            this._price = newPrice;
            this._y = priceScale.priceToCoordinate(newPrice, firstValue);
        }
        else {
            this._price = NaN;
            this._y = NaN;
        }
        return (oldX !== this._x || oldY !== this._y || oldIndex !== this._index ||
            oldPrice !== this._price || oldPane !== this._pane);
    };
    Crosshair.prototype._setIndexToLastSeriesBarIndex = function () {
        var lastIndexes = this._model.serieses()
            .map(function (s) { return s.bars().lastIndex(); })
            .filter(notNull);
        var lastBarIndex = (lastIndexes.length === 0) ? null : Math.max.apply(Math, lastIndexes);
        this._index = lastBarIndex !== null ? lastBarIndex : NaN;
    };
    Crosshair.prototype._createPriceAxisViewOnDemand = function (map, priceScale, valueProvider) {
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
