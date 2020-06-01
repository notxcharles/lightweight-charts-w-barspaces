export function drawText(ctx, text, x, y) {
    ctx.fillText(text, x, y);
}
export function hitTestText(textX, textY, textWidth, textHeight, x, y) {
    var halfHeight = textHeight / 2;
    return x >= textX && x <= textX + textWidth &&
        y >= textY - halfHeight && y <= textY + halfHeight;
}
