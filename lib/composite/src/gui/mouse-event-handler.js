import { ensure } from '../helpers/assertions';
import { mobileTouch } from './support-touch';
// we can use `const name = 500;` but with `const enum` this values will be inlined into code
// so we do not need to have it as variables
var Delay;
(function (Delay) {
    Delay[Delay["ResetClick"] = 500] = "ResetClick";
    Delay[Delay["LongTap"] = 240] = "LongTap";
})(Delay || (Delay = {}));
// TODO: get rid of a lot of boolean flags, probably we should replace it with some enum
var MouseEventHandler = /** @class */ (function () {
    function MouseEventHandler(target, handler, options) {
        this._clickCount = 0;
        this._clickTimeoutId = null;
        this._longTapTimeoutId = null;
        this._longTapActive = false;
        this._mouseMoveStartPosition = null;
        this._moveExceededManhattanDistance = false;
        this._cancelClick = false;
        this._unsubscribeOutsideEvents = null;
        this._unsubscribeMousemove = null;
        this._unsubscribeRoot = null;
        this._startPinchMiddlePoint = null;
        this._startPinchDistance = 0;
        this._pinchPrevented = false;
        this._preventDragProcess = false;
        this._mousePressed = false;
        this._target = target;
        this._handler = handler;
        this._options = options;
        this._init();
    }
    MouseEventHandler.prototype.destroy = function () {
        if (this._unsubscribeOutsideEvents !== null) {
            this._unsubscribeOutsideEvents();
            this._unsubscribeOutsideEvents = null;
        }
        if (this._unsubscribeMousemove !== null) {
            this._unsubscribeMousemove();
            this._unsubscribeMousemove = null;
        }
        if (this._unsubscribeRoot !== null) {
            this._unsubscribeRoot();
            this._unsubscribeRoot = null;
        }
        this._clearLongTapTimeout();
        this._resetClickTimeout();
    };
    MouseEventHandler.prototype._mouseEnterHandler = function (enterEvent) {
        var _this = this;
        if (this._unsubscribeMousemove) {
            this._unsubscribeMousemove();
        }
        {
            var boundMouseMoveHandler_1 = this._mouseMoveHandler.bind(this);
            this._unsubscribeMousemove = function () {
                _this._target.removeEventListener('mousemove', boundMouseMoveHandler_1);
            };
            this._target.addEventListener('mousemove', boundMouseMoveHandler_1);
        }
        if (isTouchEvent(enterEvent)) {
            this._mouseMoveHandler(enterEvent);
        }
        var compatEvent = this._makeCompatEvent(enterEvent);
        this._processEvent(compatEvent, this._handler.mouseEnterEvent);
    };
    MouseEventHandler.prototype._resetClickTimeout = function () {
        if (this._clickTimeoutId !== null) {
            clearTimeout(this._clickTimeoutId);
        }
        this._clickCount = 0;
        this._clickTimeoutId = null;
    };
    MouseEventHandler.prototype._mouseMoveHandler = function (moveEvent) {
        if (this._mousePressed && !isTouchEvent(moveEvent)) {
            return;
        }
        var compatEvent = this._makeCompatEvent(moveEvent);
        this._processEvent(compatEvent, this._handler.mouseMoveEvent);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    MouseEventHandler.prototype._mouseMoveWithDownHandler = function (moveEvent) {
        if ('button' in moveEvent && moveEvent.button !== 0 /* Left */) {
            return;
        }
        if (this._startPinchMiddlePoint !== null) {
            return;
        }
        var isTouch = isTouchEvent(moveEvent);
        if (this._preventDragProcess && isTouch) {
            return;
        }
        // prevent pinch if move event comes faster than the second touch
        this._pinchPrevented = true;
        var compatEvent = this._makeCompatEvent(moveEvent);
        var startMouseMovePos = ensure(this._mouseMoveStartPosition);
        var xOffset = Math.abs(startMouseMovePos.x - compatEvent.pageX);
        var yOffset = Math.abs(startMouseMovePos.y - compatEvent.pageY);
        var moveExceededManhattanDistance = xOffset + yOffset > 5;
        if (!moveExceededManhattanDistance && isTouch) {
            return;
        }
        if (moveExceededManhattanDistance && !this._moveExceededManhattanDistance && isTouch) {
            // vertical drag is more important than horizontal drag
            // because we scroll the page vertically often than horizontally
            var correctedXOffset = xOffset * 0.5;
            // a drag can be only if touch page scroll isn't allowed
            var isVertDrag = yOffset >= correctedXOffset && !this._options.treatVertTouchDragAsPageScroll;
            var isHorzDrag = correctedXOffset > yOffset && !this._options.treatHorzTouchDragAsPageScroll;
            // if drag event happened then we should revert preventDefault state to original one
            // and try to process the drag event
            // else we shouldn't prevent default of the event and ignore processing the drag event
            if (!isVertDrag && !isHorzDrag) {
                this._preventDragProcess = true;
            }
        }
        if (moveExceededManhattanDistance) {
            this._moveExceededManhattanDistance = true;
            // if manhattan distance is more that 5 - we should cancel click event
            this._cancelClick = true;
            if (isTouch) {
                this._clearLongTapTimeout();
            }
        }
        if (!this._preventDragProcess) {
            this._processEvent(compatEvent, this._handler.pressedMouseMoveEvent);
            // we should prevent default in case of touch only
            // to prevent scroll of the page
            if (isTouch) {
                preventDefault(moveEvent);
            }
        }
    };
    MouseEventHandler.prototype._mouseUpHandler = function (mouseUpEvent) {
        if ('button' in mouseUpEvent && mouseUpEvent.button !== 0 /* Left */) {
            return;
        }
        var compatEvent = this._makeCompatEvent(mouseUpEvent);
        this._clearLongTapTimeout();
        this._mouseMoveStartPosition = null;
        this._mousePressed = false;
        if (this._unsubscribeRoot) {
            this._unsubscribeRoot();
            this._unsubscribeRoot = null;
        }
        if (isTouchEvent(mouseUpEvent)) {
            this._mouseLeaveHandler(mouseUpEvent);
        }
        this._processEvent(compatEvent, this._handler.mouseUpEvent);
        ++this._clickCount;
        if (this._clickTimeoutId && this._clickCount > 1) {
            this._processEvent(compatEvent, this._handler.mouseDoubleClickEvent);
            this._resetClickTimeout();
        }
        else {
            if (!this._cancelClick) {
                this._processEvent(compatEvent, this._handler.mouseClickEvent);
            }
        }
        // prevent safari's dblclick-to-zoom
        // we handle mouseDoubleClickEvent here ourself
        if (isTouchEvent(mouseUpEvent)) {
            preventDefault(mouseUpEvent);
            this._mouseLeaveHandler(mouseUpEvent);
            if (mouseUpEvent.touches.length === 0) {
                this._longTapActive = false;
            }
        }
    };
    MouseEventHandler.prototype._clearLongTapTimeout = function () {
        if (this._longTapTimeoutId === null) {
            return;
        }
        clearTimeout(this._longTapTimeoutId);
        this._longTapTimeoutId = null;
    };
    MouseEventHandler.prototype._mouseDownHandler = function (downEvent) {
        if ('button' in downEvent && downEvent.button !== 0 /* Left */) {
            return;
        }
        var compatEvent = this._makeCompatEvent(downEvent);
        this._cancelClick = false;
        this._moveExceededManhattanDistance = false;
        this._preventDragProcess = false;
        if (isTouchEvent(downEvent)) {
            this._mouseEnterHandler(downEvent);
        }
        this._mouseMoveStartPosition = {
            x: compatEvent.pageX,
            y: compatEvent.pageY,
        };
        if (this._unsubscribeRoot) {
            this._unsubscribeRoot();
            this._unsubscribeRoot = null;
        }
        {
            var boundMouseMoveWithDownHandler_1 = this._mouseMoveWithDownHandler.bind(this);
            var boundMouseUpHandler_1 = this._mouseUpHandler.bind(this);
            var rootElement_1 = this._target.ownerDocument.documentElement;
            this._unsubscribeRoot = function () {
                rootElement_1.removeEventListener('touchmove', boundMouseMoveWithDownHandler_1);
                rootElement_1.removeEventListener('touchend', boundMouseUpHandler_1);
                rootElement_1.removeEventListener('mousemove', boundMouseMoveWithDownHandler_1);
                rootElement_1.removeEventListener('mouseup', boundMouseUpHandler_1);
            };
            rootElement_1.addEventListener('touchmove', boundMouseMoveWithDownHandler_1, { passive: false });
            rootElement_1.addEventListener('touchend', boundMouseUpHandler_1, { passive: false });
            this._clearLongTapTimeout();
            if (isTouchEvent(downEvent) && downEvent.touches.length === 1) {
                this._longTapTimeoutId = setTimeout(this._longTapHandler.bind(this, downEvent), 240 /* LongTap */);
            }
            else {
                rootElement_1.addEventListener('mousemove', boundMouseMoveWithDownHandler_1);
                rootElement_1.addEventListener('mouseup', boundMouseUpHandler_1);
            }
        }
        this._mousePressed = true;
        this._processEvent(compatEvent, this._handler.mouseDownEvent);
        if (!this._clickTimeoutId) {
            this._clickCount = 0;
            this._clickTimeoutId = setTimeout(this._resetClickTimeout.bind(this), 500 /* ResetClick */);
        }
    };
    MouseEventHandler.prototype._init = function () {
        var _this = this;
        this._target.addEventListener('mouseenter', this._mouseEnterHandler.bind(this));
        this._target.addEventListener('touchcancel', this._clearLongTapTimeout.bind(this));
        {
            var doc_1 = this._target.ownerDocument;
            var outsideHandler_1 = function (event) {
                if (!_this._handler.mouseDownOutsideEvent) {
                    return;
                }
                if (event.target && _this._target.contains(event.target)) {
                    return;
                }
                _this._handler.mouseDownOutsideEvent();
            };
            this._unsubscribeOutsideEvents = function () {
                doc_1.removeEventListener('mousedown', outsideHandler_1);
                doc_1.removeEventListener('touchstart', outsideHandler_1);
            };
            doc_1.addEventListener('mousedown', outsideHandler_1);
            doc_1.addEventListener('touchstart', outsideHandler_1, { passive: true });
        }
        this._target.addEventListener('mouseleave', this._mouseLeaveHandler.bind(this));
        this._target.addEventListener('touchstart', this._mouseDownHandler.bind(this), { passive: true });
        if (!mobileTouch) {
            this._target.addEventListener('mousedown', this._mouseDownHandler.bind(this));
        }
        this._initPinch();
        // Hey mobile Safari, what's up?
        // If mobile Safari doesn't have any touchmove handler with passive=false
        // it treats a touchstart and the following touchmove events as cancelable=false,
        // so we can't prevent them (as soon we subscribe on touchmove inside handler of touchstart).
        // And we'll get scroll of the page along with chart's one instead of only chart's scroll.
        this._target.addEventListener('touchmove', function () { }, { passive: false });
    };
    MouseEventHandler.prototype._initPinch = function () {
        var _this = this;
        if (this._handler.pinchStartEvent === undefined &&
            this._handler.pinchEvent === undefined &&
            this._handler.pinchEndEvent === undefined) {
            return;
        }
        this._target.addEventListener('touchstart', function (event) { return _this._checkPinchState(event.touches); }, { passive: true });
        this._target.addEventListener('touchmove', function (event) {
            if (event.touches.length !== 2 || _this._startPinchMiddlePoint === null) {
                return;
            }
            if (_this._handler.pinchEvent !== undefined) {
                var currentDistance = getDistance(event.touches[0], event.touches[1]);
                var scale = currentDistance / _this._startPinchDistance;
                _this._handler.pinchEvent(_this._startPinchMiddlePoint, scale);
                preventDefault(event);
            }
        }, { passive: false });
        this._target.addEventListener('touchend', function (event) {
            _this._checkPinchState(event.touches);
        });
    };
    MouseEventHandler.prototype._checkPinchState = function (touches) {
        if (touches.length === 1) {
            this._pinchPrevented = false;
        }
        if (touches.length !== 2 || this._pinchPrevented || this._longTapActive) {
            this._stopPinch();
        }
        else {
            this._startPinch(touches);
        }
    };
    MouseEventHandler.prototype._startPinch = function (touches) {
        var box = getBoundingClientRect(this._target);
        this._startPinchMiddlePoint = {
            x: ((touches[0].clientX - box.left) + (touches[1].clientX - box.left)) / 2,
            y: ((touches[0].clientY - box.top) + (touches[1].clientY - box.top)) / 2,
        };
        this._startPinchDistance = getDistance(touches[0], touches[1]);
        if (this._handler.pinchStartEvent !== undefined) {
            this._handler.pinchStartEvent();
        }
        this._clearLongTapTimeout();
    };
    MouseEventHandler.prototype._stopPinch = function () {
        if (this._startPinchMiddlePoint === null) {
            return;
        }
        this._startPinchMiddlePoint = null;
        if (this._handler.pinchEndEvent !== undefined) {
            this._handler.pinchEndEvent();
        }
    };
    MouseEventHandler.prototype._mouseLeaveHandler = function (event) {
        if (this._unsubscribeMousemove) {
            this._unsubscribeMousemove();
        }
        var compatEvent = this._makeCompatEvent(event);
        this._processEvent(compatEvent, this._handler.mouseLeaveEvent);
    };
    MouseEventHandler.prototype._longTapHandler = function (event) {
        var compatEvent = this._makeCompatEvent(event);
        this._processEvent(compatEvent, this._handler.longTapEvent);
        this._cancelClick = true;
        // long tap is active untill touchend event with 0 touches occured
        this._longTapActive = true;
    };
    MouseEventHandler.prototype._processEvent = function (event, callback) {
        if (!callback) {
            return;
        }
        callback.call(this._handler, event);
    };
    MouseEventHandler.prototype._makeCompatEvent = function (event) {
        // TouchEvent has no clientX/Y coordinates:
        // We have to use the last Touch instead
        var eventLike;
        if ('touches' in event && event.touches.length) {
            eventLike = event.touches[0];
        }
        else if ('changedTouches' in event && event.changedTouches.length) {
            eventLike = event.changedTouches[0];
        }
        else {
            eventLike = event;
        }
        var box = getBoundingClientRect(this._target);
        return {
            clientX: eventLike.clientX,
            clientY: eventLike.clientY,
            pageX: eventLike.pageX,
            pageY: eventLike.pageY,
            screenX: eventLike.screenX,
            screenY: eventLike.screenY,
            localX: eventLike.clientX - box.left,
            localY: eventLike.clientY - box.top,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            type: event.type.startsWith('mouse') ? 'mouse' : 'touch',
            target: eventLike.target,
            view: event.view,
        };
    };
    return MouseEventHandler;
}());
export { MouseEventHandler };
function getBoundingClientRect(element) {
    return element.getBoundingClientRect() || { left: 0, top: 0 };
}
function getDistance(p1, p2) {
    var xDiff = p1.clientX - p2.clientX;
    var yDiff = p1.clientY - p2.clientY;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
function isTouchEvent(event) {
    return Boolean(event.touches);
}
function preventDefault(event) {
    if (event.cancelable) {
        event.preventDefault();
    }
}
