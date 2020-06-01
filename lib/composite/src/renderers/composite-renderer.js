var CompositeRenderer = /** @class */ (function () {
    function CompositeRenderer() {
        this._renderers = [];
    }
    CompositeRenderer.prototype.setRenderers = function (renderers) {
        this._renderers = renderers;
    };
    CompositeRenderer.prototype.draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        this._renderers.forEach(function (r) {
            ctx.save();
            r.draw(ctx, pixelRatio, isHovered, hitTestData);
            ctx.restore();
        });
    };
    return CompositeRenderer;
}());
export { CompositeRenderer };
