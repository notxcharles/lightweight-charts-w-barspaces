import { makeFont } from '../../helpers/make-font';
import { WatermarkRenderer } from '../../renderers/watermark-renderer';
var WatermarkPaneView = /** @class */ (function () {
    function WatermarkPaneView(source) {
        this._invalidated = true;
        this._rendererData = {
            visible: false,
            color: '',
            height: 0,
            width: 0,
            lines: [],
            vertAlign: 'center',
            horzAlign: 'center',
        };
        this._renderer = new WatermarkRenderer(this._rendererData);
        this._source = source;
    }
    WatermarkPaneView.prototype.update = function () {
        this._invalidated = true;
    };
    WatermarkPaneView.prototype.renderer = function (height, width) {
        if (this._invalidated) {
            this._updateImpl(height, width);
            this._invalidated = false;
        }
        return this._renderer;
    };
    WatermarkPaneView.prototype._updateImpl = function (height, width) {
        var options = this._source.options();
        var data = this._rendererData;
        data.visible = options.visible;
        if (!data.visible) {
            return;
        }
        data.color = options.color;
        data.width = width;
        data.height = height;
        data.horzAlign = options.horzAlign;
        data.vertAlign = options.vertAlign;
        data.lines = [
            {
                text: options.text,
                font: makeFont(options.fontSize),
                lineHeight: options.fontSize * 1.2,
                vertOffset: 0,
                zoom: 0,
            },
        ];
    };
    return WatermarkPaneView;
}());
export { WatermarkPaneView };
