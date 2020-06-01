import { ensureNotNull } from '../../helpers/assertions';
import { CrosshairRenderer } from '../../renderers/crosshair-renderer';
var CrosshairPaneView = /** @class */ (function () {
    function CrosshairPaneView(source) {
        this._private__invalidated = true;
        this._private__rendererData = {
            _internal_vertLine: {
                _internal_lineWidth: 1,
                _internal_lineStyle: 0,
                _internal_color: '',
                _internal_visible: false,
            },
            _internal_horzLine: {
                _internal_lineWidth: 1,
                _internal_lineStyle: 0,
                _internal_color: '',
                _internal_visible: false,
            },
            _internal_w: 0,
            _internal_h: 0,
            _internal_x: 0,
            _internal_y: 0,
        };
        this._private__renderer = new CrosshairRenderer(this._private__rendererData);
        this._private__source = source;
    }
    CrosshairPaneView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    CrosshairPaneView.prototype._internal_renderer = function (height, width) {
        if (this._private__invalidated) {
            this._private__updateImpl();
        }
        return this._private__renderer;
    };
    CrosshairPaneView.prototype._private__updateImpl = function () {
        var visible = this._private__source._internal_visible();
        var pane = ensureNotNull(this._private__source._internal_pane());
        var crosshairOptions = pane._internal_model()._internal_options().crosshair;
        var data = this._private__rendererData;
        data._internal_horzLine._internal_visible = visible && this._private__source._internal_horzLineVisible(pane);
        data._internal_vertLine._internal_visible = visible && this._private__source._internal_vertLineVisible();
        data._internal_horzLine._internal_lineWidth = crosshairOptions.horzLine.width;
        data._internal_horzLine._internal_lineStyle = crosshairOptions.horzLine.style;
        data._internal_horzLine._internal_color = crosshairOptions.horzLine.color;
        data._internal_vertLine._internal_lineWidth = crosshairOptions.vertLine.width;
        data._internal_vertLine._internal_lineStyle = crosshairOptions.vertLine.style;
        data._internal_vertLine._internal_color = crosshairOptions.vertLine.color;
        data._internal_w = pane._internal_width();
        data._internal_h = pane._internal_height();
        data._internal_x = this._private__source._internal_appliedX();
        data._internal_y = this._private__source._internal_appliedY();
    };
    return CrosshairPaneView;
}());
export { CrosshairPaneView };
