import { makeFont } from '../../helpers/make-font';
import { WatermarkRenderer } from '../../renderers/watermark-renderer';
var WatermarkPaneView = /** @class */ (function () {
    function WatermarkPaneView(source) {
        this._private__invalidated = true;
        this._private__rendererData = {
            _internal_visible: false,
            _internal_color: '',
            _internal_height: 0,
            _internal_width: 0,
            _internal_lines: [],
            _internal_vertAlign: 'center',
            _internal_horzAlign: 'center',
        };
        this._private__renderer = new WatermarkRenderer(this._private__rendererData);
        this._private__source = source;
    }
    WatermarkPaneView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    WatermarkPaneView.prototype._internal_renderer = function (height, width) {
        if (this._private__invalidated) {
            this._private__updateImpl(height, width);
            this._private__invalidated = false;
        }
        return this._private__renderer;
    };
    WatermarkPaneView.prototype._private__updateImpl = function (height, width) {
        var options = this._private__source._internal_options();
        var data = this._private__rendererData;
        data._internal_visible = options.visible;
        if (!data._internal_visible) {
            return;
        }
        data._internal_color = options.color;
        data._internal_width = width;
        data._internal_height = height;
        data._internal_horzAlign = options.horzAlign;
        data._internal_vertAlign = options.vertAlign;
        data._internal_lines = [
            {
                _internal_text: options.text,
                _internal_font: makeFont(options.fontSize),
                _internal_lineHeight: options.fontSize * 1.2,
                _internal_vertOffset: 0,
                _internal_zoom: 0,
            },
        ];
    };
    return WatermarkPaneView;
}());
export { WatermarkPaneView };
