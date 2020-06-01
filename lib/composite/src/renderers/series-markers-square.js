import { shapeSize } from './series-markers-utils';
export function drawSquare(ctx, centerX, centerY, size) {
    var squareSize = shapeSize('square', size);
    var halfSize = (squareSize - 1) / 2;
    var left = centerX - halfSize;
    var top = centerY - halfSize;
    ctx.fillRect(left, top, squareSize, squareSize);
}
export function hitTestSquare(centerX, centerY, size, x, y) {
    var squareSize = shapeSize('square', size);
    var halfSize = (squareSize - 1) / 2;
    var left = centerX - halfSize;
    var top = centerY - halfSize;
    return x >= left && x <= left + squareSize &&
        y >= top && y <= top + squareSize;
}
