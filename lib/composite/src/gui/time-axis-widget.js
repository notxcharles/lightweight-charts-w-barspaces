import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { MouseEventHandler } from './mouse-event-handler';
import { PriceAxisStub } from './price-axis-stub';
var Constants;
(function (Constants) {
    Constants[Constants["BorderSize"] = 1] = "BorderSize";
    Constants[Constants["TickLength"] = 3] = "TickLength";
})(Constants || (Constants = {}));
var CursorType;
(function (CursorType) {
    CursorType[CursorType["Default"] = 0] = "Default";
    CursorType[CursorType["EwResize"] = 1] = "EwResize";
})(CursorType || (CursorType = {}));
function markWithGreaterSpan(a, b) {
    return a.span > b.span ? a : b;
}
var TimeAxisWidget = /** @class */ (function () {
    function TimeAxisWidget(chartWidget) {
        var _this = this;
        this._leftStub = null;
        this._rightStub = null;
        this._rendererOptions = null;
        this._mouseDown = false;
        this._size = new Size(0, 0);
        this._canvasConfiguredHandler = function () { return _this._chart.model().lightUpdate(); };
        this._topCanvasConfiguredHandler = function () { return _this._chart.model().lightUpdate(); };
        this._chart = chartWidget;
        this._options = chartWidget.options().layout;
        this._element = document.createElement('tr');
        this._leftStubCell = document.createElement('td');
        this._leftStubCell.style.padding = '0';
        this._rightStubCell = document.createElement('td');
        this._rightStubCell.style.padding = '0';
        this._cell = document.createElement('td');
        this._cell.style.height = '25px';
        this._cell.style.padding = '0';
        this._dv = document.createElement('div');
        this._dv.style.width = '100%';
        this._dv.style.height = '100%';
        this._dv.style.position = 'relative';
        this._dv.style.overflow = 'hidden';
        this._cell.appendChild(this._dv);
        this._canvasBinding = createBoundCanvas(this._dv, new Size(16, 16));
        this._canvasBinding.subscribeCanvasConfigured(this._canvasConfiguredHandler);
        var canvas = this._canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._topCanvasBinding = createBoundCanvas(this._dv, new Size(16, 16));
        this._topCanvasBinding.subscribeCanvasConfigured(this._topCanvasConfiguredHandler);
        var topCanvas = this._topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        this._element.appendChild(this._leftStubCell);
        this._element.appendChild(this._cell);
        this._element.appendChild(this._rightStubCell);
        this._recreateStubs();
        this._chart.model().priceScalesOptionsChanged().subscribe(this._recreateStubs.bind(this), this);
        this._mouseEventHandler = new MouseEventHandler(this._topCanvasBinding.canvas, this, {
            treatVertTouchDragAsPageScroll: true,
            treatHorzTouchDragAsPageScroll: false,
        });
    }
    TimeAxisWidget.prototype.destroy = function () {
        this._mouseEventHandler.destroy();
        if (this._leftStub !== null) {
            this._leftStub.destroy();
        }
        if (this._rightStub !== null) {
            this._rightStub.destroy();
        }
        this._topCanvasBinding.unsubscribeCanvasConfigured(this._topCanvasConfiguredHandler);
        this._topCanvasBinding.destroy();
        this._canvasBinding.unsubscribeCanvasConfigured(this._canvasConfiguredHandler);
        this._canvasBinding.destroy();
    };
    TimeAxisWidget.prototype.getElement = function () {
        return this._element;
    };
    TimeAxisWidget.prototype.leftStub = function () {
        return this._leftStub;
    };
    TimeAxisWidget.prototype.rightStub = function () {
        return this._rightStub;
    };
    TimeAxisWidget.prototype.mouseDownEvent = function (event) {
        if (this._mouseDown) {
            return;
        }
        this._mouseDown = true;
        var model = this._chart.model();
        if (model.timeScale().isEmpty() || !this._chart.options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model.startScaleTime(event.localX);
    };
    TimeAxisWidget.prototype.mouseDownOutsideEvent = function () {
        var model = this._chart.model();
        if (!model.timeScale().isEmpty() && this._mouseDown) {
            this._mouseDown = false;
            if (this._chart.options().handleScale.axisPressedMouseMove.time) {
                model.endScaleTime();
            }
        }
    };
    TimeAxisWidget.prototype.pressedMouseMoveEvent = function (event) {
        var model = this._chart.model();
        if (model.timeScale().isEmpty() || !this._chart.options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model.scaleTimeTo(event.localX);
    };
    TimeAxisWidget.prototype.mouseUpEvent = function (event) {
        this._mouseDown = false;
        var model = this._chart.model();
        if (model.timeScale().isEmpty() && !this._chart.options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model.endScaleTime();
    };
    TimeAxisWidget.prototype.mouseDoubleClickEvent = function () {
        if (this._chart.options().handleScale.axisDoubleClickReset) {
            this._chart.model().resetTimeScale();
        }
    };
    TimeAxisWidget.prototype.mouseEnterEvent = function (e) {
        if (this._chart.model().options().handleScale.axisPressedMouseMove.time) {
            this._setCursor(1 /* EwResize */);
        }
    };
    TimeAxisWidget.prototype.mouseLeaveEvent = function (e) {
        this._setCursor(0 /* Default */);
    };
    TimeAxisWidget.prototype.getSize = function () {
        return this._size;
    };
    TimeAxisWidget.prototype.setSizes = function (timeAxisSize, leftStubWidth, rightStubWidth) {
        if (!this._size || !this._size.equals(timeAxisSize)) {
            this._size = timeAxisSize;
            this._canvasBinding.resizeCanvas({ width: timeAxisSize.w, height: timeAxisSize.h });
            this._topCanvasBinding.resizeCanvas({ width: timeAxisSize.w, height: timeAxisSize.h });
            this._cell.style.width = timeAxisSize.w + 'px';
            this._cell.style.height = timeAxisSize.h + 'px';
        }
        if (this._leftStub !== null) {
            this._leftStub.setSize(new Size(leftStubWidth, timeAxisSize.h));
        }
        if (this._rightStub !== null) {
            this._rightStub.setSize(new Size(rightStubWidth, timeAxisSize.h));
        }
    };
    TimeAxisWidget.prototype.width = function () {
        return this._size.w;
    };
    TimeAxisWidget.prototype.height = function () {
        return this._size.h;
    };
    TimeAxisWidget.prototype.optimalHeight = function () {
        var rendererOptions = this._getRendererOptions();
        return Math.ceil(
        // rendererOptions.offsetSize +
        rendererOptions.borderSize +
            rendererOptions.tickLength +
            rendererOptions.fontSize +
            rendererOptions.paddingTop +
            rendererOptions.paddingBottom);
    };
    TimeAxisWidget.prototype.update = function () {
        // this call has side-effect - it regenerates marks on the time scale
        this._chart.model().timeScale().marks();
    };
    TimeAxisWidget.prototype.getImage = function () {
        return this._canvasBinding.canvas;
    };
    TimeAxisWidget.prototype.paint = function (type) {
        if (type === 0 /* None */) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            var ctx = getContext2D(this._canvasBinding.canvas);
            this._drawBackground(ctx, this._canvasBinding.pixelRatio);
            this._drawBorder(ctx, this._canvasBinding.pixelRatio);
            this._drawTickMarks(ctx, this._canvasBinding.pixelRatio);
            // atm we don't have sources to be drawn on time axis except crosshair which is rendered on top level canvas
            // so let's don't call this code at all for now
            // this._drawLabels(this._chart.model().dataSources(), ctx, pixelRatio);
            if (this._leftStub !== null) {
                this._leftStub.paint(type);
            }
            if (this._rightStub !== null) {
                this._rightStub.paint(type);
            }
        }
        var topCtx = getContext2D(this._topCanvasBinding.canvas);
        var pixelRatio = this._topCanvasBinding.pixelRatio;
        topCtx.clearRect(0, 0, Math.ceil(this._size.w * pixelRatio), Math.ceil(this._size.h * pixelRatio));
        this._drawLabels([this._chart.model().crosshairSource()], topCtx, pixelRatio);
    };
    TimeAxisWidget.prototype._drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, _this._size.w, _this._size.h, _this._backgroundColor());
        });
    };
    TimeAxisWidget.prototype._drawBorder = function (ctx, pixelRatio) {
        if (this._chart.options().timeScale.borderVisible) {
            ctx.save();
            ctx.fillStyle = this._lineColor();
            var borderSize = Math.max(1, Math.floor(this._getRendererOptions().borderSize * pixelRatio));
            ctx.fillRect(0, 0, Math.ceil(this._size.w * pixelRatio), borderSize);
            ctx.restore();
        }
    };
    TimeAxisWidget.prototype._drawTickMarks = function (ctx, pixelRatio) {
        var _this = this;
        var tickMarks = this._chart.model().timeScale().marks();
        if (!tickMarks || tickMarks.length === 0) {
            return;
        }
        // select max span
        /*
        5 * ?SEC -> 11;
        15 * ?SEC -> 12;
        30 * ?SEC -> 13;
        ?MIN -> 20;
        5 * ?MIN -> 21;
        15 * ?MIN -> 21;
        30 * ?MIN -> 22;
        ?HOUR -> 30;
        3 * ?HOUR -> 31;
        6 * ?HOUR -> 32;
        12 * ?HOUR -> 33;
        ?DAY -> 40;
        ?WEEK -> 50;
        ?MONTH -> 60;
        ?YEAR -> 70
        */
        var maxSpan = tickMarks.reduce(markWithGreaterSpan, tickMarks[0]).span;
        // special case: it looks strange if 15:00 is bold but 14:00 is not
        // so if maxSpan > 30 and < 40 reduce it to 30
        if (maxSpan > 30 && maxSpan < 40) {
            maxSpan = 30;
        }
        ctx.save();
        ctx.strokeStyle = this._lineColor();
        var rendererOptions = this._getRendererOptions();
        var yText = (rendererOptions.borderSize +
            rendererOptions.tickLength +
            rendererOptions.paddingTop +
            rendererOptions.fontSize -
            rendererOptions.baselineOffset);
        ctx.textAlign = 'center';
        ctx.fillStyle = this._lineColor();
        var borderSize = Math.floor(this._getRendererOptions().borderSize * pixelRatio);
        var tickWidth = Math.max(1, Math.floor(pixelRatio));
        var tickOffset = Math.floor(pixelRatio * 0.5);
        if (this._chart.model().timeScale().options().borderVisible) {
            ctx.beginPath();
            var tickLen = Math.round(rendererOptions.tickLength * pixelRatio);
            for (var index = tickMarks.length; index--;) {
                var x = Math.round(tickMarks[index].coord * pixelRatio);
                ctx.rect(x - tickOffset, borderSize, tickWidth, tickLen);
            }
            ctx.fill();
        }
        ctx.fillStyle = this._textColor();
        drawScaled(ctx, pixelRatio, function () {
            // draw base marks
            ctx.font = _this._baseFont();
            for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
                var tickMark = tickMarks_1[_i];
                if (tickMark.span < maxSpan) {
                    ctx.fillText(tickMark.label, tickMark.coord, yText);
                }
            }
            ctx.font = _this._baseBoldFont();
            for (var _a = 0, tickMarks_2 = tickMarks; _a < tickMarks_2.length; _a++) {
                var tickMark = tickMarks_2[_a];
                if (tickMark.span >= maxSpan) {
                    ctx.fillText(tickMark.label, tickMark.coord, yText);
                }
            }
        });
    };
    TimeAxisWidget.prototype._drawLabels = function (sources, ctx, pixelRatio) {
        var rendererOptions = this._getRendererOptions();
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            for (var _a = 0, _b = source.timeAxisViews(); _a < _b.length; _a++) {
                var view = _b[_a];
                ctx.save();
                view.renderer().draw(ctx, rendererOptions, pixelRatio);
                ctx.restore();
            }
        }
    };
    TimeAxisWidget.prototype._backgroundColor = function () {
        return this._options.backgroundColor;
    };
    TimeAxisWidget.prototype._lineColor = function () {
        return this._chart.options().timeScale.borderColor;
    };
    TimeAxisWidget.prototype._textColor = function () {
        return this._options.textColor;
    };
    TimeAxisWidget.prototype._fontSize = function () {
        return this._options.fontSize;
    };
    TimeAxisWidget.prototype._baseFont = function () {
        return makeFont(this._fontSize(), this._options.fontFamily);
    };
    TimeAxisWidget.prototype._baseBoldFont = function () {
        return makeFont(this._fontSize(), this._options.fontFamily, 'bold');
    };
    TimeAxisWidget.prototype._getRendererOptions = function () {
        if (this._rendererOptions === null) {
            this._rendererOptions = {
                borderSize: 1 /* BorderSize */,
                baselineOffset: NaN,
                paddingTop: NaN,
                paddingBottom: NaN,
                paddingHorizontal: NaN,
                tickLength: 3 /* TickLength */,
                fontSize: NaN,
                font: '',
                widthCache: new TextWidthCache(),
            };
        }
        var rendererOptions = this._rendererOptions;
        var newFont = this._baseFont();
        if (rendererOptions.font !== newFont) {
            var fontSize = this._fontSize();
            rendererOptions.fontSize = fontSize;
            rendererOptions.font = newFont;
            rendererOptions.paddingTop = Math.ceil(fontSize / 2.5);
            rendererOptions.paddingBottom = rendererOptions.paddingTop;
            rendererOptions.paddingHorizontal = Math.ceil(fontSize / 2);
            rendererOptions.baselineOffset = Math.round(this._fontSize() / 5);
            rendererOptions.widthCache.reset();
        }
        return this._rendererOptions;
    };
    TimeAxisWidget.prototype._setCursor = function (type) {
        this._cell.style.cursor = type === 1 /* EwResize */ ? 'ew-resize' : 'default';
    };
    TimeAxisWidget.prototype._recreateStubs = function () {
        var model = this._chart.model();
        var options = model.options();
        if (!options.leftPriceScale.visible && this._leftStub !== null) {
            this._leftStubCell.removeChild(this._leftStub.getElement());
            this._leftStub.destroy();
            this._leftStub = null;
        }
        if (!options.rightPriceScale.visible && this._rightStub !== null) {
            this._rightStubCell.removeChild(this._rightStub.getElement());
            this._rightStub.destroy();
            this._rightStub = null;
        }
        var rendererOptionsProvider = this._chart.model().rendererOptionsProvider();
        var params = {
            rendererOptionsProvider: rendererOptionsProvider,
        };
        if (options.leftPriceScale.visible && this._leftStub === null) {
            var borderVisibleGetter = function () {
                return options.leftPriceScale.borderVisible && model.timeScale().options().borderVisible;
            };
            this._leftStub = new PriceAxisStub('left', this._chart.options(), params, borderVisibleGetter);
            this._leftStubCell.appendChild(this._leftStub.getElement());
        }
        if (options.rightPriceScale.visible && this._rightStub === null) {
            var borderVisibleGetter = function () {
                return options.rightPriceScale.borderVisible && model.timeScale().options().borderVisible;
            };
            this._rightStub = new PriceAxisStub('right', this._chart.options(), params, borderVisibleGetter);
            this._rightStubCell.appendChild(this._rightStub.getElement());
        }
    };
    return TimeAxisWidget;
}());
export { TimeAxisWidget };
