/**
 * BEWARE: The method must be called after beginPath and before stroke/fill/closePath/etc
 */
export function walkLine(ctx, points, lineType, visibleRange) {
    if (points.length === 0) {
        return;
    }
    var x = points[visibleRange.from]._internal_x;
    var y = points[visibleRange.from]._internal_y;
    ctx.moveTo(x, y);
    for (var i = visibleRange.from + 1; i < visibleRange.to; ++i) {
        var currItem = points[i];
        //  x---x---x   or   x---x   o   or   start
        if (lineType === 1 /* WithSteps */) {
            var prevY = points[i - 1]._internal_y;
            var currX = currItem._internal_x;
            ctx.lineTo(currX, prevY);
        }
        ctx.lineTo(currItem._internal_x, currItem._internal_y);
    }
}
