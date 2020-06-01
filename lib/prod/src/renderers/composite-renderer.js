var CompositeRenderer = /** @class */ (function () {
    function CompositeRenderer() {
        this._private__renderers = [];
    }
    CompositeRenderer.prototype._internal_setRenderers = function (renderers) {
        this._private__renderers = renderers;
    };
    CompositeRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        this._private__renderers.forEach(function (r) {
            ctx.save();
            r._internal_draw(ctx, pixelRatio, isHovered, hitTestData);
            ctx.restore();
        });
    };
    return CompositeRenderer;
}());
export { CompositeRenderer };
