import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
var PriceAxisStub = /** @class */ (function () {
    function PriceAxisStub(side, options, params, borderVisible) {
        var _this = this;
        this._private__invalidated = true;
        this._private__size = new Size(0, 0);
        this._private__canvasConfiguredHandler = function () { return _this._internal_paint(3 /* Full */); };
        this._private__isLeft = side === 'left';
        this._private__rendererOptionsProvider = params._internal_rendererOptionsProvider;
        this._private__options = options;
        this._private__borderVisible = borderVisible;
        this._private__cell = document.createElement('div');
        this._private__cell.style.width = '25px';
        this._private__cell.style.height = '100%';
        this._private__cell.style.overflow = 'hidden';
        this._private__canvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
    }
    PriceAxisStub.prototype._internal_destroy = function () {
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
    };
    PriceAxisStub.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    PriceAxisStub.prototype._internal_getElement = function () {
        return this._private__cell;
    };
    PriceAxisStub.prototype._internal_getSize = function () {
        return this._private__size;
    };
    PriceAxisStub.prototype._internal_setSize = function (size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PriceAxisStub ' + JSON.stringify(size));
        }
        if (!this._private__size._internal_equals(size)) {
            this._private__size = size;
            this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__cell.style.width = size._internal_w + "px";
            this._private__cell.style.minWidth = size._internal_w + "px"; // for right calculate position of .pane-legend
            this._private__cell.style.height = size._internal_h + "px";
            this._private__invalidated = true;
        }
    };
    PriceAxisStub.prototype._internal_paint = function (type) {
        if (type < 3 /* Full */ && !this._private__invalidated) {
            return;
        }
        if (this._private__size._internal_w === 0 || this._private__size._internal_h === 0) {
            return;
        }
        this._private__invalidated = false;
        var ctx = getContext2D(this._private__canvasBinding.canvas);
        this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
        this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
    };
    PriceAxisStub.prototype._internal_getImage = function () {
        return this._private__canvasBinding.canvas;
    };
    PriceAxisStub.prototype._internal_isLeft = function () {
        return this._private__isLeft;
    };
    PriceAxisStub.prototype._private__drawBorder = function (ctx, pixelRatio) {
        if (!this._private__borderVisible()) {
            return;
        }
        var width = this._private__size._internal_w;
        ctx.save();
        ctx.fillStyle = this._private__options.timeScale.borderColor;
        var borderSize = Math.floor(this._private__rendererOptionsProvider._internal_options()._internal_borderSize * pixelRatio);
        var left = (this._private__isLeft) ? Math.round(width * pixelRatio) - borderSize : 0;
        ctx.fillRect(left, 0, borderSize, borderSize);
        ctx.restore();
    };
    PriceAxisStub.prototype._private__drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, _this._private__size._internal_w, _this._private__size._internal_h, _this._private__options.layout.backgroundColor);
        });
    };
    return PriceAxisStub;
}());
export { PriceAxisStub };
