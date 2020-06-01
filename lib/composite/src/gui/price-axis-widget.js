import { ensureNotNull } from '../helpers/assertions';
import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { LabelsImageCache } from './labels-image-cache';
import { MouseEventHandler } from './mouse-event-handler';
var CursorType;
(function (CursorType) {
    CursorType[CursorType["Default"] = 0] = "Default";
    CursorType[CursorType["NsResize"] = 1] = "NsResize";
})(CursorType || (CursorType = {}));
var PriceAxisWidget = /** @class */ (function () {
    function PriceAxisWidget(pane, options, rendererOptionsProvider, side) {
        var _this = this;
        this._priceScale = null;
        this._size = null;
        this._updateTimeout = null;
        this._mousedown = false;
        this._isVisible = true;
        this._widthCache = new TextWidthCache(50);
        this._tickMarksCache = new LabelsImageCache(11, '#000');
        this._color = null;
        this._font = null;
        this._prevOptimalWidth = 0;
        this._canvasConfiguredHandler = function () {
            _this._recreateTickMarksCache(_this._rendererOptionsProvider.options());
            var model = _this._pane.chart().model();
            model.lightUpdate();
        };
        this._topCanvasConfiguredHandler = function () {
            var model = _this._pane.chart().model();
            model.lightUpdate();
        };
        this._pane = pane;
        this._options = options;
        this._rendererOptionsProvider = rendererOptionsProvider;
        this._isLeft = side === 'left';
        this._cell = document.createElement('div');
        this._cell.style.height = '100%';
        this._cell.style.overflow = 'hidden';
        this._cell.style.width = '25px';
        this._cell.style.left = '0';
        this._cell.style.position = 'relative';
        this._canvasBinding = createBoundCanvas(this._cell, new Size(16, 16));
        this._canvasBinding.subscribeCanvasConfigured(this._canvasConfiguredHandler);
        var canvas = this._canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._topCanvasBinding = createBoundCanvas(this._cell, new Size(16, 16));
        this._topCanvasBinding.subscribeCanvasConfigured(this._topCanvasConfiguredHandler);
        var topCanvas = this._topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        var handler = {
            mouseDownEvent: this._mouseDownEvent.bind(this),
            pressedMouseMoveEvent: this._pressedMouseMoveEvent.bind(this),
            mouseDownOutsideEvent: this._mouseDownOutsideEvent.bind(this),
            mouseUpEvent: this._mouseUpEvent.bind(this),
            mouseDoubleClickEvent: this._mouseDoubleClickEvent.bind(this),
            mouseEnterEvent: this._mouseEnterEvent.bind(this),
            mouseLeaveEvent: this._mouseLeaveEvent.bind(this),
        };
        this._mouseEventHandler = new MouseEventHandler(this._topCanvasBinding.canvas, handler, {
            treatVertTouchDragAsPageScroll: false,
            treatHorzTouchDragAsPageScroll: true,
        });
    }
    PriceAxisWidget.prototype.destroy = function () {
        this._mouseEventHandler.destroy();
        this._topCanvasBinding.unsubscribeCanvasConfigured(this._topCanvasConfiguredHandler);
        this._topCanvasBinding.destroy();
        this._canvasBinding.unsubscribeCanvasConfigured(this._canvasConfiguredHandler);
        this._canvasBinding.destroy();
        if (this._priceScale !== null) {
            this._priceScale.onMarksChanged().unsubscribeAll(this);
            this._priceScale.optionsChanged().unsubscribeAll(this);
        }
        this._priceScale = null;
        if (this._updateTimeout !== null) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        this._tickMarksCache.destroy();
    };
    PriceAxisWidget.prototype.getElement = function () {
        return this._cell;
    };
    PriceAxisWidget.prototype.backgroundColor = function () {
        return this._options.backgroundColor;
    };
    PriceAxisWidget.prototype.lineColor = function () {
        return ensureNotNull(this._priceScale).options().borderColor;
    };
    PriceAxisWidget.prototype.textColor = function () {
        return this._options.textColor;
    };
    PriceAxisWidget.prototype.fontSize = function () {
        return this._options.fontSize;
    };
    PriceAxisWidget.prototype.baseFont = function () {
        return makeFont(this.fontSize(), this._options.fontFamily);
    };
    PriceAxisWidget.prototype.rendererOptions = function () {
        var options = this._rendererOptionsProvider.options();
        var isColorChanged = this._color !== options.color;
        var isFontChanged = this._font !== options.font;
        if (isColorChanged || isFontChanged) {
            this._recreateTickMarksCache(options);
            this._color = options.color;
        }
        if (isFontChanged) {
            this._widthCache.reset();
            this._font = options.font;
        }
        return options;
    };
    PriceAxisWidget.prototype.optimalWidth = function () {
        if (!this.isVisible() || this._priceScale === null) {
            return 0;
        }
        // need some reasonable value for scale while initialization
        var tickMarkMaxWidth = 34;
        var rendererOptions = this.rendererOptions();
        var ctx = getContext2D(this._canvasBinding.canvas);
        var tickMarks = this._priceScale.marks();
        ctx.font = this.baseFont();
        if (tickMarks.length > 0) {
            tickMarkMaxWidth = Math.max(this._widthCache.measureText(ctx, tickMarks[0].label), this._widthCache.measureText(ctx, tickMarks[tickMarks.length - 1].label));
        }
        var views = this._backLabels();
        for (var j = views.length; j--;) {
            var width = this._widthCache.measureText(ctx, views[j].text());
            if (width > tickMarkMaxWidth) {
                tickMarkMaxWidth = width;
            }
        }
        var res = Math.ceil(rendererOptions.borderSize +
            rendererOptions.tickLength +
            rendererOptions.paddingInner +
            rendererOptions.paddingOuter +
            tickMarkMaxWidth);
        // make it even
        res += res % 2;
        return res;
    };
    PriceAxisWidget.prototype.setSize = function (size) {
        if (size.w < 0 || size.h < 0) {
            throw new Error('Try to set invalid size to PriceAxisWidget ' + JSON.stringify(size));
        }
        if (this._size === null || !this._size.equals(size)) {
            this._size = size;
            this._canvasBinding.resizeCanvas({ width: size.w, height: size.h });
            this._topCanvasBinding.resizeCanvas({ width: size.w, height: size.h });
            this._cell.style.width = size.w + 'px';
            // need this for IE11
            this._cell.style.height = size.h + 'px';
            this._cell.style.minWidth = size.w + 'px'; // for right calculate position of .pane-legend
        }
    };
    PriceAxisWidget.prototype.getWidth = function () {
        return ensureNotNull(this._size).w;
    };
    PriceAxisWidget.prototype.setPriceScale = function (priceScale) {
        if (this._priceScale === priceScale) {
            return;
        }
        if (this._priceScale !== null) {
            this._priceScale.onMarksChanged().unsubscribeAll(this);
            this._priceScale.optionsChanged().unsubscribeAll(this);
        }
        this._priceScale = priceScale;
        priceScale.onMarksChanged().subscribe(this._onMarksChanged.bind(this), this);
    };
    PriceAxisWidget.prototype.priceScale = function () {
        return this._priceScale;
    };
    PriceAxisWidget.prototype.isVisible = function () {
        return this._isVisible;
    };
    PriceAxisWidget.prototype.setVisible = function (visible) {
        if (visible === this._isVisible) {
            return;
        }
        if (visible) {
            this._cell.style.display = 'table-cell';
        }
        else {
            this._cell.style.display = 'none';
        }
        this._isVisible = visible;
    };
    PriceAxisWidget.prototype.setAutoScale = function (on) {
        var pane = this._pane.state();
        var model = this._pane.chart().model();
        model.setPriceAutoScale(pane, ensureNotNull(this.priceScale()), on);
    };
    PriceAxisWidget.prototype.reset = function () {
        var pane = this._pane.state();
        var model = this._pane.chart().model();
        model.resetPriceScale(pane, ensureNotNull(this.priceScale()));
    };
    PriceAxisWidget.prototype.paint = function (type) {
        if (!this._isVisible || this._size === null) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            var ctx = getContext2D(this._canvasBinding.canvas);
            this._alignLabels();
            this._drawBackground(ctx, this._canvasBinding.pixelRatio);
            this._drawBorder(ctx, this._canvasBinding.pixelRatio);
            this._drawTickMarks(ctx, this._canvasBinding.pixelRatio);
            this._drawBackLabels(ctx, this._canvasBinding.pixelRatio);
        }
        var topCtx = getContext2D(this._topCanvasBinding.canvas);
        var width = this._size.w;
        var height = this._size.h;
        drawScaled(topCtx, this._topCanvasBinding.pixelRatio, function () {
            topCtx.clearRect(0, 0, width, height);
        });
        this._drawCrosshairLabel(topCtx, this._topCanvasBinding.pixelRatio);
    };
    PriceAxisWidget.prototype.getImage = function () {
        return this._canvasBinding.canvas;
    };
    PriceAxisWidget.prototype.isLeft = function () {
        return this._isLeft;
    };
    PriceAxisWidget.prototype._mouseDownEvent = function (e) {
        if (this._priceScale === null || this._priceScale.isEmpty() || !this._pane.chart().options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._pane.chart().model();
        var pane = this._pane.state();
        this._mousedown = true;
        model.startScalePrice(pane, this._priceScale, e.localY);
    };
    PriceAxisWidget.prototype._pressedMouseMoveEvent = function (e) {
        if (this._priceScale === null || !this._pane.chart().options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._pane.chart().model();
        var pane = this._pane.state();
        var priceScale = this._priceScale;
        model.scalePriceTo(pane, priceScale, e.localY);
    };
    PriceAxisWidget.prototype._mouseDownOutsideEvent = function () {
        if (this._priceScale === null || !this._pane.chart().options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._pane.chart().model();
        var pane = this._pane.state();
        var priceScale = this._priceScale;
        if (this._mousedown) {
            this._mousedown = false;
            model.endScalePrice(pane, priceScale);
        }
    };
    PriceAxisWidget.prototype._mouseUpEvent = function (e) {
        if (this._priceScale === null || !this._pane.chart().options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._pane.chart().model();
        var pane = this._pane.state();
        this._mousedown = false;
        model.endScalePrice(pane, this._priceScale);
    };
    PriceAxisWidget.prototype._mouseDoubleClickEvent = function (e) {
        if (this._pane.chart().options().handleScale.axisDoubleClickReset) {
            this.reset();
        }
    };
    PriceAxisWidget.prototype._mouseEnterEvent = function (e) {
        if (this._priceScale === null) {
            return;
        }
        var model = this._pane.chart().model();
        if (model.options().handleScale.axisPressedMouseMove.price && !this._priceScale.isPercentage() && !this._priceScale.isIndexedTo100()) {
            this._setCursor(1 /* NsResize */);
        }
    };
    PriceAxisWidget.prototype._mouseLeaveEvent = function (e) {
        this._setCursor(0 /* Default */);
    };
    PriceAxisWidget.prototype._backLabels = function () {
        var _this = this;
        var res = [];
        var priceScale = (this._priceScale === null) ? undefined : this._priceScale;
        var addViewsForSources = function (sources) {
            for (var i = 0; i < sources.length; ++i) {
                var source = sources[i];
                var views = source.priceAxisViews(_this._pane.state(), priceScale);
                for (var j = 0; j < views.length; j++) {
                    res.push(views[j]);
                }
            }
        };
        // calculate max and min coordinates for views on selection
        // crosshair individually
        addViewsForSources(this._pane.state().orderedSources());
        return res;
    };
    PriceAxisWidget.prototype._drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        if (this._size === null) {
            return;
        }
        var width = this._size.w;
        var height = this._size.h;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, width, height, _this.backgroundColor());
        });
    };
    PriceAxisWidget.prototype._drawBorder = function (ctx, pixelRatio) {
        if (this._size === null || this._priceScale === null || !this._priceScale.options().borderVisible) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this.lineColor();
        var borderSize = Math.max(1, Math.floor(this.rendererOptions().borderSize * pixelRatio));
        var left;
        if (this._isLeft) {
            left = Math.floor(this._size.w * pixelRatio) - borderSize;
        }
        else {
            left = 0;
        }
        ctx.fillRect(left, 0, borderSize, Math.ceil(this._size.h * pixelRatio));
        ctx.restore();
    };
    PriceAxisWidget.prototype._drawTickMarks = function (ctx, pixelRatio) {
        if (this._size === null || this._priceScale === null) {
            return;
        }
        var tickMarks = this._priceScale.marks();
        ctx.save();
        ctx.strokeStyle = this.lineColor();
        ctx.font = this.baseFont();
        ctx.fillStyle = this.lineColor();
        var rendererOptions = this.rendererOptions();
        var drawTicks = this._priceScale.options().borderVisible;
        var tickMarkLeftX = this._isLeft ?
            Math.floor((this._size.w - rendererOptions.tickLength) * pixelRatio - rendererOptions.borderSize * pixelRatio) :
            Math.floor(rendererOptions.borderSize * pixelRatio);
        var textLeftX = this._isLeft ?
            Math.round(tickMarkLeftX - rendererOptions.paddingInner * pixelRatio) :
            Math.round(tickMarkLeftX + rendererOptions.tickLength * pixelRatio + rendererOptions.paddingInner * pixelRatio);
        var textAlign = this._isLeft ? 'right' : 'left';
        var tickHeight = Math.max(1, Math.floor(pixelRatio));
        var tickOffset = Math.floor(pixelRatio * 0.5);
        if (drawTicks) {
            var tickLength = Math.round(rendererOptions.tickLength * pixelRatio);
            ctx.beginPath();
            for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
                var tickMark = tickMarks_1[_i];
                ctx.rect(tickMarkLeftX, Math.round(tickMark.coord * pixelRatio) - tickOffset, tickLength, tickHeight);
            }
            ctx.fill();
        }
        ctx.fillStyle = this.textColor();
        for (var _a = 0, tickMarks_2 = tickMarks; _a < tickMarks_2.length; _a++) {
            var tickMark = tickMarks_2[_a];
            this._tickMarksCache.paintTo(ctx, tickMark.label, textLeftX, Math.round(tickMark.coord * pixelRatio), textAlign);
        }
        ctx.restore();
    };
    PriceAxisWidget.prototype._alignLabels = function () {
        if (this._size === null || this._priceScale === null) {
            return;
        }
        var center = this._size.h / 2;
        var views = [];
        var orderedSources = this._priceScale.orderedSources().slice(); // Copy of array
        var pane = this._pane;
        var paneState = pane.state();
        var rendererOptions = this.rendererOptions();
        // if we are default price scale, append labels from no-scale
        var isDefault = this._priceScale === paneState.defaultPriceScale();
        if (isDefault) {
            this._pane.state().orderedSources().forEach(function (source) {
                if (paneState.isOverlay(source)) {
                    orderedSources.push(source);
                }
            });
        }
        // we can use any, but let's use the first source as "center" one
        var centerSource = this._priceScale.dataSources()[0];
        var priceScale = this._priceScale;
        var updateForSources = function (sources) {
            sources.forEach(function (source) {
                var sourceViews = source.priceAxisViews(paneState, priceScale);
                // never align selected sources
                sourceViews.forEach(function (view) {
                    view.setFixedCoordinate(null);
                    if (view.isVisible()) {
                        views.push(view);
                    }
                });
                if (centerSource === source && sourceViews.length > 0) {
                    center = sourceViews[0].coordinate();
                }
            });
        };
        // crosshair individually
        updateForSources(orderedSources);
        // split into two parts
        var top = views.filter(function (view) { return view.coordinate() <= center; });
        var bottom = views.filter(function (view) { return view.coordinate() > center; });
        // sort top from center to top
        top.sort(function (l, r) { return r.coordinate() - l.coordinate(); });
        // share center label
        if (top.length && bottom.length) {
            bottom.push(top[0]);
        }
        bottom.sort(function (l, r) { return l.coordinate() - r.coordinate(); });
        views.forEach(function (view) { return view.setFixedCoordinate(view.coordinate()); });
        var options = this._priceScale.options();
        if (!options.alignLabels) {
            return;
        }
        for (var i = 1; i < top.length; i++) {
            var view = top[i];
            var prev = top[i - 1];
            var height = prev.height(rendererOptions, false);
            var coordinate = view.coordinate();
            var prevFixedCoordinate = prev.getFixedCoordinate();
            if (coordinate > prevFixedCoordinate - height) {
                view.setFixedCoordinate(prevFixedCoordinate - height);
            }
        }
        for (var j = 1; j < bottom.length; j++) {
            var view = bottom[j];
            var prev = bottom[j - 1];
            var height = prev.height(rendererOptions, true);
            var coordinate = view.coordinate();
            var prevFixedCoordinate = prev.getFixedCoordinate();
            if (coordinate < prevFixedCoordinate + height) {
                view.setFixedCoordinate(prevFixedCoordinate + height);
            }
        }
    };
    PriceAxisWidget.prototype._drawBackLabels = function (ctx, pixelRatio) {
        var _this = this;
        if (this._size === null) {
            return;
        }
        ctx.save();
        var size = this._size;
        var views = this._backLabels();
        var rendererOptions = this.rendererOptions();
        var align = this._isLeft ? 'right' : 'left';
        views.forEach(function (view) {
            if (view.isAxisLabelVisible()) {
                var renderer = view.renderer();
                ctx.save();
                renderer.draw(ctx, rendererOptions, _this._widthCache, size.w, align, pixelRatio);
                ctx.restore();
            }
        });
        ctx.restore();
    };
    PriceAxisWidget.prototype._drawCrosshairLabel = function (ctx, pixelRatio) {
        var _this = this;
        if (this._size === null || this._priceScale === null) {
            return;
        }
        ctx.save();
        var size = this._size;
        var model = this._pane.chart().model();
        var views = []; // array of arrays
        var pane = this._pane.state();
        var v = model.crosshairSource().priceAxisViews(pane, this._priceScale);
        if (v.length) {
            views.push(v);
        }
        var ro = this.rendererOptions();
        var align = this._isLeft ? 'right' : 'left';
        views.forEach(function (arr) {
            arr.forEach(function (view) {
                ctx.save();
                view.renderer().draw(ctx, ro, _this._widthCache, size.w, align, pixelRatio);
                ctx.restore();
            });
        });
        ctx.restore();
    };
    PriceAxisWidget.prototype._setCursor = function (type) {
        this._cell.style.cursor = type === 1 /* NsResize */ ? 'ns-resize' : 'default';
    };
    PriceAxisWidget.prototype._onMarksChanged = function () {
        var _this = this;
        var width = this.optimalWidth();
        if (this._prevOptimalWidth < width) {
            // avoid price scale is shrunk
            // using < instead !== to avoid infinite changes
            var chart_1 = this._pane.chart();
            if (this._updateTimeout === null) {
                this._updateTimeout = setTimeout(function () {
                    if (chart_1) {
                        chart_1.model().fullUpdate();
                    }
                    _this._updateTimeout = null;
                }, 100);
            }
        }
        this._prevOptimalWidth = width;
    };
    PriceAxisWidget.prototype._recreateTickMarksCache = function (options) {
        this._tickMarksCache.destroy();
        this._tickMarksCache = new LabelsImageCache(options.fontSize, options.color, options.fontFamily);
    };
    return PriceAxisWidget;
}());
export { PriceAxisWidget };
