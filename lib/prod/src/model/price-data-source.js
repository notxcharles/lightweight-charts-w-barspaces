import { __extends } from "tslib";
import { DataSource } from './data-source';
var PriceDataSource = /** @class */ (function (_super) {
    __extends(PriceDataSource, _super);
    function PriceDataSource(model) {
        var _this = _super.call(this) || this;
        _this._private__model = model;
        return _this;
    }
    PriceDataSource.prototype._internal_model = function () {
        return this._private__model;
    };
    PriceDataSource.prototype._internal_minMove = function () {
        return 0;
    };
    PriceDataSource.prototype._internal_autoscaleInfo = function (startTimePoint, endTimePoint) {
        return null;
    };
    return PriceDataSource;
}(DataSource));
export { PriceDataSource };
