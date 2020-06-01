import { __extends } from "tslib";
import { WatermarkPaneView } from '../views/pane/watermark-pane-view';
import { DataSource } from './data-source';
var Watermark = /** @class */ (function (_super) {
    __extends(Watermark, _super);
    function Watermark(model, options) {
        var _this = _super.call(this) || this;
        _this._options = options;
        _this._paneView = new WatermarkPaneView(_this);
        return _this;
    }
    Watermark.prototype.paneViews = function () {
        return [this._paneView];
    };
    Watermark.prototype.options = function () {
        return this._options;
    };
    Watermark.prototype.updateAllViews = function () {
        this._paneView.update();
    };
    return Watermark;
}(DataSource));
export { Watermark };
