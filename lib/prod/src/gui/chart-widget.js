import { ensureDefined, ensureNotNull } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
import { Delegate } from '../helpers/delegate';
import { ChartModel } from '../model/chart-model';
import { InvalidateMask } from '../model/invalidate-mask';
import { Series } from '../model/series';
import { createPreconfiguredCanvas, getCanvasDevicePixelRatio, getContext2D, Size } from './canvas-utils';
import { PaneSeparator, SEPARATOR_HEIGHT } from './pane-separator';
import { PaneWidget } from './pane-widget';
import { TimeAxisWidget } from './time-axis-widget';
var ChartWidget = /** @class */ (function () {
    function ChartWidget(container, options) {
        this._private__paneWidgets = [];
        this._private__paneSeparators = [];
        this._private__drawRafId = 0;
        this._private__height = 0;
        this._private__width = 0;
        this._private__leftPriceAxisWidth = 0;
        this._private__rightPriceAxisWidth = 0;
        this._private__invalidateMask = null;
        this._private__drawPlanned = false;
        this._private__clicked = new Delegate();
        this._private__crosshairMoved = new Delegate();
        this._private__options = options;
        this._private__element = document.createElement('div');
        this._private__element.classList.add('tv-lightweight-charts');
        this._private__element.style.overflow = 'hidden';
        this._private__element.style.width = '100%';
        this._private__element.style.height = '100%';
        this._private__tableElement = document.createElement('table');
        this._private__tableElement.setAttribute('cellspacing', '0');
        this._private__element.appendChild(this._private__tableElement);
        this._private__onWheelBound = this._private__onMousewheel.bind(this);
        this._private__element.addEventListener('wheel', this._private__onWheelBound, { passive: false });
        this._private__model = new ChartModel(this._private__invalidateHandler.bind(this), this._private__options);
        this._internal_model()._internal_crosshairMoved()._internal_subscribe(this._private__onPaneWidgetCrosshairMoved.bind(this), this);
        this._private__timeAxisWidget = new TimeAxisWidget(this);
        this._private__tableElement.appendChild(this._private__timeAxisWidget._internal_getElement());
        var width = this._private__options.width;
        var height = this._private__options.height;
        if (width === 0 || height === 0) {
            var containerRect = container.getBoundingClientRect();
            // TODO: Fix it better
            // on Hi-DPI CSS size * Device Pixel Ratio should be integer to avoid smoothing
            // For chart widget we decreases because we must be inside container.
            // For time axis this is not important, since it just affects space for pane widgets
            if (width === 0) {
                width = Math.floor(containerRect.width);
                width -= width % 2;
            }
            if (height === 0) {
                height = Math.floor(containerRect.height);
                height -= height % 2;
            }
        }
        width = Math.max(70, width);
        height = Math.max(50, height);
        // BEWARE: resize must be called BEFORE _syncGuiWithModel (in constructor only)
        // or after but with adjustSize to properly update time scale
        this._internal_resize(width, height);
        this._private__syncGuiWithModel();
        container.appendChild(this._private__element);
        this._private__updateTimeAxisVisibility();
        this._private__model._internal_timeScale()._internal_optionsApplied()._internal_subscribe(this._private__model._internal_fullUpdate.bind(this._private__model), this);
        this._private__model._internal_priceScalesOptionsChanged()._internal_subscribe(this._private__model._internal_fullUpdate.bind(this._private__model), this);
    }
    ChartWidget.prototype._internal_model = function () {
        return this._private__model;
    };
    ChartWidget.prototype._internal_options = function () {
        return this._private__options;
    };
    ChartWidget.prototype._internal_paneWidgets = function () {
        return this._private__paneWidgets;
    };
    ChartWidget.prototype._internal_destroy = function () {
        this._private__element.removeEventListener('wheel', this._private__onWheelBound);
        if (this._private__drawRafId !== 0) {
            window.cancelAnimationFrame(this._private__drawRafId);
        }
        this._private__model._internal_crosshairMoved()._internal_unsubscribeAll(this);
        this._private__model._internal_timeScale()._internal_optionsApplied()._internal_unsubscribeAll(this);
        this._private__model._internal_priceScalesOptionsChanged()._internal_unsubscribeAll(this);
        this._private__model._internal_destroy();
        for (var _i = 0, _a = this._private__paneWidgets; _i < _a.length; _i++) {
            var paneWidget = _a[_i];
            this._private__tableElement.removeChild(paneWidget._internal_getElement());
            paneWidget._internal_clicked()._internal_unsubscribeAll(this);
            paneWidget._internal_destroy();
        }
        this._private__paneWidgets = [];
        for (var _b = 0, _c = this._private__paneSeparators; _b < _c.length; _b++) {
            var paneSeparator = _c[_b];
            this._private__destroySeparator(paneSeparator);
        }
        this._private__paneSeparators = [];
        ensureNotNull(this._private__timeAxisWidget)._internal_destroy();
        if (this._private__element.parentElement !== null) {
            this._private__element.parentElement.removeChild(this._private__element);
        }
        this._private__crosshairMoved._internal_destroy();
        this._private__clicked._internal_destroy();
        delete this._private__element;
    };
    ChartWidget.prototype._internal_resize = function (width, height, forceRepaint) {
        if (forceRepaint === void 0) { forceRepaint = false; }
        if (this._private__height === height && this._private__width === width) {
            return;
        }
        this._private__height = height;
        this._private__width = width;
        var heightStr = height + 'px';
        var widthStr = width + 'px';
        ensureNotNull(this._private__element).style.height = heightStr;
        ensureNotNull(this._private__element).style.width = widthStr;
        this._private__tableElement.style.height = heightStr;
        this._private__tableElement.style.width = widthStr;
        if (forceRepaint) {
            this._private__drawImpl(new InvalidateMask(3 /* Full */));
        }
        else {
            this._private__model._internal_fullUpdate();
        }
    };
    ChartWidget.prototype._internal_paint = function (invalidateMask) {
        if (invalidateMask === undefined) {
            invalidateMask = new InvalidateMask(3 /* Full */);
        }
        for (var i = 0; i < this._private__paneWidgets.length; i++) {
            this._private__paneWidgets[i]._internal_paint(invalidateMask._internal_invalidateForPane(i)._internal_level);
        }
        this._private__timeAxisWidget._internal_paint(invalidateMask._internal_fullInvalidation());
    };
    ChartWidget.prototype._internal_applyOptions = function (options) {
        this._private__model._internal_applyOptions(options);
        this._private__updateTimeAxisVisibility();
        var width = options.width || this._private__width;
        var height = options.height || this._private__height;
        this._internal_resize(width, height);
    };
    ChartWidget.prototype._internal_clicked = function () {
        return this._private__clicked;
    };
    ChartWidget.prototype._internal_crosshairMoved = function () {
        return this._private__crosshairMoved;
    };
    ChartWidget.prototype._internal_takeScreenshot = function () {
        var _this = this;
        if (this._private__invalidateMask !== null) {
            this._private__drawImpl(this._private__invalidateMask);
            this._private__invalidateMask = null;
        }
        // calculate target size
        var firstPane = this._private__paneWidgets[0];
        var targetCanvas = createPreconfiguredCanvas(document, new Size(this._private__width, this._private__height));
        var ctx = getContext2D(targetCanvas);
        var pixelRatio = getCanvasDevicePixelRatio(targetCanvas);
        drawScaled(ctx, pixelRatio, function () {
            var targetX = 0;
            var targetY = 0;
            var drawPriceAxises = function (position) {
                for (var paneIndex = 0; paneIndex < _this._private__paneWidgets.length; paneIndex++) {
                    var paneWidget = _this._private__paneWidgets[paneIndex];
                    var paneWidgetHeight = paneWidget._internal_getSize()._internal_h;
                    var priceAxisWidget = ensureNotNull(position === 'left' ? paneWidget._internal_leftPriceAxisWidget() : paneWidget._internal_rightPriceAxisWidget());
                    var image = priceAxisWidget._internal_getImage();
                    ctx.drawImage(image, targetX, targetY, priceAxisWidget._internal_getWidth(), paneWidgetHeight);
                    targetY += paneWidgetHeight;
                    if (paneIndex < _this._private__paneWidgets.length - 1) {
                        var separator = _this._private__paneSeparators[paneIndex];
                        var separatorSize = separator._internal_getSize();
                        var separatorImage = separator._internal_getImage();
                        ctx.drawImage(separatorImage, targetX, targetY, separatorSize._internal_w, separatorSize._internal_h);
                        targetY += separatorSize._internal_h;
                    }
                }
            };
            // draw left price scale if exists
            if (_this._private__isLeftAxisVisible()) {
                drawPriceAxises('left');
                targetX = ensureNotNull(firstPane._internal_leftPriceAxisWidget())._internal_getWidth();
            }
            targetY = 0;
            for (var paneIndex = 0; paneIndex < _this._private__paneWidgets.length; paneIndex++) {
                var paneWidget = _this._private__paneWidgets[paneIndex];
                var paneWidgetSize = paneWidget._internal_getSize();
                var image = paneWidget._internal_getImage();
                ctx.drawImage(image, targetX, targetY, paneWidgetSize._internal_w, paneWidgetSize._internal_h);
                targetY += paneWidgetSize._internal_h;
                if (paneIndex < _this._private__paneWidgets.length - 1) {
                    var separator = _this._private__paneSeparators[paneIndex];
                    var separatorSize = separator._internal_getSize();
                    var separatorImage = separator._internal_getImage();
                    ctx.drawImage(separatorImage, targetX, targetY, separatorSize._internal_w, separatorSize._internal_h);
                    targetY += separatorSize._internal_h;
                }
            }
            targetX += firstPane._internal_getSize()._internal_w;
            if (_this._private__isRightAxisVisible()) {
                targetY = 0;
                drawPriceAxises('right');
            }
            var drawStub = function (position) {
                var stub = ensureNotNull(position === 'left' ? _this._private__timeAxisWidget._internal_leftStub() : _this._private__timeAxisWidget._internal_rightStub());
                var size = stub._internal_getSize();
                var image = stub._internal_getImage();
                ctx.drawImage(image, targetX, targetY, size._internal_w, size._internal_h);
            };
            // draw time scale
            if (_this._private__options.timeScale.visible) {
                targetX = 0;
                if (_this._private__isLeftAxisVisible()) {
                    drawStub('left');
                    targetX = ensureNotNull(firstPane._internal_leftPriceAxisWidget())._internal_getWidth();
                }
                var size = _this._private__timeAxisWidget._internal_getSize();
                var image = _this._private__timeAxisWidget._internal_getImage();
                ctx.drawImage(image, targetX, targetY, size._internal_w, size._internal_h);
                if (_this._private__isRightAxisVisible()) {
                    targetX = firstPane._internal_getSize()._internal_w;
                    drawStub('right');
                    ctx.restore();
                }
            }
        });
        return targetCanvas;
    };
    ChartWidget.prototype._internal_getPriceAxisWidth = function (position) {
        if (position === 'none') {
            return 0;
        }
        if (position === 'left' && !this._private__isLeftAxisVisible()) {
            return 0;
        }
        if (position === 'right' && !this._private__isRightAxisVisible()) {
            return 0;
        }
        if (this._private__paneWidgets.length === 0) {
            return 0;
        }
        // we don't need to worry about exactly pane widget here
        // because all pane widgets have the same width of price axis widget
        // see _adjustSizeImpl
        var priceAxisWidget = position === 'left'
            ? this._private__paneWidgets[0]._internal_leftPriceAxisWidget()
            : this._private__paneWidgets[0]._internal_rightPriceAxisWidget();
        return ensureNotNull(priceAxisWidget)._internal_getWidth();
    };
    // tslint:disable-next-line:cyclomatic-complexity
    ChartWidget.prototype._private__adjustSizeImpl = function () {
        var totalStretch = 0;
        var leftPriceAxisWidth = 0;
        var rightPriceAxisWidth = 0;
        for (var _i = 0, _a = this._private__paneWidgets; _i < _a.length; _i++) {
            var paneWidget = _a[_i];
            if (this._private__isLeftAxisVisible()) {
                leftPriceAxisWidth = Math.max(leftPriceAxisWidth, ensureNotNull(paneWidget._internal_leftPriceAxisWidget())._internal_optimalWidth());
            }
            if (this._private__isRightAxisVisible()) {
                rightPriceAxisWidth = Math.max(rightPriceAxisWidth, ensureNotNull(paneWidget._internal_rightPriceAxisWidget())._internal_optimalWidth());
            }
            totalStretch += paneWidget._internal_stretchFactor();
        }
        var width = this._private__width;
        var height = this._private__height;
        var paneWidth = Math.max(width - leftPriceAxisWidth - rightPriceAxisWidth, 0);
        var separatorCount = this._private__paneSeparators.length;
        var separatorHeight = SEPARATOR_HEIGHT;
        var separatorsHeight = separatorHeight * separatorCount;
        var timeAxisHeight = this._private__options.timeScale.visible ? this._private__timeAxisWidget._internal_optimalHeight() : 0;
        // TODO: Fix it better
        // on Hi-DPI CSS size * Device Pixel Ratio should be integer to avoid smoothing
        if (timeAxisHeight % 2) {
            timeAxisHeight += 1;
        }
        var otherWidgetHeight = separatorsHeight + timeAxisHeight;
        var totalPaneHeight = height < otherWidgetHeight ? 0 : height - otherWidgetHeight;
        var stretchPixels = totalPaneHeight / totalStretch;
        var accumulatedHeight = 0;
        for (var paneIndex = 0; paneIndex < this._private__paneWidgets.length; ++paneIndex) {
            var paneWidget = this._private__paneWidgets[paneIndex];
            paneWidget._internal_setState(this._private__model._internal_panes()[paneIndex]);
            var paneHeight = 0;
            var calculatePaneHeight = 0;
            if (paneIndex === this._private__paneWidgets.length - 1) {
                calculatePaneHeight = totalPaneHeight - accumulatedHeight;
            }
            else {
                calculatePaneHeight = Math.round(paneWidget._internal_stretchFactor() * stretchPixels);
            }
            paneHeight = Math.max(calculatePaneHeight, 2);
            accumulatedHeight += paneHeight;
            paneWidget._internal_setSize(new Size(paneWidth, paneHeight));
            if (this._private__isLeftAxisVisible()) {
                paneWidget._internal_setPriceAxisSize(leftPriceAxisWidth, 'left');
            }
            if (this._private__isRightAxisVisible()) {
                paneWidget._internal_setPriceAxisSize(rightPriceAxisWidth, 'right');
            }
            if (paneWidget._internal_state()) {
                this._private__model._internal_setPaneHeight(paneWidget._internal_state(), paneHeight);
            }
        }
        this._private__timeAxisWidget._internal_setSizes(new Size(paneWidth, timeAxisHeight), leftPriceAxisWidth, rightPriceAxisWidth);
        this._private__model._internal_setWidth(paneWidth);
        if (this._private__leftPriceAxisWidth !== leftPriceAxisWidth) {
            this._private__leftPriceAxisWidth = leftPriceAxisWidth;
        }
        if (this._private__rightPriceAxisWidth !== rightPriceAxisWidth) {
            this._private__rightPriceAxisWidth = rightPriceAxisWidth;
        }
    };
    ChartWidget.prototype._private__onMousewheel = function (event) {
        var deltaX = event.deltaX / 100;
        var deltaY = -(event.deltaY / 100);
        if ((deltaX === 0 || !this._private__options.handleScroll.mouseWheel) &&
            (deltaY === 0 || !this._private__options.handleScale.mouseWheel)) {
            return;
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        switch (event.deltaMode) {
            case event.DOM_DELTA_PAGE:
                // one screen at time scroll mode
                deltaX *= 120;
                deltaY *= 120;
                break;
            case event.DOM_DELTA_LINE:
                // one line at time scroll mode
                deltaX *= 32;
                deltaY *= 32;
                break;
        }
        if (deltaY !== 0 && this._private__options.handleScale.mouseWheel) {
            var zoomScale = Math.sign(deltaY) * Math.min(1, Math.abs(deltaY));
            var scrollPosition = event.clientX - this._private__element.getBoundingClientRect().left;
            this._internal_model()._internal_zoomTime(scrollPosition, zoomScale);
        }
        if (deltaX !== 0 && this._private__options.handleScroll.mouseWheel) {
            this._internal_model()._internal_scrollChart(deltaX * -80); // 80 is a made up coefficient, and minus is for the "natural" scroll
        }
    };
    ChartWidget.prototype._private__drawImpl = function (invalidateMask) {
        var invalidationType = invalidateMask._internal_fullInvalidation();
        // actions for full invalidation ONLY (not shared with light)
        if (invalidationType === 3 /* Full */) {
            this._private__updateGui();
        }
        // light or full invalidate actions
        if (invalidationType === 3 /* Full */ ||
            invalidationType === 2 /* Light */) {
            var panes = this._private__model._internal_panes();
            for (var i = 0; i < panes.length; i++) {
                if (invalidateMask._internal_invalidateForPane(i)._internal_autoScale) {
                    panes[i]._internal_momentaryAutoScale();
                }
            }
            if (invalidateMask._internal_getFitContent()) {
                this._private__model._internal_timeScale()._internal_fitContent();
            }
            var logicalRange = invalidateMask._internal_getLogicalRange();
            if (logicalRange !== null) {
                this._private__model._internal_timeScale()._internal_setLogicalRange(logicalRange);
            }
            this._private__timeAxisWidget._internal_update();
        }
        this._internal_paint(invalidateMask);
    };
    ChartWidget.prototype._private__invalidateHandler = function (invalidateMask) {
        var _this = this;
        if (this._private__invalidateMask !== null) {
            this._private__invalidateMask._internal_merge(invalidateMask);
        }
        else {
            this._private__invalidateMask = invalidateMask;
        }
        if (!this._private__drawPlanned) {
            this._private__drawPlanned = true;
            this._private__drawRafId = window.requestAnimationFrame(function () {
                _this._private__drawPlanned = false;
                _this._private__drawRafId = 0;
                if (_this._private__invalidateMask !== null) {
                    _this._private__drawImpl(_this._private__invalidateMask);
                    _this._private__invalidateMask = null;
                }
            });
        }
    };
    ChartWidget.prototype._private__updateGui = function () {
        this._private__syncGuiWithModel();
    };
    ChartWidget.prototype._private__destroySeparator = function (separator) {
        this._private__tableElement.removeChild(separator._internal_getElement());
        separator._internal_destroy();
    };
    ChartWidget.prototype._private__syncGuiWithModel = function () {
        var panes = this._private__model._internal_panes();
        var targetPaneWidgetsCount = panes.length;
        var actualPaneWidgetsCount = this._private__paneWidgets.length;
        // Remove (if needed) pane widgets and separators
        for (var i = targetPaneWidgetsCount; i < actualPaneWidgetsCount; i++) {
            var paneWidget = ensureDefined(this._private__paneWidgets.pop());
            this._private__tableElement.removeChild(paneWidget._internal_getElement());
            paneWidget._internal_clicked()._internal_unsubscribeAll(this);
            paneWidget._internal_destroy();
            var paneSeparator = this._private__paneSeparators.pop();
            if (paneSeparator !== undefined) {
                this._private__destroySeparator(paneSeparator);
            }
        }
        // Create (if needed) new pane widgets and separators
        for (var i = actualPaneWidgetsCount; i < targetPaneWidgetsCount; i++) {
            var paneWidget = new PaneWidget(this, panes[i]);
            paneWidget._internal_clicked()._internal_subscribe(this._private__onPaneWidgetClicked.bind(this), this);
            this._private__paneWidgets.push(paneWidget);
            // create and insert separator
            if (i > 1) {
                var paneSeparator = new PaneSeparator(this, i - 1, i, true);
                this._private__paneSeparators.push(paneSeparator);
                this._private__tableElement.insertBefore(paneSeparator._internal_getElement(), this._private__timeAxisWidget._internal_getElement());
            }
            // insert paneWidget
            this._private__tableElement.insertBefore(paneWidget._internal_getElement(), this._private__timeAxisWidget._internal_getElement());
        }
        for (var i = 0; i < targetPaneWidgetsCount; i++) {
            var state = panes[i];
            var paneWidget = this._private__paneWidgets[i];
            if (paneWidget._internal_state() !== state) {
                paneWidget._internal_setState(state);
            }
            else {
                paneWidget._internal_updatePriceAxisWidgets();
            }
        }
        this._private__updateTimeAxisVisibility();
        this._private__adjustSizeImpl();
    };
    ChartWidget.prototype._private__getMouseEventParamsImpl = function (time, point) {
        var seriesPrices = new Map();
        if (time !== null) {
            var serieses = this._private__model._internal_serieses();
            serieses.forEach(function (s) {
                // TODO: replace with search left
                var prices = s._internal_dataAt(time);
                if (prices !== null) {
                    seriesPrices.set(s, prices);
                }
            });
        }
        var clientTime;
        if (time !== null) {
            var timePoint = this._private__model._internal_timeScale()._internal_indexToUserTime(time);
            if (timePoint !== null) {
                clientTime = timePoint;
            }
        }
        var hoveredSource = this._internal_model()._internal_hoveredSource();
        var hoveredSeries = hoveredSource !== null && hoveredSource._internal_source instanceof Series
            ? hoveredSource._internal_source
            : undefined;
        var hoveredObject = hoveredSource !== null && hoveredSource._internal_object !== undefined
            ? hoveredSource._internal_object._internal_externalId
            : undefined;
        return {
            _internal_time: clientTime,
            _internal_point: point || undefined,
            _internal_hoveredSeries: hoveredSeries,
            _internal_seriesPrices: seriesPrices,
            _internal_hoveredObject: hoveredObject,
        };
    };
    ChartWidget.prototype._private__onPaneWidgetClicked = function (time, point) {
        var _this = this;
        this._private__clicked._internal_fire(function () { return _this._private__getMouseEventParamsImpl(time, point); });
    };
    ChartWidget.prototype._private__onPaneWidgetCrosshairMoved = function (time, point) {
        var _this = this;
        this._private__crosshairMoved._internal_fire(function () { return _this._private__getMouseEventParamsImpl(time, point); });
    };
    ChartWidget.prototype._private__updateTimeAxisVisibility = function () {
        var display = this._private__options.timeScale.visible ? '' : 'none';
        this._private__timeAxisWidget._internal_getElement().style.display = display;
    };
    ChartWidget.prototype._private__isLeftAxisVisible = function () {
        return this._private__options.leftPriceScale.visible;
    };
    ChartWidget.prototype._private__isRightAxisVisible = function () {
        return this._private__options.rightPriceScale.visible;
    };
    return ChartWidget;
}());
export { ChartWidget };
