import { __extends } from "tslib";
import { PriceFormatter } from './price-formatter';
var PercentageFormatter = /** @class */ (function (_super) {
    __extends(PercentageFormatter, _super);
    function PercentageFormatter(priceScale) {
        if (priceScale === void 0) { priceScale = 100; }
        return _super.call(this, priceScale) || this;
    }
    PercentageFormatter.prototype._internal_format = function (price) {
        return _super.prototype._internal_format.call(this, price) + "%";
    };
    return PercentageFormatter;
}(PriceFormatter));
export { PercentageFormatter };
