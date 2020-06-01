import { ensureDefined } from '../helpers/assertions';
var Palette = /** @class */ (function () {
    function Palette() {
        this._maxUsedIndex = 0;
        this._colorToIndex = new Map();
        this._indexToColor = new Map();
    }
    Palette.prototype.colorByIndex = function (index) {
        return ensureDefined(this._indexToColor.get(index));
    };
    Palette.prototype.addColor = function (color) {
        var res = this._colorToIndex.get(color);
        if (res === undefined) {
            res = this._maxUsedIndex++;
            this._colorToIndex.set(color, res);
            this._indexToColor.set(res, color);
        }
        return res;
    };
    Palette.prototype.clear = function () {
        this._maxUsedIndex = 0;
        this._colorToIndex.clear();
        this._indexToColor.clear();
    };
    Palette.prototype.size = function () {
        return this._indexToColor.size;
    };
    return Palette;
}());
export { Palette };
