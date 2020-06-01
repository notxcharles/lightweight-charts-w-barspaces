import { clamp } from '../helpers/mathex';
import { createPreconfiguredCanvas, getContext2D, Size } from './canvas-utils';
import { MouseEventHandler } from './mouse-event-handler';
export var SEPARATOR_HEIGHT = 1;
var PaneSeparator = /** @class */ (function () {
    function PaneSeparator(chartWidget, topPaneIndex, bottomPaneIndex, disableResize) {
        this._startY = 0;
        this._deltaY = 0;
        this._totalHeight = 0;
        this._totalStretch = 0;
        this._minPaneHeight = 0;
        this._maxPaneHeight = 0;
        this._pixelStretchFactor = 0;
        this._chartWidget = chartWidget;
        this._paneA = chartWidget.paneWidgets()[topPaneIndex];
        this._paneB = chartWidget.paneWidgets()[bottomPaneIndex];
        this._rowElement = document.createElement('tr');
        this._rowElement.style.height = SEPARATOR_HEIGHT + 'px';
        this._cell = document.createElement('td');
        this._cell.style.padding = '0';
        this._cell.setAttribute('colspan', '3');
        this._updateBorderColor();
        this._rowElement.appendChild(this._cell);
        if (disableResize) {
            this._handle = null;
            this._mouseEventHandler = null;
        }
        else {
            this._handle = document.createElement('div');
            this._handle.style.position = 'absolute';
            this._handle.style.zIndex = '50';
            this._handle.style.height = '5px';
            this._handle.style.width = '100%';
            this._handle.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            this._handle.style.cursor = 'ns-resize';
            this._cell.appendChild(this._handle);
            var handlers = {
                mouseDownEvent: this._mouseDownEvent.bind(this),
                pressedMouseMoveEvent: this._pressedMouseMoveEvent.bind(this),
                mouseUpEvent: this._mouseUpEvent.bind(this),
            };
            this._mouseEventHandler = new MouseEventHandler(this._handle, handlers, {
                treatVertTouchDragAsPageScroll: false,
                treatHorzTouchDragAsPageScroll: true,
            });
        }
    }
    PaneSeparator.prototype.destroy = function () {
        if (this._mouseEventHandler !== null) {
            this._mouseEventHandler.destroy();
        }
    };
    PaneSeparator.prototype.getElement = function () {
        return this._rowElement;
    };
    PaneSeparator.prototype.getSize = function () {
        return new Size(this._paneA.getSize().w, SEPARATOR_HEIGHT);
    };
    PaneSeparator.prototype.getImage = function () {
        var size = this.getSize();
        var res = createPreconfiguredCanvas(document, size);
        var ctx = getContext2D(res);
        ctx.fillStyle = this._chartWidget.options().timeScale.borderColor;
        ctx.fillRect(0, 0, size.w, size.h);
        return res;
    };
    PaneSeparator.prototype.update = function () {
        this._updateBorderColor();
    };
    PaneSeparator.prototype._updateBorderColor = function () {
        this._cell.style.background = this._chartWidget.options().timeScale.borderColor;
    };
    PaneSeparator.prototype._mouseDownEvent = function (event) {
        this._startY = event.pageY;
        this._deltaY = 0;
        this._totalHeight = this._paneA.getSize().h + this._paneB.getSize().h;
        this._totalStretch = this._paneA.stretchFactor() + this._paneB.stretchFactor();
        this._minPaneHeight = 30;
        this._maxPaneHeight = this._totalHeight - this._minPaneHeight;
        this._pixelStretchFactor = this._totalStretch / this._totalHeight;
    };
    PaneSeparator.prototype._pressedMouseMoveEvent = function (event) {
        this._deltaY = (event.pageY - this._startY);
        var upperHeight = this._paneA.getSize().h;
        var newUpperPaneHeight = clamp(upperHeight + this._deltaY, this._minPaneHeight, this._maxPaneHeight);
        var newUpperPaneStretch = newUpperPaneHeight * this._pixelStretchFactor;
        var newLowerPaneStretch = this._totalStretch - newUpperPaneStretch;
        this._paneA.setStretchFactor(newUpperPaneStretch);
        this._paneB.setStretchFactor(newLowerPaneStretch);
        this._chartWidget.model().fullUpdate();
        if (this._paneA.getSize().h !== upperHeight) {
            this._startY = event.pageY;
        }
    };
    PaneSeparator.prototype._mouseUpEvent = function (event) {
        this._startY = 0;
        this._deltaY = 0;
        this._totalHeight = 0;
        this._totalStretch = 0;
        this._minPaneHeight = 0;
        this._maxPaneHeight = 0;
        this._pixelStretchFactor = 0;
    };
    return PaneSeparator;
}());
export { PaneSeparator };
