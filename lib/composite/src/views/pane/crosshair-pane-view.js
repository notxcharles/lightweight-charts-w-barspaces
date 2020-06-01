import { ensureNotNull } from '../../helpers/assertions';
import { CrosshairRenderer } from '../../renderers/crosshair-renderer';
var CrosshairPaneView = /** @class */ (function () {
    function CrosshairPaneView(source) {
        this._invalidated = true;
        this._rendererData = {
            vertLine: {
                lineWidth: 1,
                lineStyle: 0,
                color: '',
                visible: false,
            },
            horzLine: {
                lineWidth: 1,
                lineStyle: 0,
                color: '',
                visible: false,
            },
            w: 0,
            h: 0,
            x: 0,
            y: 0,
        };
        this._renderer = new CrosshairRenderer(this._rendererData);
        this._source = source;
    }
    CrosshairPaneView.prototype.update = function () {
        this._invalidated = true;
    };
    CrosshairPaneView.prototype.renderer = function (height, width) {
        if (this._invalidated) {
            this._updateImpl();
        }
        return this._renderer;
    };
    CrosshairPaneView.prototype._updateImpl = function () {
        var visible = this._source.visible();
        var pane = ensureNotNull(this._source.pane());
        var crosshairOptions = pane.model().options().crosshair;
        var data = this._rendererData;
        data.horzLine.visible = visible && this._source.horzLineVisible(pane);
        data.vertLine.visible = visible && this._source.vertLineVisible();
        data.horzLine.lineWidth = crosshairOptions.horzLine.width;
        data.horzLine.lineStyle = crosshairOptions.horzLine.style;
        data.horzLine.color = crosshairOptions.horzLine.color;
        data.vertLine.lineWidth = crosshairOptions.vertLine.width;
        data.vertLine.lineStyle = crosshairOptions.vertLine.style;
        data.vertLine.color = crosshairOptions.vertLine.color;
        data.w = pane.width();
        data.h = pane.height();
        data.x = this._source.appliedX();
        data.y = this._source.appliedY();
    };
    return CrosshairPaneView;
}());
export { CrosshairPaneView };
