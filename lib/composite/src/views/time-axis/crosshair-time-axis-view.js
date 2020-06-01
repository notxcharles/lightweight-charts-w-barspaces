import { __extends } from "tslib";
import { ensureNotNull } from '../../helpers/assertions';
import { generateTextColor } from '../../helpers/color';
import { TimeAxisViewRenderer } from '../../renderers/time-axis-view-renderer';
import { TimeAxisView } from './time-axis-view';
var CrosshairTimeAxisView = /** @class */ (function (_super) {
    __extends(CrosshairTimeAxisView, _super);
    function CrosshairTimeAxisView(crosshair, model, valueProvider) {
        var _this = _super.call(this) || this;
        _this._invalidated = true;
        _this._renderer = new TimeAxisViewRenderer();
        _this._rendererData = {
            visible: false,
            background: '#4c525e',
            color: 'white',
            text: '',
            width: 0,
            coordinate: NaN,
        };
        _this._crosshair = crosshair;
        _this._model = model;
        _this._valueProvider = valueProvider;
        return _this;
    }
    CrosshairTimeAxisView.prototype.update = function () {
        this._invalidated = true;
    };
    CrosshairTimeAxisView.prototype.renderer = function () {
        if (this._invalidated) {
            this._updateImpl();
            this._invalidated = false;
        }
        this._renderer.setData(this._rendererData);
        return this._renderer;
    };
    CrosshairTimeAxisView.prototype._updateImpl = function () {
        var data = this._rendererData;
        data.visible = false;
        var options = this._crosshair.options().vertLine;
        if (!options.labelVisible) {
            return;
        }
        var timeScale = this._model.timeScale();
        if (timeScale.isEmpty()) {
            return;
        }
        var currentTime = timeScale.indexToUserTime(this._crosshair.appliedIndex());
        data.width = timeScale.width();
        var value = this._valueProvider();
        if (!value.time) {
            return;
        }
        data.coordinate = value.coordinate;
        data.text = timeScale.formatDateTime(ensureNotNull(currentTime));
        data.visible = true;
        data.background = options.labelBackgroundColor;
        data.color = generateTextColor(options.labelBackgroundColor);
    };
    return CrosshairTimeAxisView;
}(TimeAxisView));
export { CrosshairTimeAxisView };
