function checkTouchEvents() {
    if ('ontouchstart' in window) {
        return true;
    }
    // tslint:disable-next-line:no-any
    return Boolean(window.DocumentTouch && document instanceof window.DocumentTouch);
}
var touch = !!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || checkTouchEvents();
export var mobileTouch = 'onorientationchange' in window && touch;
// actually we shouldn't check that values
// we even don't need to know what browser/UA/etc is (in almost all cases, except special ones)
// so, in MouseEventHandler/PaneWidget we should check what event happened (touch or mouse)
// not check current UA to detect "mobile" device
var android = /Android/i.test(navigator.userAgent);
var iOS = /iPhone|iPad|iPod|AppleWebKit.+Mobile/i.test(navigator.userAgent);
export var isMobile = android || iOS;
