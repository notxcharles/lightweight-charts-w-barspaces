import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { MouseEventHandler } from './mouse-event-handler';
import { PriceAxisStub } from './price-axis-stub';
;
;
function markWithGreaterSpan(a, b) {
    return a._internal_span > b._internal_span ? a : b;
}
var TimeAxisWidget = /** @class */ (function () {
    function TimeAxisWidget(chartWidget) {
        var _this = this;
        this._private__leftStub = null;
        this._private__rightStub = null;
        this._private__rendererOptions = null;
        this._private__mouseDown = false;
        this._private__size = new Size(0, 0);
        this._private__canvasConfiguredHandler = function () { return _this._private__chart._internal_model()._internal_lightUpdate(); };
        this._private__topCanvasConfiguredHandler = function () { return _this._private__chart._internal_model()._internal_lightUpdate(); };
        this._private__chart = chartWidget;
        this._private__options = chartWidget._internal_options().layout;
        this._private__element = document.createElement('tr');
        this._private__leftStubCell = document.createElement('td');
        this._private__leftStubCell.style.padding = '0';
        this._private__rightStubCell = document.createElement('td');
        this._private__rightStubCell.style.padding = '0';
        this._private__cell = document.createElement('td');
        this._private__cell.style.height = '25px';
        this._private__cell.style.padding = '0';
        this._private__dv = document.createElement('div');
        this._private__dv.style.width = '100%';
        this._private__dv.style.height = '100%';
        this._private__dv.style.position = 'relative';
        this._private__dv.style.overflow = 'hidden';
        this._private__cell.appendChild(this._private__dv);
        this._private__canvasBinding = createBoundCanvas(this._private__dv, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        var canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(this._private__dv, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        var topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        this._private__element.appendChild(this._private__leftStubCell);
        this._private__element.appendChild(this._private__cell);
        this._private__element.appendChild(this._private__rightStubCell);
        this._private__recreateStubs();
        this._private__chart._internal_model()._internal_priceScalesOptionsChanged()._internal_subscribe(this._private__recreateStubs.bind(this), this);
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, this, {
            _internal_treatVertTouchDragAsPageScroll: true,
            _internal_treatHorzTouchDragAsPageScroll: false,
        });
    }
    TimeAxisWidget.prototype._internal_destroy = function () {
        this._private__mouseEventHandler._internal_destroy();
        if (this._private__leftStub !== null) {
            this._private__leftStub._internal_destroy();
        }
        if (this._private__rightStub !== null) {
            this._private__rightStub._internal_destroy();
        }
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
    };
    TimeAxisWidget.prototype._internal_getElement = function () {
        return this._private__element;
    };
    TimeAxisWidget.prototype._internal_leftStub = function () {
        return this._private__leftStub;
    };
    TimeAxisWidget.prototype._internal_rightStub = function () {
        return this._private__rightStub;
    };
    TimeAxisWidget.prototype._internal_mouseDownEvent = function (event) {
        if (this._private__mouseDown) {
            return;
        }
        this._private__mouseDown = true;
        var model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() || !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_startScaleTime(event._internal_localX);
    };
    TimeAxisWidget.prototype._internal_mouseDownOutsideEvent = function () {
        var model = this._private__chart._internal_model();
        if (!model._internal_timeScale()._internal_isEmpty() && this._private__mouseDown) {
            this._private__mouseDown = false;
            if (this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
                model._internal_endScaleTime();
            }
        }
    };
    TimeAxisWidget.prototype._internal_pressedMouseMoveEvent = function (event) {
        var model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() || !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_scaleTimeTo(event._internal_localX);
    };
    TimeAxisWidget.prototype._internal_mouseUpEvent = function (event) {
        this._private__mouseDown = false;
        var model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() && !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_endScaleTime();
    };
    TimeAxisWidget.prototype._internal_mouseDoubleClickEvent = function () {
        if (this._private__chart._internal_options().handleScale.axisDoubleClickReset) {
            this._private__chart._internal_model()._internal_resetTimeScale();
        }
    };
    TimeAxisWidget.prototype._internal_mouseEnterEvent = function (e) {
        if (this._private__chart._internal_model()._internal_options().handleScale.axisPressedMouseMove.time) {
            this._private__setCursor(1 /* EwResize */);
        }
    };
    TimeAxisWidget.prototype._internal_mouseLeaveEvent = function (e) {
        this._private__setCursor(0 /* Default */);
    };
    TimeAxisWidget.prototype._internal_getSize = function () {
        return this._private__size;
    };
    TimeAxisWidget.prototype._internal_setSizes = function (timeAxisSize, leftStubWidth, rightStubWidth) {
        if (!this._private__size || !this._private__size._internal_equals(timeAxisSize)) {
            this._private__size = timeAxisSize;
            this._private__canvasBinding.resizeCanvas({ width: timeAxisSize._internal_w, height: timeAxisSize._internal_h });
            this._private__topCanvasBinding.resizeCanvas({ width: timeAxisSize._internal_w, height: timeAxisSize._internal_h });
            this._private__cell.style.width = timeAxisSize._internal_w + 'px';
            this._private__cell.style.height = timeAxisSize._internal_h + 'px';
        }
        if (this._private__leftStub !== null) {
            this._private__leftStub._internal_setSize(new Size(leftStubWidth, timeAxisSize._internal_h));
        }
        if (this._private__rightStub !== null) {
            this._private__rightStub._internal_setSize(new Size(rightStubWidth, timeAxisSize._internal_h));
        }
    };
    TimeAxisWidget.prototype._internal_width = function () {
        return this._private__size._internal_w;
    };
    TimeAxisWidget.prototype._internal_height = function () {
        return this._private__size._internal_h;
    };
    TimeAxisWidget.prototype._internal_optimalHeight = function () {
        var rendererOptions = this._private__getRendererOptions();
        return Math.ceil(
        // rendererOptions.offsetSize +
        rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_fontSize +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_paddingBottom);
    };
    TimeAxisWidget.prototype._internal_update = function () {
        // this call has side-effect - it regenerates marks on the time scale
        this._private__chart._internal_model()._internal_timeScale()._internal_marks();
    };
    TimeAxisWidget.prototype._internal_getImage = function () {
        return this._private__canvasBinding.canvas;
    };
    TimeAxisWidget.prototype._internal_paint = function (type) {
        if (type === 0 /* None */) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            var ctx = getContext2D(this._private__canvasBinding.canvas);
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawTickMarks(ctx, this._private__canvasBinding.pixelRatio);
            // atm we don't have sources to be drawn on time axis except crosshair which is rendered on top level canvas
            // so let's don't call this code at all for now
            // this._drawLabels(this._chart.model().dataSources(), ctx, pixelRatio);
            if (this._private__leftStub !== null) {
                this._private__leftStub._internal_paint(type);
            }
            if (this._private__rightStub !== null) {
                this._private__rightStub._internal_paint(type);
            }
        }
        var topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        var pixelRatio = this._private__topCanvasBinding.pixelRatio;
        topCtx.clearRect(0, 0, Math.ceil(this._private__size._internal_w * pixelRatio), Math.ceil(this._private__size._internal_h * pixelRatio));
        this._private__drawLabels([this._private__chart._internal_model()._internal_crosshairSource()], topCtx, pixelRatio);
    };
    TimeAxisWidget.prototype._private__drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, _this._private__size._internal_w, _this._private__size._internal_h, _this._private__backgroundColor());
        });
    };
    TimeAxisWidget.prototype._private__drawBorder = function (ctx, pixelRatio) {
        if (this._private__chart._internal_options().timeScale.borderVisible) {
            ctx.save();
            ctx.fillStyle = this._private__lineColor();
            var borderSize = Math.max(1, Math.floor(this._private__getRendererOptions()._internal_borderSize * pixelRatio));
            ctx.fillRect(0, 0, Math.ceil(this._private__size._internal_w * pixelRatio), borderSize);
            ctx.restore();
        }
    };
    TimeAxisWidget.prototype._private__drawTickMarks = function (ctx, pixelRatio) {
        var _this = this;
        var tickMarks = this._private__chart._internal_model()._internal_timeScale()._internal_marks();
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
        var maxSpan = tickMarks.reduce(markWithGreaterSpan, tickMarks[0])._internal_span;
        // special case: it looks strange if 15:00 is bold but 14:00 is not
        // so if maxSpan > 30 and < 40 reduce it to 30
        if (maxSpan > 30 && maxSpan < 40) {
            maxSpan = 30;
        }
        ctx.save();
        ctx.strokeStyle = this._private__lineColor();
        var rendererOptions = this._private__getRendererOptions();
        var yText = (rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_fontSize -
            rendererOptions._internal_baselineOffset);
        ctx.textAlign = 'center';
        ctx.fillStyle = this._private__lineColor();
        var borderSize = Math.floor(this._private__getRendererOptions()._internal_borderSize * pixelRatio);
        var tickWidth = Math.max(1, Math.floor(pixelRatio));
        var tickOffset = Math.floor(pixelRatio * 0.5);
        if (this._private__chart._internal_model()._internal_timeScale()._internal_options().borderVisible) {
            ctx.beginPath();
            var tickLen = Math.round(rendererOptions._internal_tickLength * pixelRatio);
            for (var index = tickMarks.length; index--;) {
                var x = Math.round(tickMarks[index]._internal_coord * pixelRatio);
                ctx.rect(x - tickOffset, borderSize, tickWidth, tickLen);
            }
            ctx.fill();
        }
        ctx.fillStyle = this._private__textColor();
        drawScaled(ctx, pixelRatio, function () {
            // draw base marks
            ctx.font = _this._private__baseFont();
            for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
                var tickMark = tickMarks_1[_i];
                if (tickMark._internal_span < maxSpan) {
                    ctx.fillText(tickMark._internal_label, tickMark._internal_coord, yText);
                }
            }
            ctx.font = _this._private__baseBoldFont();
            for (var _a = 0, tickMarks_2 = tickMarks; _a < tickMarks_2.length; _a++) {
                var tickMark = tickMarks_2[_a];
                if (tickMark._internal_span >= maxSpan) {
                    ctx.fillText(tickMark._internal_label, tickMark._internal_coord, yText);
                }
            }
        });
    };
    TimeAxisWidget.prototype._private__drawLabels = function (sources, ctx, pixelRatio) {
        var rendererOptions = this._private__getRendererOptions();
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            for (var _a = 0, _b = source._internal_timeAxisViews(); _a < _b.length; _a++) {
                var view = _b[_a];
                ctx.save();
                view._internal_renderer()._internal_draw(ctx, rendererOptions, pixelRatio);
                ctx.restore();
            }
        }
    };
    TimeAxisWidget.prototype._private__backgroundColor = function () {
        return this._private__options.backgroundColor;
    };
    TimeAxisWidget.prototype._private__lineColor = function () {
        return this._private__chart._internal_options().timeScale.borderColor;
    };
    TimeAxisWidget.prototype._private__textColor = function () {
        return this._private__options.textColor;
    };
    TimeAxisWidget.prototype._private__fontSize = function () {
        return this._private__options.fontSize;
    };
    TimeAxisWidget.prototype._private__baseFont = function () {
        return makeFont(this._private__fontSize(), this._private__options.fontFamily);
    };
    TimeAxisWidget.prototype._private__baseBoldFont = function () {
        return makeFont(this._private__fontSize(), this._private__options.fontFamily, 'bold');
    };
    TimeAxisWidget.prototype._private__getRendererOptions = function () {
        if (this._private__rendererOptions === null) {
            this._private__rendererOptions = {
                _internal_borderSize: 1 /* BorderSize */,
                _internal_baselineOffset: NaN,
                _internal_paddingTop: NaN,
                _internal_paddingBottom: NaN,
                _internal_paddingHorizontal: NaN,
                _internal_tickLength: 3 /* TickLength */,
                _internal_fontSize: NaN,
                _internal_font: '',
                _internal_widthCache: new TextWidthCache(),
            };
        }
        var rendererOptions = this._private__rendererOptions;
        var newFont = this._private__baseFont();
        if (rendererOptions._internal_font !== newFont) {
            var fontSize = this._private__fontSize();
            rendererOptions._internal_fontSize = fontSize;
            rendererOptions._internal_font = newFont;
            rendererOptions._internal_paddingTop = Math.ceil(fontSize / 2.5);
            rendererOptions._internal_paddingBottom = rendererOptions._internal_paddingTop;
            rendererOptions._internal_paddingHorizontal = Math.ceil(fontSize / 2);
            rendererOptions._internal_baselineOffset = Math.round(this._private__fontSize() / 5);
            rendererOptions._internal_widthCache._internal_reset();
        }
        return this._private__rendererOptions;
    };
    TimeAxisWidget.prototype._private__setCursor = function (type) {
        this._private__cell.style.cursor = type === 1 /* EwResize */ ? 'ew-resize' : 'default';
    };
    TimeAxisWidget.prototype._private__recreateStubs = function () {
        var model = this._private__chart._internal_model();
        var options = model._internal_options();
        if (!options.leftPriceScale.visible && this._private__leftStub !== null) {
            this._private__leftStubCell.removeChild(this._private__leftStub._internal_getElement());
            this._private__leftStub._internal_destroy();
            this._private__leftStub = null;
        }
        if (!options.rightPriceScale.visible && this._private__rightStub !== null) {
            this._private__rightStubCell.removeChild(this._private__rightStub._internal_getElement());
            this._private__rightStub._internal_destroy();
            this._private__rightStub = null;
        }
        var rendererOptionsProvider = this._private__chart._internal_model()._internal_rendererOptionsProvider();
        var params = {
            _internal_rendererOptionsProvider: rendererOptionsProvider,
        };
        if (options.leftPriceScale.visible && this._private__leftStub === null) {
            var borderVisibleGetter = function () {
                return options.leftPriceScale.borderVisible && model._internal_timeScale()._internal_options().borderVisible;
            };
            this._private__leftStub = new PriceAxisStub('left', this._private__chart._internal_options(), params, borderVisibleGetter);
            this._private__leftStubCell.appendChild(this._private__leftStub._internal_getElement());
        }
        if (options.rightPriceScale.visible && this._private__rightStub === null) {
            var borderVisibleGetter = function () {
                return options.rightPriceScale.borderVisible && model._internal_timeScale()._internal_options().borderVisible;
            };
            this._private__rightStub = new PriceAxisStub('right', this._private__chart._internal_options(), params, borderVisibleGetter);
            this._private__rightStubCell.appendChild(this._private__rightStub._internal_getElement());
        }
    };
    return TimeAxisWidget;
}());
export { TimeAxisWidget };
