import { ensureDefined } from '../helpers/assertions';
var Palette = /** @class */ (function () {
    function Palette() {
        this._private__maxUsedIndex = 0;
        this._private__colorToIndex = new Map();
        this._private__indexToColor = new Map();
    }
    Palette.prototype._internal_colorByIndex = function (index) {
        return ensureDefined(this._private__indexToColor.get(index));
    };
    Palette.prototype._internal_addColor = function (color) {
        var res = this._private__colorToIndex.get(color);
        if (res === undefined) {
            res = this._private__maxUsedIndex++;
            this._private__colorToIndex.set(color, res);
            this._private__indexToColor.set(res, color);
        }
        return res;
    };
    Palette.prototype._internal_clear = function () {
        this._private__maxUsedIndex = 0;
        this._private__colorToIndex.clear();
        this._private__indexToColor.clear();
    };
    Palette.prototype._internal_size = function () {
        return this._private__indexToColor.size;
    };
    return Palette;
}());
export { Palette };
