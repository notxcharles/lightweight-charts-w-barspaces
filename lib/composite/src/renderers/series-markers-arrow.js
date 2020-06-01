import { ceiledOdd } from '../helpers/mathex';
import { hitTestSquare } from './series-markers-square';
import { shapeSize } from './series-markers-utils';
export function drawArrow(up, ctx, centerX, centerY, size) {
    var arrowSize = shapeSize('arrowUp', size);
    var halfArrowSize = (arrowSize - 1) / 2;
    var baseSize = ceiledOdd(size / 2);
    var halfBaseSize = (baseSize - 1) / 2;
    ctx.beginPath();
    if (up) {
        ctx.moveTo(centerX - halfArrowSize, centerY);
        ctx.lineTo(centerX, centerY - halfArrowSize);
        ctx.lineTo(centerX + halfArrowSize, centerY);
        ctx.lineTo(centerX + halfBaseSize, centerY);
        ctx.lineTo(centerX + halfBaseSize, centerY + halfArrowSize);
        ctx.lineTo(centerX - halfBaseSize, centerY + halfArrowSize);
        ctx.lineTo(centerX - halfBaseSize, centerY);
    }
    else {
        ctx.moveTo(centerX - halfArrowSize, centerY);
        ctx.lineTo(centerX, centerY + halfArrowSize);
        ctx.lineTo(centerX + halfArrowSize, centerY);
        ctx.lineTo(centerX + halfBaseSize, centerY);
        ctx.lineTo(centerX + halfBaseSize, centerY - halfArrowSize);
        ctx.lineTo(centerX - halfBaseSize, centerY - halfArrowSize);
        ctx.lineTo(centerX - halfBaseSize, centerY);
    }
    ctx.fill();
}
export function hitTestArrow(up, centerX, centerY, size, x, y) {
    // TODO: implement arrow hit test
    return hitTestSquare(centerX, centerY, size, x, y);
}
