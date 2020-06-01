import { __extends } from "tslib";
import { WatermarkPaneView } from '../views/pane/watermark-pane-view';
import { DataSource } from './data-source';
var Watermark = /** @class */ (function (_super) {
    __extends(Watermark, _super);
    function Watermark(model, options) {
        var _this = _super.call(this) || this;
        _this._private__options = options;
        _this._private__paneView = new WatermarkPaneView(_this);
        return _this;
    }
    Watermark.prototype._internal_paneViews = function () {
        return [this._private__paneView];
    };
    Watermark.prototype._internal_options = function () {
        return this._private__options;
    };
    Watermark.prototype._internal_updateAllViews = function () {
        this._private__paneView._internal_update();
    };
    return Watermark;
}(DataSource));
export { Watermark };
