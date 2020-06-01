import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
var PriceAxisStub = /** @class */ (function () {
    function PriceAxisStub(side, options, params, borderVisible) {
        var _this = this;
        this._invalidated = true;
        this._size = new Size(0, 0);
        this._canvasConfiguredHandler = function () { return _this.paint(3 /* Full */); };
        this._isLeft = side === 'left';
        this._rendererOptionsProvider = params.rendererOptionsProvider;
        this._options = options;
        this._borderVisible = borderVisible;
        this._cell = document.createElement('div');
        this._cell.style.width = '25px';
        this._cell.style.height = '100%';
        this._cell.style.overflow = 'hidden';
        this._canvasBinding = createBoundCanvas(this._cell, new Size(16, 16));
        this._canvasBinding.subscribeCanvasConfigured(this._canvasConfiguredHandler);
    }
    PriceAxisStub.prototype.destroy = function () {
        this._canvasBinding.unsubscribeCanvasConfigured(this._canvasConfiguredHandler);
        this._canvasBinding.destroy();
    };
    PriceAxisStub.prototype.update = function () {
        this._invalidated = true;
    };
    PriceAxisStub.prototype.getElement = function () {
        return this._cell;
    };
    PriceAxisStub.prototype.getSize = function () {
        return this._size;
    };
    PriceAxisStub.prototype.setSize = function (size) {
        if (size.w < 0 || size.h < 0) {
            throw new Error('Try to set invalid size to PriceAxisStub ' + JSON.stringify(size));
        }
        if (!this._size.equals(size)) {
            this._size = size;
            this._canvasBinding.resizeCanvas({ width: size.w, height: size.h });
            this._cell.style.width = size.w + "px";
            this._cell.style.minWidth = size.w + "px"; // for right calculate position of .pane-legend
            this._cell.style.height = size.h + "px";
            this._invalidated = true;
        }
    };
    PriceAxisStub.prototype.paint = function (type) {
        if (type < 3 /* Full */ && !this._invalidated) {
            return;
        }
        if (this._size.w === 0 || this._size.h === 0) {
            return;
        }
        this._invalidated = false;
        var ctx = getContext2D(this._canvasBinding.canvas);
        this._drawBackground(ctx, this._canvasBinding.pixelRatio);
        this._drawBorder(ctx, this._canvasBinding.pixelRatio);
    };
    PriceAxisStub.prototype.getImage = function () {
        return this._canvasBinding.canvas;
    };
    PriceAxisStub.prototype.isLeft = function () {
        return this._isLeft;
    };
    PriceAxisStub.prototype._drawBorder = function (ctx, pixelRatio) {
        if (!this._borderVisible()) {
            return;
        }
        var width = this._size.w;
        ctx.save();
        ctx.fillStyle = this._options.timeScale.borderColor;
        var borderSize = Math.floor(this._rendererOptionsProvider.options().borderSize * pixelRatio);
        var left = (this._isLeft) ? Math.round(width * pixelRatio) - borderSize : 0;
        ctx.fillRect(left, 0, borderSize, borderSize);
        ctx.restore();
    };
    PriceAxisStub.prototype._drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, _this._size.w, _this._size.h, _this._options.layout.backgroundColor);
        });
    };
    return PriceAxisStub;
}());
export { PriceAxisStub };
