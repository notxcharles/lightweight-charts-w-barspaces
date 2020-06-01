"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var range_impl_1 = require("../../src/model/range-impl");
var time_data_1 = require("../../src/model/time-data");
// TODO: add tests for marks spans
function visibleTimedValuesCase(rangeFrom, rangeTo, extendedRange, expectedFrom, expectedTo, times) {
    var barsRange = new range_impl_1.RangeImpl(rangeFrom, rangeTo);
    var timedData = times.map(function (t) {
        return { time: t, x: 0 };
    });
    var actual = time_data_1.visibleTimedValues(timedData, barsRange, extendedRange);
    var expected = { from: expectedFrom, to: expectedTo };
    chai_1.expect(actual).to.be.deep.equal(expected);
}
mocha_1.describe('TimedData', function () {
    mocha_1.it('visibleTimedValues', function () {
        visibleTimedValuesCase(1, 3, false, 0, 0, []);
        visibleTimedValuesCase(1, 3, false, 0, 1, [1]);
        visibleTimedValuesCase(1, 3, false, 0, 2, [1, 2, 5]);
        visibleTimedValuesCase(1, 3, false, 1, 2, [-1, 2, 5]);
        visibleTimedValuesCase(1, 3, false, 1, 1, [-1, 5]);
        visibleTimedValuesCase(1, 3, false, 0, 0, [4, 5]);
        visibleTimedValuesCase(1, 3, false, 2, 2, [-2, -1]);
    });
    mocha_1.it('visibleTimedValues with exteded range', function () {
        visibleTimedValuesCase(1, 3, true, 0, 0, []);
        visibleTimedValuesCase(1, 3, true, 0, 1, [1]);
        visibleTimedValuesCase(1, 3, true, 0, 3, [1, 2, 5]);
        visibleTimedValuesCase(1, 3, true, 1, 4, [-2, -1, 2, 5, 6]);
    });
});
