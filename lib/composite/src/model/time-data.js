import { lowerbound, upperbound } from '../helpers/algorithms';
function lowerBoundItemsCompare(item, time) {
    return item.time < time;
}
function upperBoundItemsCompare(time, item) {
    return time < item.time;
}
export function visibleTimedValues(items, range, extendedRange) {
    var firstBar = range.left();
    var lastBar = range.right();
    var from = lowerbound(items, firstBar, lowerBoundItemsCompare);
    var to = upperbound(items, lastBar, upperBoundItemsCompare);
    if (!extendedRange) {
        return { from: from, to: to };
    }
    var extendedFrom = from;
    var extendedTo = to;
    if (from > 0 && from < items.length && items[from].time >= firstBar) {
        extendedFrom = from - 1;
    }
    if (to > 0 && to < items.length && items[to - 1].time <= lastBar) {
        extendedTo = to + 1;
    }
    return { from: extendedFrom, to: extendedTo };
}
