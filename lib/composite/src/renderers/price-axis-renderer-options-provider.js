import { makeFont } from '../helpers/make-font';
var RendererConstants;
(function (RendererConstants) {
    RendererConstants[RendererConstants["BorderSize"] = 1] = "BorderSize";
    RendererConstants[RendererConstants["TickLength"] = 4] = "TickLength";
})(RendererConstants || (RendererConstants = {}));
var PriceAxisRendererOptionsProvider = /** @class */ (function () {
    function PriceAxisRendererOptionsProvider(chartModel) {
        this._rendererOptions = {
            borderSize: 1 /* BorderSize */,
            tickLength: 4 /* TickLength */,
            fontSize: NaN,
            font: '',
            fontFamily: '',
            color: '',
            paddingBottom: 0,
            paddingInner: 0,
            paddingOuter: 0,
            paddingTop: 0,
            baselineOffset: 0,
        };
        this._chartModel = chartModel;
    }
    PriceAxisRendererOptionsProvider.prototype.options = function () {
        var rendererOptions = this._rendererOptions;
        var currentFontSize = this._fontSize();
        var currentFontFamily = this._fontFamily();
        if (rendererOptions.fontSize !== currentFontSize || rendererOptions.fontFamily !== currentFontFamily) {
            rendererOptions.fontSize = currentFontSize;
            rendererOptions.fontFamily = currentFontFamily;
            rendererOptions.font = makeFont(currentFontSize, currentFontFamily);
            rendererOptions.paddingTop = Math.floor(currentFontSize / 3.5);
            rendererOptions.paddingBottom = rendererOptions.paddingTop;
            rendererOptions.paddingInner = Math.max(Math.ceil(currentFontSize / 2 - rendererOptions.tickLength / 2), 0);
            rendererOptions.paddingOuter = Math.ceil(currentFontSize / 2 + rendererOptions.tickLength / 2);
            rendererOptions.baselineOffset = Math.round(currentFontSize / 10);
        }
        rendererOptions.color = this._textColor();
        return this._rendererOptions;
    };
    PriceAxisRendererOptionsProvider.prototype._textColor = function () {
        return this._chartModel.options().layout.textColor;
    };
    PriceAxisRendererOptionsProvider.prototype._fontSize = function () {
        return this._chartModel.options().layout.fontSize;
    };
    PriceAxisRendererOptionsProvider.prototype._fontFamily = function () {
        return this._chartModel.options().layout.fontFamily;
    };
    return PriceAxisRendererOptionsProvider;
}());
export { PriceAxisRendererOptionsProvider };
