import { ensureNotNull } from '../helpers/assertions';
import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { LabelsImageCache } from './labels-image-cache';
import { MouseEventHandler } from './mouse-event-handler';
;
var PriceAxisWidget = /** @class */ (function () {
    function PriceAxisWidget(pane, options, rendererOptionsProvider, side) {
        var _this = this;
        this._private__priceScale = null;
        this._private__size = null;
        this._private__updateTimeout = null;
        this._private__mousedown = false;
        this._private__isVisible = true;
        this._private__widthCache = new TextWidthCache(50);
        this._private__tickMarksCache = new LabelsImageCache(11, '#000');
        this._private__color = null;
        this._private__font = null;
        this._private__prevOptimalWidth = 0;
        this._private__canvasConfiguredHandler = function () {
            _this._private__recreateTickMarksCache(_this._private__rendererOptionsProvider._internal_options());
            var model = _this._private__pane._internal_chart()._internal_model();
            model._internal_lightUpdate();
        };
        this._private__topCanvasConfiguredHandler = function () {
            var model = _this._private__pane._internal_chart()._internal_model();
            model._internal_lightUpdate();
        };
        this._private__pane = pane;
        this._private__options = options;
        this._private__rendererOptionsProvider = rendererOptionsProvider;
        this._private__isLeft = side === 'left';
        this._private__cell = document.createElement('div');
        this._private__cell.style.height = '100%';
        this._private__cell.style.overflow = 'hidden';
        this._private__cell.style.width = '25px';
        this._private__cell.style.left = '0';
        this._private__cell.style.position = 'relative';
        this._private__canvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        var canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        var topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        var handler = {
            _internal_mouseDownEvent: this._private__mouseDownEvent.bind(this),
            _internal_pressedMouseMoveEvent: this._private__pressedMouseMoveEvent.bind(this),
            _internal_mouseDownOutsideEvent: this._private__mouseDownOutsideEvent.bind(this),
            _internal_mouseUpEvent: this._private__mouseUpEvent.bind(this),
            _internal_mouseDoubleClickEvent: this._private__mouseDoubleClickEvent.bind(this),
            _internal_mouseEnterEvent: this._private__mouseEnterEvent.bind(this),
            _internal_mouseLeaveEvent: this._private__mouseLeaveEvent.bind(this),
        };
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, handler, {
            _internal_treatVertTouchDragAsPageScroll: false,
            _internal_treatHorzTouchDragAsPageScroll: true,
        });
    }
    PriceAxisWidget.prototype._internal_destroy = function () {
        this._private__mouseEventHandler._internal_destroy();
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
        if (this._private__priceScale !== null) {
            this._private__priceScale._internal_onMarksChanged()._internal_unsubscribeAll(this);
            this._private__priceScale._internal_optionsChanged()._internal_unsubscribeAll(this);
        }
        this._private__priceScale = null;
        if (this._private__updateTimeout !== null) {
            clearTimeout(this._private__updateTimeout);
            this._private__updateTimeout = null;
        }
        this._private__tickMarksCache._internal_destroy();
    };
    PriceAxisWidget.prototype._internal_getElement = function () {
        return this._private__cell;
    };
    PriceAxisWidget.prototype._internal_backgroundColor = function () {
        return this._private__options.backgroundColor;
    };
    PriceAxisWidget.prototype._internal_lineColor = function () {
        return ensureNotNull(this._private__priceScale)._internal_options().borderColor;
    };
    PriceAxisWidget.prototype._internal_textColor = function () {
        return this._private__options.textColor;
    };
    PriceAxisWidget.prototype._internal_fontSize = function () {
        return this._private__options.fontSize;
    };
    PriceAxisWidget.prototype._internal_baseFont = function () {
        return makeFont(this._internal_fontSize(), this._private__options.fontFamily);
    };
    PriceAxisWidget.prototype._internal_rendererOptions = function () {
        var options = this._private__rendererOptionsProvider._internal_options();
        var isColorChanged = this._private__color !== options._internal_color;
        var isFontChanged = this._private__font !== options._internal_font;
        if (isColorChanged || isFontChanged) {
            this._private__recreateTickMarksCache(options);
            this._private__color = options._internal_color;
        }
        if (isFontChanged) {
            this._private__widthCache._internal_reset();
            this._private__font = options._internal_font;
        }
        return options;
    };
    PriceAxisWidget.prototype._internal_optimalWidth = function () {
        if (!this._internal_isVisible() || this._private__priceScale === null) {
            return 0;
        }
        // need some reasonable value for scale while initialization
        var tickMarkMaxWidth = 34;
        var rendererOptions = this._internal_rendererOptions();
        var ctx = getContext2D(this._private__canvasBinding.canvas);
        var tickMarks = this._private__priceScale._internal_marks();
        ctx.font = this._internal_baseFont();
        if (tickMarks.length > 0) {
            tickMarkMaxWidth = Math.max(this._private__widthCache._internal_measureText(ctx, tickMarks[0]._internal_label), this._private__widthCache._internal_measureText(ctx, tickMarks[tickMarks.length - 1]._internal_label));
        }
        var views = this._private__backLabels();
        for (var j = views.length; j--;) {
            var width = this._private__widthCache._internal_measureText(ctx, views[j]._internal_text());
            if (width > tickMarkMaxWidth) {
                tickMarkMaxWidth = width;
            }
        }
        var res = Math.ceil(rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_paddingInner +
            rendererOptions._internal_paddingOuter +
            tickMarkMaxWidth);
        // make it even
        res += res % 2;
        return res;
    };
    PriceAxisWidget.prototype._internal_setSize = function (size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PriceAxisWidget ' + JSON.stringify(size));
        }
        if (this._private__size === null || !this._private__size._internal_equals(size)) {
            this._private__size = size;
            this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__topCanvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__cell.style.width = size._internal_w + 'px';
            // need this for IE11
            this._private__cell.style.height = size._internal_h + 'px';
            this._private__cell.style.minWidth = size._internal_w + 'px'; // for right calculate position of .pane-legend
        }
    };
    PriceAxisWidget.prototype._internal_getWidth = function () {
        return ensureNotNull(this._private__size)._internal_w;
    };
    PriceAxisWidget.prototype._internal_setPriceScale = function (priceScale) {
        if (this._private__priceScale === priceScale) {
            return;
        }
        if (this._private__priceScale !== null) {
            this._private__priceScale._internal_onMarksChanged()._internal_unsubscribeAll(this);
            this._private__priceScale._internal_optionsChanged()._internal_unsubscribeAll(this);
        }
        this._private__priceScale = priceScale;
        priceScale._internal_onMarksChanged()._internal_subscribe(this._private__onMarksChanged.bind(this), this);
    };
    PriceAxisWidget.prototype._internal_priceScale = function () {
        return this._private__priceScale;
    };
    PriceAxisWidget.prototype._internal_isVisible = function () {
        return this._private__isVisible;
    };
    PriceAxisWidget.prototype._internal_setVisible = function (visible) {
        if (visible === this._private__isVisible) {
            return;
        }
        if (visible) {
            this._private__cell.style.display = 'table-cell';
        }
        else {
            this._private__cell.style.display = 'none';
        }
        this._private__isVisible = visible;
    };
    PriceAxisWidget.prototype._internal_setAutoScale = function (on) {
        var pane = this._private__pane._internal_state();
        var model = this._private__pane._internal_chart()._internal_model();
        model._internal_setPriceAutoScale(pane, ensureNotNull(this._internal_priceScale()), on);
    };
    PriceAxisWidget.prototype._internal_reset = function () {
        var pane = this._private__pane._internal_state();
        var model = this._private__pane._internal_chart()._internal_model();
        model._internal_resetPriceScale(pane, ensureNotNull(this._internal_priceScale()));
    };
    PriceAxisWidget.prototype._internal_paint = function (type) {
        if (!this._private__isVisible || this._private__size === null) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            var ctx = getContext2D(this._private__canvasBinding.canvas);
            this._private__alignLabels();
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawTickMarks(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBackLabels(ctx, this._private__canvasBinding.pixelRatio);
        }
        var topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        var width = this._private__size._internal_w;
        var height = this._private__size._internal_h;
        drawScaled(topCtx, this._private__topCanvasBinding.pixelRatio, function () {
            topCtx.clearRect(0, 0, width, height);
        });
        this._private__drawCrosshairLabel(topCtx, this._private__topCanvasBinding.pixelRatio);
    };
    PriceAxisWidget.prototype._internal_getImage = function () {
        return this._private__canvasBinding.canvas;
    };
    PriceAxisWidget.prototype._internal_isLeft = function () {
        return this._private__isLeft;
    };
    PriceAxisWidget.prototype._private__mouseDownEvent = function (e) {
        if (this._private__priceScale === null || this._private__priceScale._internal_isEmpty() || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._private__pane._internal_chart()._internal_model();
        var pane = this._private__pane._internal_state();
        this._private__mousedown = true;
        model._internal_startScalePrice(pane, this._private__priceScale, e._internal_localY);
    };
    PriceAxisWidget.prototype._private__pressedMouseMoveEvent = function (e) {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._private__pane._internal_chart()._internal_model();
        var pane = this._private__pane._internal_state();
        var priceScale = this._private__priceScale;
        model._internal_scalePriceTo(pane, priceScale, e._internal_localY);
    };
    PriceAxisWidget.prototype._private__mouseDownOutsideEvent = function () {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._private__pane._internal_chart()._internal_model();
        var pane = this._private__pane._internal_state();
        var priceScale = this._private__priceScale;
        if (this._private__mousedown) {
            this._private__mousedown = false;
            model._internal_endScalePrice(pane, priceScale);
        }
    };
    PriceAxisWidget.prototype._private__mouseUpEvent = function (e) {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        var model = this._private__pane._internal_chart()._internal_model();
        var pane = this._private__pane._internal_state();
        this._private__mousedown = false;
        model._internal_endScalePrice(pane, this._private__priceScale);
    };
    PriceAxisWidget.prototype._private__mouseDoubleClickEvent = function (e) {
        if (this._private__pane._internal_chart()._internal_options().handleScale.axisDoubleClickReset) {
            this._internal_reset();
        }
    };
    PriceAxisWidget.prototype._private__mouseEnterEvent = function (e) {
        if (this._private__priceScale === null) {
            return;
        }
        var model = this._private__pane._internal_chart()._internal_model();
        if (model._internal_options().handleScale.axisPressedMouseMove.price && !this._private__priceScale._internal_isPercentage() && !this._private__priceScale._internal_isIndexedTo100()) {
            this._private__setCursor(1 /* NsResize */);
        }
    };
    PriceAxisWidget.prototype._private__mouseLeaveEvent = function (e) {
        this._private__setCursor(0 /* Default */);
    };
    PriceAxisWidget.prototype._private__backLabels = function () {
        var _this = this;
        var res = [];
        var priceScale = (this._private__priceScale === null) ? undefined : this._private__priceScale;
        var addViewsForSources = function (sources) {
            for (var i = 0; i < sources.length; ++i) {
                var source = sources[i];
                var views = source._internal_priceAxisViews(_this._private__pane._internal_state(), priceScale);
                for (var j = 0; j < views.length; j++) {
                    res.push(views[j]);
                }
            }
        };
        // calculate max and min coordinates for views on selection
        // crosshair individually
        addViewsForSources(this._private__pane._internal_state()._internal_orderedSources());
        return res;
    };
    PriceAxisWidget.prototype._private__drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        if (this._private__size === null) {
            return;
        }
        var width = this._private__size._internal_w;
        var height = this._private__size._internal_h;
        drawScaled(ctx, pixelRatio, function () {
            clearRect(ctx, 0, 0, width, height, _this._internal_backgroundColor());
        });
    };
    PriceAxisWidget.prototype._private__drawBorder = function (ctx, pixelRatio) {
        if (this._private__size === null || this._private__priceScale === null || !this._private__priceScale._internal_options().borderVisible) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this._internal_lineColor();
        var borderSize = Math.max(1, Math.floor(this._internal_rendererOptions()._internal_borderSize * pixelRatio));
        var left;
        if (this._private__isLeft) {
            left = Math.floor(this._private__size._internal_w * pixelRatio) - borderSize;
        }
        else {
            left = 0;
        }
        ctx.fillRect(left, 0, borderSize, Math.ceil(this._private__size._internal_h * pixelRatio));
        ctx.restore();
    };
    PriceAxisWidget.prototype._private__drawTickMarks = function (ctx, pixelRatio) {
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        var tickMarks = this._private__priceScale._internal_marks();
        ctx.save();
        ctx.strokeStyle = this._internal_lineColor();
        ctx.font = this._internal_baseFont();
        ctx.fillStyle = this._internal_lineColor();
        var rendererOptions = this._internal_rendererOptions();
        var drawTicks = this._private__priceScale._internal_options().borderVisible;
        var tickMarkLeftX = this._private__isLeft ?
            Math.floor((this._private__size._internal_w - rendererOptions._internal_tickLength) * pixelRatio - rendererOptions._internal_borderSize * pixelRatio) :
            Math.floor(rendererOptions._internal_borderSize * pixelRatio);
        var textLeftX = this._private__isLeft ?
            Math.round(tickMarkLeftX - rendererOptions._internal_paddingInner * pixelRatio) :
            Math.round(tickMarkLeftX + rendererOptions._internal_tickLength * pixelRatio + rendererOptions._internal_paddingInner * pixelRatio);
        var textAlign = this._private__isLeft ? 'right' : 'left';
        var tickHeight = Math.max(1, Math.floor(pixelRatio));
        var tickOffset = Math.floor(pixelRatio * 0.5);
        if (drawTicks) {
            var tickLength = Math.round(rendererOptions._internal_tickLength * pixelRatio);
            ctx.beginPath();
            for (var _i = 0, tickMarks_1 = tickMarks; _i < tickMarks_1.length; _i++) {
                var tickMark = tickMarks_1[_i];
                ctx.rect(tickMarkLeftX, Math.round(tickMark._internal_coord * pixelRatio) - tickOffset, tickLength, tickHeight);
            }
            ctx.fill();
        }
        ctx.fillStyle = this._internal_textColor();
        for (var _a = 0, tickMarks_2 = tickMarks; _a < tickMarks_2.length; _a++) {
            var tickMark = tickMarks_2[_a];
            this._private__tickMarksCache._internal_paintTo(ctx, tickMark._internal_label, textLeftX, Math.round(tickMark._internal_coord * pixelRatio), textAlign);
        }
        ctx.restore();
    };
    PriceAxisWidget.prototype._private__alignLabels = function () {
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        var center = this._private__size._internal_h / 2;
        var views = [];
        var orderedSources = this._private__priceScale._internal_orderedSources().slice(); // Copy of array
        var pane = this._private__pane;
        var paneState = pane._internal_state();
        var rendererOptions = this._internal_rendererOptions();
        // if we are default price scale, append labels from no-scale
        var isDefault = this._private__priceScale === paneState._internal_defaultPriceScale();
        if (isDefault) {
            this._private__pane._internal_state()._internal_orderedSources().forEach(function (source) {
                if (paneState._internal_isOverlay(source)) {
                    orderedSources.push(source);
                }
            });
        }
        // we can use any, but let's use the first source as "center" one
        var centerSource = this._private__priceScale._internal_dataSources()[0];
        var priceScale = this._private__priceScale;
        var updateForSources = function (sources) {
            sources.forEach(function (source) {
                var sourceViews = source._internal_priceAxisViews(paneState, priceScale);
                // never align selected sources
                sourceViews.forEach(function (view) {
                    view._internal_setFixedCoordinate(null);
                    if (view._internal_isVisible()) {
                        views.push(view);
                    }
                });
                if (centerSource === source && sourceViews.length > 0) {
                    center = sourceViews[0]._internal_coordinate();
                }
            });
        };
        // crosshair individually
        updateForSources(orderedSources);
        // split into two parts
        var top = views.filter(function (view) { return view._internal_coordinate() <= center; });
        var bottom = views.filter(function (view) { return view._internal_coordinate() > center; });
        // sort top from center to top
        top.sort(function (l, r) { return r._internal_coordinate() - l._internal_coordinate(); });
        // share center label
        if (top.length && bottom.length) {
            bottom.push(top[0]);
        }
        bottom.sort(function (l, r) { return l._internal_coordinate() - r._internal_coordinate(); });
        views.forEach(function (view) { return view._internal_setFixedCoordinate(view._internal_coordinate()); });
        var options = this._private__priceScale._internal_options();
        if (!options.alignLabels) {
            return;
        }
        for (var i = 1; i < top.length; i++) {
            var view = top[i];
            var prev = top[i - 1];
            var height = prev._internal_height(rendererOptions, false);
            var coordinate = view._internal_coordinate();
            var prevFixedCoordinate = prev._internal_getFixedCoordinate();
            if (coordinate > prevFixedCoordinate - height) {
                view._internal_setFixedCoordinate(prevFixedCoordinate - height);
            }
        }
        for (var j = 1; j < bottom.length; j++) {
            var view = bottom[j];
            var prev = bottom[j - 1];
            var height = prev._internal_height(rendererOptions, true);
            var coordinate = view._internal_coordinate();
            var prevFixedCoordinate = prev._internal_getFixedCoordinate();
            if (coordinate < prevFixedCoordinate + height) {
                view._internal_setFixedCoordinate(prevFixedCoordinate + height);
            }
        }
    };
    PriceAxisWidget.prototype._private__drawBackLabels = function (ctx, pixelRatio) {
        var _this = this;
        if (this._private__size === null) {
            return;
        }
        ctx.save();
        var size = this._private__size;
        var views = this._private__backLabels();
        var rendererOptions = this._internal_rendererOptions();
        var align = this._private__isLeft ? 'right' : 'left';
        views.forEach(function (view) {
            if (view._internal_isAxisLabelVisible()) {
                var renderer = view._internal_renderer();
                ctx.save();
                renderer._internal_draw(ctx, rendererOptions, _this._private__widthCache, size._internal_w, align, pixelRatio);
                ctx.restore();
            }
        });
        ctx.restore();
    };
    PriceAxisWidget.prototype._private__drawCrosshairLabel = function (ctx, pixelRatio) {
        var _this = this;
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        ctx.save();
        var size = this._private__size;
        var model = this._private__pane._internal_chart()._internal_model();
        var views = []; // array of arrays
        var pane = this._private__pane._internal_state();
        var v = model._internal_crosshairSource()._internal_priceAxisViews(pane, this._private__priceScale);
        if (v.length) {
            views.push(v);
        }
        var ro = this._internal_rendererOptions();
        var align = this._private__isLeft ? 'right' : 'left';
        views.forEach(function (arr) {
            arr.forEach(function (view) {
                ctx.save();
                view._internal_renderer()._internal_draw(ctx, ro, _this._private__widthCache, size._internal_w, align, pixelRatio);
                ctx.restore();
            });
        });
        ctx.restore();
    };
    PriceAxisWidget.prototype._private__setCursor = function (type) {
        this._private__cell.style.cursor = type === 1 /* NsResize */ ? 'ns-resize' : 'default';
    };
    PriceAxisWidget.prototype._private__onMarksChanged = function () {
        var _this = this;
        var width = this._internal_optimalWidth();
        if (this._private__prevOptimalWidth < width) {
            // avoid price scale is shrunk
            // using < instead !== to avoid infinite changes
            var chart_1 = this._private__pane._internal_chart();
            if (this._private__updateTimeout === null) {
                this._private__updateTimeout = setTimeout(function () {
                    if (chart_1) {
                        chart_1._internal_model()._internal_fullUpdate();
                    }
                    _this._private__updateTimeout = null;
                }, 100);
            }
        }
        this._private__prevOptimalWidth = width;
    };
    PriceAxisWidget.prototype._private__recreateTickMarksCache = function (options) {
        this._private__tickMarksCache._internal_destroy();
        this._private__tickMarksCache = new LabelsImageCache(options._internal_fontSize, options._internal_color, options._internal_fontFamily);
    };
    return PriceAxisWidget;
}());
export { PriceAxisWidget };
