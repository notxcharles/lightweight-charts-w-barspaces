import { generateTextColor } from '../../helpers/color';
import { PriceAxisViewRenderer } from '../../renderers/price-axis-view-renderer';
var PriceAxisView = /** @class */ (function () {
    function PriceAxisView(ctor) {
        this._private__commonRendererData = {
            _internal_coordinate: 0,
            _internal_color: '#FFF',
            _internal_background: '#000',
        };
        this._private__axisRendererData = {
            _internal_text: '',
            _internal_visible: false,
            _internal_tickVisible: true,
            _internal_borderColor: '',
        };
        this._private__paneRendererData = {
            _internal_text: '',
            _internal_visible: false,
            _internal_tickVisible: false,
            _internal_borderColor: '',
        };
        this._private__invalidated = true;
        this._private__axisRenderer = new (ctor || PriceAxisViewRenderer)(this._private__axisRendererData, this._private__commonRendererData);
        this._private__paneRenderer = new (ctor || PriceAxisViewRenderer)(this._private__paneRendererData, this._private__commonRendererData);
    }
    PriceAxisView.prototype._internal_text = function () {
        return this._private__axisRendererData._internal_text;
    };
    PriceAxisView.prototype._internal_background = function () {
        return this._private__commonRendererData._internal_background;
    };
    PriceAxisView.prototype._internal_color = function () {
        return generateTextColor(this._internal_background());
    };
    PriceAxisView.prototype._internal_coordinate = function () {
        this._private__updateRendererDataIfNeeded();
        return this._private__commonRendererData._internal_coordinate;
    };
    PriceAxisView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    PriceAxisView.prototype._internal_height = function (rendererOptions, useSecondLine) {
        if (useSecondLine === void 0) { useSecondLine = false; }
        return Math.max(this._private__axisRenderer._internal_height(rendererOptions, useSecondLine), this._private__paneRenderer._internal_height(rendererOptions, useSecondLine));
    };
    PriceAxisView.prototype._internal_getFixedCoordinate = function () {
        return this._private__commonRendererData._internal_fixedCoordinate || 0;
    };
    PriceAxisView.prototype._internal_setFixedCoordinate = function (value) {
        this._private__commonRendererData._internal_fixedCoordinate = value;
    };
    PriceAxisView.prototype._internal_isVisible = function () {
        this._private__updateRendererDataIfNeeded();
        return this._private__axisRendererData._internal_visible || this._private__paneRendererData._internal_visible;
    };
    PriceAxisView.prototype._internal_isAxisLabelVisible = function () {
        this._private__updateRendererDataIfNeeded();
        return this._private__axisRendererData._internal_visible;
    };
    PriceAxisView.prototype._internal_isPaneLabelVisible = function () {
        this._private__updateRendererDataIfNeeded();
        return this._private__paneRendererData._internal_visible;
    };
    PriceAxisView.prototype._internal_renderer = function () {
        this._private__updateRendererDataIfNeeded();
        this._private__axisRenderer._internal_setData(this._private__axisRendererData, this._private__commonRendererData);
        this._private__paneRenderer._internal_setData(this._private__paneRendererData, this._private__commonRendererData);
        return this._private__axisRenderer;
    };
    PriceAxisView.prototype._internal_paneRenderer = function () {
        this._private__updateRendererDataIfNeeded();
        this._private__axisRenderer._internal_setData(this._private__axisRendererData, this._private__commonRendererData);
        this._private__paneRenderer._internal_setData(this._private__paneRendererData, this._private__commonRendererData);
        return this._private__paneRenderer;
    };
    PriceAxisView.prototype._private__updateRendererDataIfNeeded = function () {
        if (this._private__invalidated) {
            this._internal__updateRendererData(this._private__axisRendererData, this._private__paneRendererData, this._private__commonRendererData);
            this._private__invalidated = false;
        }
    };
    return PriceAxisView;
}());
export { PriceAxisView };
