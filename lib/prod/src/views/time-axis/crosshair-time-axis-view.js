import { __extends } from "tslib";
import { ensureNotNull } from '../../helpers/assertions';
import { generateTextColor } from '../../helpers/color';
import { TimeAxisViewRenderer } from '../../renderers/time-axis-view-renderer';
import { TimeAxisView } from './time-axis-view';
var CrosshairTimeAxisView = /** @class */ (function (_super) {
    __extends(CrosshairTimeAxisView, _super);
    function CrosshairTimeAxisView(crosshair, model, valueProvider) {
        var _this = _super.call(this) || this;
        _this._private__invalidated = true;
        _this._private__renderer = new TimeAxisViewRenderer();
        _this._private__rendererData = {
            _internal_visible: false,
            _internal_background: '#4c525e',
            _internal_color: 'white',
            _internal_text: '',
            _internal_width: 0,
            _internal_coordinate: NaN,
        };
        _this._private__crosshair = crosshair;
        _this._private__model = model;
        _this._private__valueProvider = valueProvider;
        return _this;
    }
    CrosshairTimeAxisView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    CrosshairTimeAxisView.prototype._internal_renderer = function () {
        if (this._private__invalidated) {
            this._private__updateImpl();
            this._private__invalidated = false;
        }
        this._private__renderer._internal_setData(this._private__rendererData);
        return this._private__renderer;
    };
    CrosshairTimeAxisView.prototype._private__updateImpl = function () {
        var data = this._private__rendererData;
        data._internal_visible = false;
        var options = this._private__crosshair._internal_options().vertLine;
        if (!options.labelVisible) {
            return;
        }
        var timeScale = this._private__model._internal_timeScale();
        if (timeScale._internal_isEmpty()) {
            return;
        }
        var currentTime = timeScale._internal_indexToUserTime(this._private__crosshair._internal_appliedIndex());
        data._internal_width = timeScale._internal_width();
        var value = this._private__valueProvider();
        if (!value._internal_time) {
            return;
        }
        data._internal_coordinate = value._internal_coordinate;
        data._internal_text = timeScale._internal_formatDateTime(ensureNotNull(currentTime));
        data._internal_visible = true;
        data._internal_background = options.labelBackgroundColor;
        data._internal_color = generateTextColor(options.labelBackgroundColor);
    };
    return CrosshairTimeAxisView;
}(TimeAxisView));
export { CrosshairTimeAxisView };
