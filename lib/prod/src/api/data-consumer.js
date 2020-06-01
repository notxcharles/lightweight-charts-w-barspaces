import { isNumber, isString } from '../helpers/strict-type-checks';
export function isBusinessDay(time) {
    return !isNumber(time) && !isString(time);
}
export function isUTCTimestamp(time) {
    return isNumber(time);
}
