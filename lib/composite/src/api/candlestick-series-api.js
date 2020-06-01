import { __extends } from "tslib";
import { fillUpDownCandlesticksColors, } from '../model/series-options';
import { SeriesApi } from './series-api';
var CandlestickSeriesApi = /** @class */ (function (_super) {
    __extends(CandlestickSeriesApi, _super);
    function CandlestickSeriesApi() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CandlestickSeriesApi.prototype.applyOptions = function (options) {
        fillUpDownCandlesticksColors(options);
        _super.prototype.applyOptions.call(this, options);
    };
    return CandlestickSeriesApi;
}(SeriesApi));
export { CandlestickSeriesApi };
