import { TextWidthCache } from '../../model/text-width-cache';
var PanePriceAxisViewRenderer = /** @class */ (function () {
    function PanePriceAxisViewRenderer(textWidthCache) {
        this._priceAxisViewRenderer = null;
        this._rendererOptions = null;
        this._align = 'right';
        this._width = 0;
        this._textWidthCache = textWidthCache;
    }
    PanePriceAxisViewRenderer.prototype.setParams = function (priceAxisViewRenderer, rendererOptions, width, align) {
        this._priceAxisViewRenderer = priceAxisViewRenderer;
        this._rendererOptions = rendererOptions;
        this._width = width;
        this._align = align;
    };
    PanePriceAxisViewRenderer.prototype.draw = function (ctx, pixelRatio) {
        if (this._rendererOptions === null || this._priceAxisViewRenderer === null) {
            return;
        }
        this._priceAxisViewRenderer.draw(ctx, this._rendererOptions, this._textWidthCache, this._width, this._align, pixelRatio);
    };
    return PanePriceAxisViewRenderer;
}());
var PanePriceAxisView = /** @class */ (function () {
    function PanePriceAxisView(priceAxisView, dataSource, chartModel) {
        this._priceAxisView = priceAxisView;
        this._textWidthCache = new TextWidthCache(50); // when should we clear cache?
        this._dataSource = dataSource;
        this._chartModel = chartModel;
        this._fontSize = -1;
        this._renderer = new PanePriceAxisViewRenderer(this._textWidthCache);
    }
    PanePriceAxisView.prototype.update = function () {
        this._priceAxisView.update();
    };
    PanePriceAxisView.prototype.renderer = function (height, width) {
        var pane = this._chartModel.paneForSource(this._dataSource);
        if (pane === null) {
            return null;
        }
        var priceScale = this._dataSource.priceScale();
        if (priceScale === null) {
            return null;
        }
        var position = pane.priceScalePosition(priceScale);
        if (position === 'overlay') {
            // both source and main source are overlays
            return null;
        }
        var options = this._chartModel.priceAxisRendererOptions();
        if (options.fontSize !== this._fontSize) {
            this._fontSize = options.fontSize;
            this._textWidthCache.reset();
        }
        this._renderer.setParams(this._priceAxisView.paneRenderer(), options, width, position);
        return this._renderer;
    };
    return PanePriceAxisView;
}());
export { PanePriceAxisView };
