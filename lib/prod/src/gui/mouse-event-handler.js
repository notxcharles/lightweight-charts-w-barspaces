import { ensure } from '../helpers/assertions';
import { mobileTouch } from './support-touch';
;
// TODO: get rid of a lot of boolean flags, probably we should replace it with some enum
var MouseEventHandler = /** @class */ (function () {
    function MouseEventHandler(target, handler, options) {
        this._private__clickCount = 0;
        this._private__clickTimeoutId = null;
        this._private__longTapTimeoutId = null;
        this._private__longTapActive = false;
        this._private__mouseMoveStartPosition = null;
        this._private__moveExceededManhattanDistance = false;
        this._private__cancelClick = false;
        this._private__unsubscribeOutsideEvents = null;
        this._private__unsubscribeMousemove = null;
        this._private__unsubscribeRoot = null;
        this._private__startPinchMiddlePoint = null;
        this._private__startPinchDistance = 0;
        this._private__pinchPrevented = false;
        this._private__preventDragProcess = false;
        this._private__mousePressed = false;
        this._private__target = target;
        this._private__handler = handler;
        this._private__options = options;
        this._private__init();
    }
    MouseEventHandler.prototype._internal_destroy = function () {
        if (this._private__unsubscribeOutsideEvents !== null) {
            this._private__unsubscribeOutsideEvents();
            this._private__unsubscribeOutsideEvents = null;
        }
        if (this._private__unsubscribeMousemove !== null) {
            this._private__unsubscribeMousemove();
            this._private__unsubscribeMousemove = null;
        }
        if (this._private__unsubscribeRoot !== null) {
            this._private__unsubscribeRoot();
            this._private__unsubscribeRoot = null;
        }
        this._private__clearLongTapTimeout();
        this._private__resetClickTimeout();
    };
    MouseEventHandler.prototype._private__mouseEnterHandler = function (enterEvent) {
        var _this = this;
        if (this._private__unsubscribeMousemove) {
            this._private__unsubscribeMousemove();
        }
        {
            var boundMouseMoveHandler_1 = this._private__mouseMoveHandler.bind(this);
            this._private__unsubscribeMousemove = function () {
                _this._private__target.removeEventListener('mousemove', boundMouseMoveHandler_1);
            };
            this._private__target.addEventListener('mousemove', boundMouseMoveHandler_1);
        }
        if (isTouchEvent(enterEvent)) {
            this._private__mouseMoveHandler(enterEvent);
        }
        var compatEvent = this._private__makeCompatEvent(enterEvent);
        this._private__processEvent(compatEvent, this._private__handler._internal_mouseEnterEvent);
    };
    MouseEventHandler.prototype._private__resetClickTimeout = function () {
        if (this._private__clickTimeoutId !== null) {
            clearTimeout(this._private__clickTimeoutId);
        }
        this._private__clickCount = 0;
        this._private__clickTimeoutId = null;
    };
    MouseEventHandler.prototype._private__mouseMoveHandler = function (moveEvent) {
        if (this._private__mousePressed && !isTouchEvent(moveEvent)) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(moveEvent);
        this._private__processEvent(compatEvent, this._private__handler._internal_mouseMoveEvent);
    };
    // tslint:disable-next-line:cyclomatic-complexity
    MouseEventHandler.prototype._private__mouseMoveWithDownHandler = function (moveEvent) {
        if ('button' in moveEvent && moveEvent.button !== 0 /* Left */) {
            return;
        }
        if (this._private__startPinchMiddlePoint !== null) {
            return;
        }
        var isTouch = isTouchEvent(moveEvent);
        if (this._private__preventDragProcess && isTouch) {
            return;
        }
        // prevent pinch if move event comes faster than the second touch
        this._private__pinchPrevented = true;
        var compatEvent = this._private__makeCompatEvent(moveEvent);
        var startMouseMovePos = ensure(this._private__mouseMoveStartPosition);
        var xOffset = Math.abs(startMouseMovePos._internal_x - compatEvent._internal_pageX);
        var yOffset = Math.abs(startMouseMovePos._internal_y - compatEvent._internal_pageY);
        var moveExceededManhattanDistance = xOffset + yOffset > 5;
        if (!moveExceededManhattanDistance && isTouch) {
            return;
        }
        if (moveExceededManhattanDistance && !this._private__moveExceededManhattanDistance && isTouch) {
            // vertical drag is more important than horizontal drag
            // because we scroll the page vertically often than horizontally
            var correctedXOffset = xOffset * 0.5;
            // a drag can be only if touch page scroll isn't allowed
            var isVertDrag = yOffset >= correctedXOffset && !this._private__options._internal_treatVertTouchDragAsPageScroll;
            var isHorzDrag = correctedXOffset > yOffset && !this._private__options._internal_treatHorzTouchDragAsPageScroll;
            // if drag event happened then we should revert preventDefault state to original one
            // and try to process the drag event
            // else we shouldn't prevent default of the event and ignore processing the drag event
            if (!isVertDrag && !isHorzDrag) {
                this._private__preventDragProcess = true;
            }
        }
        if (moveExceededManhattanDistance) {
            this._private__moveExceededManhattanDistance = true;
            // if manhattan distance is more that 5 - we should cancel click event
            this._private__cancelClick = true;
            if (isTouch) {
                this._private__clearLongTapTimeout();
            }
        }
        if (!this._private__preventDragProcess) {
            this._private__processEvent(compatEvent, this._private__handler._internal_pressedMouseMoveEvent);
            // we should prevent default in case of touch only
            // to prevent scroll of the page
            if (isTouch) {
                preventDefault(moveEvent);
            }
        }
    };
    MouseEventHandler.prototype._private__mouseUpHandler = function (mouseUpEvent) {
        if ('button' in mouseUpEvent && mouseUpEvent.button !== 0 /* Left */) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(mouseUpEvent);
        this._private__clearLongTapTimeout();
        this._private__mouseMoveStartPosition = null;
        this._private__mousePressed = false;
        if (this._private__unsubscribeRoot) {
            this._private__unsubscribeRoot();
            this._private__unsubscribeRoot = null;
        }
        if (isTouchEvent(mouseUpEvent)) {
            this._private__mouseLeaveHandler(mouseUpEvent);
        }
        this._private__processEvent(compatEvent, this._private__handler._internal_mouseUpEvent);
        ++this._private__clickCount;
        if (this._private__clickTimeoutId && this._private__clickCount > 1) {
            this._private__processEvent(compatEvent, this._private__handler._internal_mouseDoubleClickEvent);
            this._private__resetClickTimeout();
        }
        else {
            if (!this._private__cancelClick) {
                this._private__processEvent(compatEvent, this._private__handler._internal_mouseClickEvent);
            }
        }
        // prevent safari's dblclick-to-zoom
        // we handle mouseDoubleClickEvent here ourself
        if (isTouchEvent(mouseUpEvent)) {
            preventDefault(mouseUpEvent);
            this._private__mouseLeaveHandler(mouseUpEvent);
            if (mouseUpEvent.touches.length === 0) {
                this._private__longTapActive = false;
            }
        }
    };
    MouseEventHandler.prototype._private__clearLongTapTimeout = function () {
        if (this._private__longTapTimeoutId === null) {
            return;
        }
        clearTimeout(this._private__longTapTimeoutId);
        this._private__longTapTimeoutId = null;
    };
    MouseEventHandler.prototype._private__mouseDownHandler = function (downEvent) {
        if ('button' in downEvent && downEvent.button !== 0 /* Left */) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(downEvent);
        this._private__cancelClick = false;
        this._private__moveExceededManhattanDistance = false;
        this._private__preventDragProcess = false;
        if (isTouchEvent(downEvent)) {
            this._private__mouseEnterHandler(downEvent);
        }
        this._private__mouseMoveStartPosition = {
            _internal_x: compatEvent._internal_pageX,
            _internal_y: compatEvent._internal_pageY,
        };
        if (this._private__unsubscribeRoot) {
            this._private__unsubscribeRoot();
            this._private__unsubscribeRoot = null;
        }
        {
            var boundMouseMoveWithDownHandler_1 = this._private__mouseMoveWithDownHandler.bind(this);
            var boundMouseUpHandler_1 = this._private__mouseUpHandler.bind(this);
            var rootElement_1 = this._private__target.ownerDocument.documentElement;
            this._private__unsubscribeRoot = function () {
                rootElement_1.removeEventListener('touchmove', boundMouseMoveWithDownHandler_1);
                rootElement_1.removeEventListener('touchend', boundMouseUpHandler_1);
                rootElement_1.removeEventListener('mousemove', boundMouseMoveWithDownHandler_1);
                rootElement_1.removeEventListener('mouseup', boundMouseUpHandler_1);
            };
            rootElement_1.addEventListener('touchmove', boundMouseMoveWithDownHandler_1, { passive: false });
            rootElement_1.addEventListener('touchend', boundMouseUpHandler_1, { passive: false });
            this._private__clearLongTapTimeout();
            if (isTouchEvent(downEvent) && downEvent.touches.length === 1) {
                this._private__longTapTimeoutId = setTimeout(this._private__longTapHandler.bind(this, downEvent), 240 /* LongTap */);
            }
            else {
                rootElement_1.addEventListener('mousemove', boundMouseMoveWithDownHandler_1);
                rootElement_1.addEventListener('mouseup', boundMouseUpHandler_1);
            }
        }
        this._private__mousePressed = true;
        this._private__processEvent(compatEvent, this._private__handler._internal_mouseDownEvent);
        if (!this._private__clickTimeoutId) {
            this._private__clickCount = 0;
            this._private__clickTimeoutId = setTimeout(this._private__resetClickTimeout.bind(this), 500 /* ResetClick */);
        }
    };
    MouseEventHandler.prototype._private__init = function () {
        var _this = this;
        this._private__target.addEventListener('mouseenter', this._private__mouseEnterHandler.bind(this));
        this._private__target.addEventListener('touchcancel', this._private__clearLongTapTimeout.bind(this));
        {
            var doc_1 = this._private__target.ownerDocument;
            var outsideHandler_1 = function (event) {
                if (!_this._private__handler._internal_mouseDownOutsideEvent) {
                    return;
                }
                if (event.target && _this._private__target.contains(event.target)) {
                    return;
                }
                _this._private__handler._internal_mouseDownOutsideEvent();
            };
            this._private__unsubscribeOutsideEvents = function () {
                doc_1.removeEventListener('mousedown', outsideHandler_1);
                doc_1.removeEventListener('touchstart', outsideHandler_1);
            };
            doc_1.addEventListener('mousedown', outsideHandler_1);
            doc_1.addEventListener('touchstart', outsideHandler_1, { passive: true });
        }
        this._private__target.addEventListener('mouseleave', this._private__mouseLeaveHandler.bind(this));
        this._private__target.addEventListener('touchstart', this._private__mouseDownHandler.bind(this), { passive: true });
        if (!mobileTouch) {
            this._private__target.addEventListener('mousedown', this._private__mouseDownHandler.bind(this));
        }
        this._private__initPinch();
        // Hey mobile Safari, what's up?
        // If mobile Safari doesn't have any touchmove handler with passive=false
        // it treats a touchstart and the following touchmove events as cancelable=false,
        // so we can't prevent them (as soon we subscribe on touchmove inside handler of touchstart).
        // And we'll get scroll of the page along with chart's one instead of only chart's scroll.
        this._private__target.addEventListener('touchmove', function () { }, { passive: false });
    };
    MouseEventHandler.prototype._private__initPinch = function () {
        var _this = this;
        if (this._private__handler._internal_pinchStartEvent === undefined &&
            this._private__handler._internal_pinchEvent === undefined &&
            this._private__handler._internal_pinchEndEvent === undefined) {
            return;
        }
        this._private__target.addEventListener('touchstart', function (event) { return _this._private__checkPinchState(event.touches); }, { passive: true });
        this._private__target.addEventListener('touchmove', function (event) {
            if (event.touches.length !== 2 || _this._private__startPinchMiddlePoint === null) {
                return;
            }
            if (_this._private__handler._internal_pinchEvent !== undefined) {
                var currentDistance = getDistance(event.touches[0], event.touches[1]);
                var scale = currentDistance / _this._private__startPinchDistance;
                _this._private__handler._internal_pinchEvent(_this._private__startPinchMiddlePoint, scale);
                preventDefault(event);
            }
        }, { passive: false });
        this._private__target.addEventListener('touchend', function (event) {
            _this._private__checkPinchState(event.touches);
        });
    };
    MouseEventHandler.prototype._private__checkPinchState = function (touches) {
        if (touches.length === 1) {
            this._private__pinchPrevented = false;
        }
        if (touches.length !== 2 || this._private__pinchPrevented || this._private__longTapActive) {
            this._private__stopPinch();
        }
        else {
            this._private__startPinch(touches);
        }
    };
    MouseEventHandler.prototype._private__startPinch = function (touches) {
        var box = getBoundingClientRect(this._private__target);
        this._private__startPinchMiddlePoint = {
            _internal_x: ((touches[0].clientX - box.left) + (touches[1].clientX - box.left)) / 2,
            _internal_y: ((touches[0].clientY - box.top) + (touches[1].clientY - box.top)) / 2,
        };
        this._private__startPinchDistance = getDistance(touches[0], touches[1]);
        if (this._private__handler._internal_pinchStartEvent !== undefined) {
            this._private__handler._internal_pinchStartEvent();
        }
        this._private__clearLongTapTimeout();
    };
    MouseEventHandler.prototype._private__stopPinch = function () {
        if (this._private__startPinchMiddlePoint === null) {
            return;
        }
        this._private__startPinchMiddlePoint = null;
        if (this._private__handler._internal_pinchEndEvent !== undefined) {
            this._private__handler._internal_pinchEndEvent();
        }
    };
    MouseEventHandler.prototype._private__mouseLeaveHandler = function (event) {
        if (this._private__unsubscribeMousemove) {
            this._private__unsubscribeMousemove();
        }
        var compatEvent = this._private__makeCompatEvent(event);
        this._private__processEvent(compatEvent, this._private__handler._internal_mouseLeaveEvent);
    };
    MouseEventHandler.prototype._private__longTapHandler = function (event) {
        var compatEvent = this._private__makeCompatEvent(event);
        this._private__processEvent(compatEvent, this._private__handler._internal_longTapEvent);
        this._private__cancelClick = true;
        // long tap is active untill touchend event with 0 touches occured
        this._private__longTapActive = true;
    };
    MouseEventHandler.prototype._private__processEvent = function (event, callback) {
        if (!callback) {
            return;
        }
        callback.call(this._private__handler, event);
    };
    MouseEventHandler.prototype._private__makeCompatEvent = function (event) {
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
        var box = getBoundingClientRect(this._private__target);
        return {
            _internal_clientX: eventLike.clientX,
            _internal_clientY: eventLike.clientY,
            _internal_pageX: eventLike.pageX,
            _internal_pageY: eventLike.pageY,
            _internal_screenX: eventLike.screenX,
            _internal_screenY: eventLike.screenY,
            _internal_localX: eventLike.clientX - box.left,
            _internal_localY: eventLike.clientY - box.top,
            _internal_ctrlKey: event.ctrlKey,
            _internal_altKey: event.altKey,
            _internal_shiftKey: event.shiftKey,
            _internal_metaKey: event.metaKey,
            _internal_type: event.type.startsWith('mouse') ? 'mouse' : 'touch',
            _internal_target: eventLike.target,
            _internal_view: event.view,
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
