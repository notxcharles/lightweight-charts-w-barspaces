import { lowerbound, upperbound } from '../helpers/algorithms';
function lowerBoundItemsCompare(item, time) {
    return item._internal_time < time;
}
function upperBoundItemsCompare(time, item) {
    return time < item._internal_time;
}
export function visibleTimedValues(items, range, extendedRange) {
    var firstBar = range._internal_left();
    var lastBar = range._internal_right();
    var from = lowerbound(items, firstBar, lowerBoundItemsCompare);
    var to = upperbound(items, lastBar, upperBoundItemsCompare);
    if (!extendedRange) {
        return { from: from, to: to };
    }
    var extendedFrom = from;
    var extendedTo = to;
    if (from > 0 && from < items.length && items[from]._internal_time >= firstBar) {
        extendedFrom = from - 1;
    }
    if (to > 0 && to < items.length && items[to - 1]._internal_time <= lastBar) {
        extendedTo = to + 1;
    }
    return { from: extendedFrom, to: extendedTo };
}
