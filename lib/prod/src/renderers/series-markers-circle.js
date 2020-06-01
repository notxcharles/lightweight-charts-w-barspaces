import { shapeSize } from './series-markers-utils';
export function drawCircle(ctx, centerX, centerY, size) {
    var circleSize = shapeSize('circle', size);
    var halfSize = (circleSize - 1) / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize, 0, 2 * Math.PI, false);
    ctx.fill();
}
export function hitTestCircle(centerX, centerY, size, x, y) {
    var circleSize = shapeSize('circle', size);
    var tolerance = 2 + circleSize / 2;
    var xOffset = centerX - x;
    var yOffset = centerY - y;
    var dist = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
    return dist <= tolerance;
}
