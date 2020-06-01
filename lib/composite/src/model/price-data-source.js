import { __extends } from "tslib";
import { DataSource } from './data-source';
var PriceDataSource = /** @class */ (function (_super) {
    __extends(PriceDataSource, _super);
    function PriceDataSource(model) {
        var _this = _super.call(this) || this;
        _this._model = model;
        return _this;
    }
    PriceDataSource.prototype.model = function () {
        return this._model;
    };
    PriceDataSource.prototype.minMove = function () {
        return 0;
    };
    PriceDataSource.prototype.autoscaleInfo = function (startTimePoint, endTimePoint) {
        return null;
    };
    return PriceDataSource;
}(DataSource));
export { PriceDataSource };
