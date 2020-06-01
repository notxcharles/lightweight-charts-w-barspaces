import { TextWidthCache } from '../../model/text-width-cache';
var PanePriceAxisViewRenderer = /** @class */ (function () {
    function PanePriceAxisViewRenderer(textWidthCache) {
        this._private__priceAxisViewRenderer = null;
        this._private__rendererOptions = null;
        this._private__align = 'right';
        this._private__width = 0;
        this._private__textWidthCache = textWidthCache;
    }
    PanePriceAxisViewRenderer.prototype._internal_setParams = function (priceAxisViewRenderer, rendererOptions, width, align) {
        this._private__priceAxisViewRenderer = priceAxisViewRenderer;
        this._private__rendererOptions = rendererOptions;
        this._private__width = width;
        this._private__align = align;
    };
    PanePriceAxisViewRenderer.prototype._internal_draw = function (ctx, pixelRatio) {
        if (this._private__rendererOptions === null || this._private__priceAxisViewRenderer === null) {
            return;
        }
        this._private__priceAxisViewRenderer._internal_draw(ctx, this._private__rendererOptions, this._private__textWidthCache, this._private__width, this._private__align, pixelRatio);
    };
    return PanePriceAxisViewRenderer;
}());
var PanePriceAxisView = /** @class */ (function () {
    function PanePriceAxisView(priceAxisView, dataSource, chartModel) {
        this._private__priceAxisView = priceAxisView;
        this._private__textWidthCache = new TextWidthCache(50); // when should we clear cache?
        this._private__dataSource = dataSource;
        this._private__chartModel = chartModel;
        this._private__fontSize = -1;
        this._private__renderer = new PanePriceAxisViewRenderer(this._private__textWidthCache);
    }
    PanePriceAxisView.prototype._internal_update = function () {
        this._private__priceAxisView._internal_update();
    };
    PanePriceAxisView.prototype._internal_renderer = function (height, width) {
        var pane = this._private__chartModel._internal_paneForSource(this._private__dataSource);
        if (pane === null) {
            return null;
        }
        var priceScale = this._private__dataSource._internal_priceScale();
        if (priceScale === null) {
            return null;
        }
        var position = pane._internal_priceScalePosition(priceScale);
        if (position === 'overlay') {
            // both source and main source are overlays
            return null;
        }
        var options = this._private__chartModel._internal_priceAxisRendererOptions();
        if (options._internal_fontSize !== this._private__fontSize) {
            this._private__fontSize = options._internal_fontSize;
            this._private__textWidthCache._internal_reset();
        }
        this._private__renderer._internal_setParams(this._private__priceAxisView._internal_paneRenderer(), options, width, position);
        return this._private__renderer;
    };
    return PanePriceAxisView;
}());
export { PanePriceAxisView };
