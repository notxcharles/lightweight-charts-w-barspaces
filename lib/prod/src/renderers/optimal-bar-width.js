export function optimalBarWidth(barSpacing, pixelRatio) {
    return Math.floor(barSpacing * 0.3 * pixelRatio);
}
export function optimalCandlestickWidth(barSpacing, pixelRatio) {
    var res = Math.floor(barSpacing * 0.8 * pixelRatio);
    var scaledBarSpacing = Math.floor(barSpacing * pixelRatio);
    var optimal = Math.min(res, scaledBarSpacing - 1);
    return Math.max(1, optimal);
}
