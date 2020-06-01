import { parseRgb, rgbToBlackWhiteString } from '../../helpers/color';
var TimeAxisView = /** @class */ (function () {
    function TimeAxisView() {
        this._text = '';
        this._background = '#585858';
        this._coordinate = 0;
    }
    TimeAxisView.prototype.text = function () {
        return this._text;
    };
    TimeAxisView.prototype.background = function () {
        return this._background;
    };
    TimeAxisView.prototype.color = function () {
        var backgroundBW = rgbToBlackWhiteString(parseRgb(this._background), 150);
        return backgroundBW === 'black' ? 'white' : 'black';
    };
    TimeAxisView.prototype.coordinate = function () {
        return this._coordinate;
    };
    return TimeAxisView;
}());
export { TimeAxisView };
