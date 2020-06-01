/**
 * BEWARE: The method must be called after beginPath and before stroke/fill/closePath/etc
 */
export function walkLine(ctx, points, lineType, visibleRange) {
    if (points.length === 0) {
        return;
    }
    var x = points[visibleRange.from].x;
    var y = points[visibleRange.from].y;
    ctx.moveTo(x, y);
    for (var i = visibleRange.from + 1; i < visibleRange.to; ++i) {
        var currItem = points[i];
        //  x---x---x   or   x---x   o   or   start
        if (lineType === 1 /* WithSteps */) {
            var prevY = points[i - 1].y;
            var currX = currItem.x;
            ctx.lineTo(currX, prevY);
        }
        ctx.lineTo(currItem.x, currItem.y);
    }
}
