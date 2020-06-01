var ScaledRenderer = /** @class */ (function () {
    function ScaledRenderer() {
    }
    ScaledRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        ctx.save();
        // actually we must be sure that this scaling applied only once at the same time
        // currently ScaledRenderer could be only nodes renderer (not top-level renderers like CompositeRenderer or something)
        // so this "constraint" is fulfilled for now
        ctx.scale(pixelRatio, pixelRatio);
        this._internal__drawImpl(ctx, isHovered, hitTestData);
        ctx.restore();
    };
    ScaledRenderer.prototype._internal_drawBackground = function (ctx, pixelRatio, isHovered, hitTestData) {
        ctx.save();
        // actually we must be sure that this scaling applied only once at the same time
        // currently ScaledRenderer could be only nodes renderer (not top-level renderers like CompositeRenderer or something)
        // so this "constraint" is fulfilled for now
        ctx.scale(pixelRatio, pixelRatio);
        this._internal__drawBackgroundImpl(ctx, isHovered, hitTestData);
        ctx.restore();
    };
    ScaledRenderer.prototype._internal__drawBackgroundImpl = function (ctx, isHovered, hitTestData) {
    };
    return ScaledRenderer;
}());
export { ScaledRenderer };
