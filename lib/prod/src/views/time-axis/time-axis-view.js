import { parseRgb, rgbToBlackWhiteString } from '../../helpers/color';
var TimeAxisView = /** @class */ (function () {
    function TimeAxisView() {
        this._internal__text = '';
        this._internal__background = '#585858';
        this._internal__coordinate = 0;
    }
    TimeAxisView.prototype._internal_text = function () {
        return this._internal__text;
    };
    TimeAxisView.prototype._internal_background = function () {
        return this._internal__background;
    };
    TimeAxisView.prototype._internal_color = function () {
        var backgroundBW = rgbToBlackWhiteString(parseRgb(this._internal__background), 150);
        return backgroundBW === 'black' ? 'white' : 'black';
    };
    TimeAxisView.prototype._internal_coordinate = function () {
        return this._internal__coordinate;
    };
    return TimeAxisView;
}());
export { TimeAxisView };
