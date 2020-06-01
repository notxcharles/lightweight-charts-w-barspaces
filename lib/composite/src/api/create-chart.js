import { ensureNotNull } from '../helpers/assertions';
import { isString } from '../helpers/strict-type-checks';
import { ChartApi } from './chart-api';
export { LineStyle, LineType } from '../renderers/draw-line';
export { CrosshairMode } from '../model/crosshair';
export { PriceScaleMode } from '../model/price-scale';
export { PriceLineSource } from '../model/series-options';
export { isBusinessDay, isUTCTimestamp, } from './data-consumer';
/**
 * This function is the main entry point of the Lightweight Charting Library
 * @param container - id of HTML element or element itself
 * @param options - any subset of ChartOptions to be applied at start.
 * @returns an interface to the created chart
 */
export function createChart(container, options) {
    var htmlElement = ensureNotNull(isString(container) ? document.getElementById(container) : container);
    return new ChartApi(htmlElement, options);
}
