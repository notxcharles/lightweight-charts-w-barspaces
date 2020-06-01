"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var assertions_1 = require("../../src/helpers/assertions");
var plot_list_1 = require("../../src/model/plot-list");
function row(i) {
    return { index: i, value: [i * 3, i * 3 + 1, i * 3 + 2], time: 0 };
}
mocha_1.describe('PlotList', function () {
    var p = new plot_list_1.PlotList(new Map());
    beforeEach(function () {
        p.clear();
        p.add(-3, 1, [1, 2, 3]);
        p.add(-3, 2, [1, 2, 3]);
        p.add(0, 3, [10, 20, 30]);
        p.add(3, 4, [100, 200, 300]);
    });
    mocha_1.it('should contain all plot values that was previously added', function () {
        chai_1.expect(p.size()).to.be.equal(3);
        chai_1.expect(p.contains(-3)).to.be.equal(true);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(-3)).value).to.include.ordered.members([1, 2, 3]);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(-3)).time).to.be.equal(2);
        chai_1.expect(p.contains(0)).to.be.equal(true);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(0)).value).to.include.ordered.members([10, 20, 30]);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(0)).time).to.be.equal(3);
        chai_1.expect(p.contains(3)).to.be.equal(true);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(3)).value).to.include.ordered.members([100, 200, 300]);
        chai_1.expect(assertions_1.ensureNotNull(p.valueAt(3)).time).to.be.equal(4);
    });
    mocha_1.it('should not contain any extraneous plot values', function () {
        chai_1.expect(p.contains(1)).to.be.equal(false);
    });
    mocha_1.it('should preserve the order of plot values', function () {
        var items = [];
        p.each(function (index, value) {
            items.push(value);
            return false;
        });
        chai_1.expect(items.length).to.be.equal(3);
        chai_1.expect(items[0].value).to.include.ordered.members([1, 2, 3]);
        chai_1.expect(items[1].value).to.include.ordered.members([10, 20, 30]);
        chai_1.expect(items[2].value).to.include.ordered.members([100, 200, 300]);
    });
    mocha_1.it('should remove all plot values after calling \'clear\'', function () {
        p.clear();
        chai_1.expect(p.isEmpty()).to.be.equal(true);
        chai_1.expect(p.size()).to.be.equal(0);
    });
    mocha_1.describe('merge', function () {
        mocha_1.it('should correctly insert new and update existing plot values', function () {
            var plotList = new plot_list_1.PlotList();
            // first merge
            var earliestRow1 = plotList.merge([
                row(0),
                row(1),
                row(2),
            ]);
            chai_1.expect(earliestRow1).to.deep.include(row(0));
            // second merge
            var earliestRow2 = plotList.merge([
                row(2),
            ]);
            chai_1.expect(earliestRow2).to.deep.include(row(2));
            // third merge
            var earliestRow3 = plotList.merge([
                row(-5),
                row(0),
                row(25),
            ]);
            chai_1.expect(earliestRow3).to.deep.include(row(-5));
            // final result
            var items = [];
            plotList.each(function (index, value) {
                items.push(value);
                return false;
            });
            chai_1.expect(items.length).to.be.equal(5);
            chai_1.expect(items[0].value).to.include.ordered.members([-15, -14, -13]);
            chai_1.expect(items[1].value).to.include.ordered.members([0, 1, 2]);
            chai_1.expect(items[2].value).to.include.ordered.members([3, 4, 5]);
            chai_1.expect(items[3].value).to.include.ordered.members([6, 7, 8]);
            chai_1.expect(items[4].value).to.include.ordered.members([75, 76, 77]);
        });
        mocha_1.it('should correctly prepend new plot values', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(0),
                row(1),
                row(2),
            ]);
            var earliestRow2 = plotList.merge([
                row(-2),
                row(-1),
            ]);
            chai_1.expect(earliestRow2).to.deep.include(row(-2));
            chai_1.expect(plotList.size()).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(-2)).value).to.include.ordered.members(row(-2).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(-1)).value).to.include.ordered.members(row(-1).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(0)).value).to.include.ordered.members(row(0).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(1)).value).to.include.ordered.members(row(1).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(2)).value).to.include.ordered.members(row(2).value);
        });
        mocha_1.it('should correctly append new plot values', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(0),
                row(1),
                row(2),
            ]);
            var earliestRow2 = plotList.merge([
                row(3),
                row(4),
            ]);
            chai_1.expect(earliestRow2).to.deep.include(row(3));
            chai_1.expect(plotList.size()).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(0)).value).to.include.ordered.members(row(0).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(1)).value).to.include.ordered.members(row(1).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(2)).value).to.include.ordered.members(row(2).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(3)).value).to.include.ordered.members(row(3).value);
            chai_1.expect(assertions_1.ensureNotNull(plotList.valueAt(4)).value).to.include.ordered.members(row(4).value);
        });
    });
    mocha_1.describe('remove', function () {
        var p1 = new plot_list_1.PlotList();
        beforeEach(function () {
            p1.clear();
            p1.add(-9, 1, [1, 2, 3]);
            p1.add(-5, 2, [4, 5, 6]);
            p1.add(0, 3, [10, 20, 30]);
            p1.add(5, 4, [40, 50, 60]);
            p1.add(9, 5, [100, 200, 300]);
        });
        mocha_1.it('should remove all the plot rows starting from the specified index, if the index is inside the PlotList\'s range', function () {
            // first remove
            var earliestRow1 = p1.remove(9);
            chai_1.expect(earliestRow1).to.deep.include({ index: 9, value: [100, 200, 300] });
            chai_1.expect(p1.size()).to.be.equal(4);
            chai_1.expect(p1.first()).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.firstIndex()).to.be.equal(-9);
            chai_1.expect(p1.last()).to.deep.include({ index: 5, value: [40, 50, 60] });
            chai_1.expect(p1.lastIndex()).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(-9)).value).to.include.ordered.members([1, 2, 3]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(-5)).value).to.include.ordered.members([4, 5, 6]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(0)).value).to.include.ordered.members([10, 20, 30]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(5)).value).to.include.ordered.members([40, 50, 60]);
            chai_1.expect(p1.valueAt(9)).to.be.equal(null);
            // second remove
            var earliestRow2 = p1.remove(-5);
            chai_1.expect(earliestRow2).to.deep.include({ index: -5, value: [4, 5, 6] });
            chai_1.expect(p1.size()).to.be.equal(1);
            chai_1.expect(p1.first()).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.firstIndex()).to.be.equal(-9);
            chai_1.expect(p1.last()).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.lastIndex()).to.be.equal(-9);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(-9)).value).to.include.ordered.members([1, 2, 3]);
            chai_1.expect(p1.valueAt(-5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(0)).to.be.equal(null);
            chai_1.expect(p1.valueAt(5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(9)).to.be.equal(null);
            // third remove
            var earliestRow3 = p1.remove(-9);
            chai_1.expect(earliestRow3).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.size()).to.be.equal(0);
            chai_1.expect(p1.first()).to.be.equal(null);
            chai_1.expect(p1.firstIndex()).to.be.equal(null);
            chai_1.expect(p1.last()).to.be.equal(null);
            chai_1.expect(p1.lastIndex()).to.be.equal(null);
            chai_1.expect(p1.valueAt(-9)).to.be.equal(null);
            chai_1.expect(p1.valueAt(-5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(0)).to.be.equal(null);
            chai_1.expect(p1.valueAt(5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(9)).to.be.equal(null);
        });
        mocha_1.it('should be no-op if the specified index is greater than last index in PlotList', function () {
            var earliestRow = p1.remove(11);
            chai_1.expect(earliestRow).to.be.equal(null);
            chai_1.expect(p1.size()).to.be.equal(5);
            chai_1.expect(p1.first()).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.firstIndex()).to.be.equal(-9);
            chai_1.expect(p1.last()).to.deep.include({ index: 9, value: [100, 200, 300] });
            chai_1.expect(p1.lastIndex()).to.be.equal(9);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(-9)).value).to.include.ordered.members([1, 2, 3]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(-5)).value).to.include.ordered.members([4, 5, 6]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(0)).value).to.include.ordered.members([10, 20, 30]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(5)).value).to.include.ordered.members([40, 50, 60]);
            chai_1.expect(assertions_1.ensureNotNull(p1.valueAt(9)).value).to.include.ordered.members([100, 200, 300]);
        });
        mocha_1.it('should remove all the plot rows if the specified index is less than first index in PlotList', function () {
            var earliestRow = p1.remove(-11);
            chai_1.expect(earliestRow).to.deep.include({ index: -9, value: [1, 2, 3] });
            chai_1.expect(p1.size()).to.be.equal(0);
            chai_1.expect(p1.first()).to.be.equal(null);
            chai_1.expect(p1.firstIndex()).to.be.equal(null);
            chai_1.expect(p1.last()).to.be.equal(null);
            chai_1.expect(p1.lastIndex()).to.be.equal(null);
            chai_1.expect(p1.valueAt(-9)).to.be.equal(null);
            chai_1.expect(p1.valueAt(-5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(0)).to.be.equal(null);
            chai_1.expect(p1.valueAt(5)).to.be.equal(null);
            chai_1.expect(p1.valueAt(9)).to.be.equal(null);
        });
    });
    mocha_1.describe('search', function () {
        var p1 = new plot_list_1.PlotList();
        beforeEach(function () {
            p1.clear();
            p1.add(-5, 1, [1, 2, 3]);
            p1.add(0, 2, [10, 20, 30]);
            p1.add(5, 3, [100, 200, 300]);
        });
        mocha_1.it('should find respective values by given index and search strategy', function () {
            chai_1.expect(p1.search(-10, -1 /* NearestLeft */)).to.be.equal(null);
            chai_1.expect(p1.search(-5, -1 /* NearestLeft */)).to.deep.include({ index: -5, value: [1, 2, 3] });
            chai_1.expect(p1.search(3, -1 /* NearestLeft */)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(1, -1 /* NearestLeft */)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(-6, 0 /* Exact */)).to.be.equal(null);
            chai_1.expect(p1.search(-5)).to.deep.include({ index: -5, value: [1, 2, 3] });
            chai_1.expect(p1.search(0)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(5)).to.deep.include({ index: 5, value: [100, 200, 300] });
            chai_1.expect(p1.search(6)).to.be.equal(null);
            chai_1.expect(p1.search(-3, 1 /* NearestRight */)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(3, 1 /* NearestRight */)).to.deep.include({ index: 5, value: [100, 200, 300] });
            chai_1.expect(p1.search(5, 1 /* NearestRight */)).to.deep.include({ index: 5, value: [100, 200, 300] });
            chai_1.expect(p1.search(6, 1 /* NearestRight */)).to.be.equal(null);
        });
    });
    mocha_1.describe('search with skipping empty values', function () {
        var p1 = new plot_list_1.PlotList(null, function (value) {
            return value[1] === undefined;
        });
        beforeEach(function () {
            p1.clear();
            p1.add(-5, 1, [1, undefined, 3]);
            p1.add(0, 2, [10, 20, 30]);
            p1.add(5, 3, [100, undefined, 300]);
        });
        mocha_1.it('should not check for empty values if search strategy is "exact"', function () {
            chai_1.expect(p1.search(-10, 0 /* Exact */, true)).to.be.equal(null);
            chai_1.expect(p1.search(-5, 0 /* Exact */, true)).to.deep.include({ index: -5, value: [1, undefined, 3] });
            chai_1.expect(p1.search(0, 0 /* Exact */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(5, 0 /* Exact */, true)).to.deep.include({ index: 5, value: [100, undefined, 300] });
            chai_1.expect(p1.search(10, 0 /* Exact */, true)).to.be.equal(null);
        });
        mocha_1.it('should check for empty values if search strategy is "nearest left"', function () {
            chai_1.expect(p1.search(-10, -1 /* NearestLeft */, true)).to.be.equal(null);
            chai_1.expect(p1.search(-5, -1 /* NearestLeft */, true)).to.be.equal(null);
            chai_1.expect(p1.search(-3, -1 /* NearestLeft */, true)).to.be.equal(null);
            chai_1.expect(p1.search(0, -1 /* NearestLeft */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(3, -1 /* NearestLeft */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(5, -1 /* NearestLeft */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(8, -1 /* NearestLeft */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(10, -1 /* NearestLeft */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
        });
        mocha_1.it('should check for empty values if search strategy is "nearest right"', function () {
            chai_1.expect(p1.search(-10, 1 /* NearestRight */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(-5, 1 /* NearestRight */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(-3, 1 /* NearestRight */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(0, 1 /* NearestRight */, true)).to.deep.include({ index: 0, value: [10, 20, 30] });
            chai_1.expect(p1.search(3, 1 /* NearestRight */, true)).to.be.equal(null);
            chai_1.expect(p1.search(5, 1 /* NearestRight */, true)).to.be.equal(null);
            chai_1.expect(p1.search(8, 1 /* NearestRight */, true)).to.be.equal(null);
            chai_1.expect(p1.search(10, 1 /* NearestRight */, true)).to.be.equal(null);
        });
    });
    mocha_1.describe('minMaxOnRangeCached', function () {
        var pl = new plot_list_1.PlotList(new Map([
            ['plot0', function (plotRow) { return plotRow[0]; }],
            ['plot1', function (plotRow) { return plotRow[1]; }],
            ['plot2', function (plotRow) { return plotRow[2]; }],
            ['plot3', function (plotRow) { return plotRow[3]; }],
            ['plot4', function (plotRow) { return plotRow[4]; }],
        ]));
        beforeEach(function () {
            pl.clear();
            pl.add(0, 1, [null, undefined, NaN, 1, NaN]);
            pl.add(1, 2, [null, undefined, NaN, 2, null]);
            pl.add(2, 3, [null, undefined, NaN, 3, undefined]);
            pl.add(3, 4, [null, undefined, NaN, 4, 123]);
            pl.add(4, 5, [null, undefined, NaN, 5, 1]);
        });
        mocha_1.it('should return null if there is only null, undefined or NaN values', function () {
            var plots = [
                {
                    name: 'plot0',
                    offset: 0,
                },
                {
                    name: 'plot1',
                    offset: 0,
                },
                {
                    name: 'plot2',
                    offset: 0,
                },
            ];
            var minMax = pl.minMaxOnRangeCached(0, 4, plots);
            chai_1.expect(minMax).to.be.equal(null);
        });
        mocha_1.it('should find minMax in numbers', function () {
            var plots = [
                {
                    name: 'plot3',
                    offset: 0,
                },
            ];
            var minMax = pl.minMaxOnRangeCached(0, 4, plots);
            chai_1.expect(minMax).not.to.be.equal(null);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(1);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(5);
        });
        mocha_1.it('should find minMax with non subsequent indices', function () {
            pl.clear();
            pl.add(0, 1, [null, undefined, NaN, 1, NaN]);
            pl.add(2, 2, [null, undefined, NaN, 2, null]);
            pl.add(4, 3, [null, undefined, NaN, 3, undefined]);
            pl.add(6, 4, [null, undefined, NaN, 4, 123]);
            pl.add(20, 5, [null, undefined, NaN, 10, 123]);
            pl.add(100, 6, [null, undefined, NaN, 5, 1]);
            var plots = [
                {
                    name: 'plot3',
                    offset: 0,
                },
            ];
            var minMax = pl.minMaxOnRangeCached(0, 100, plots);
            chai_1.expect(minMax).not.to.be.equal(null);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(1);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(10);
        });
        mocha_1.it('should skip null, undefined and NaN values', function () {
            var plots = [
                {
                    name: 'plot4',
                    offset: 0,
                },
            ];
            var minMax = pl.minMaxOnRangeCached(0, 4, plots);
            chai_1.expect(minMax).not.to.be.equal(null);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(1);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(123);
        });
        mocha_1.it('should return correct values if the data has gaps and we start search with second-to-last chunk', function () {
            pl.clear();
            pl.add(29, 1, [1, 1, 1, 1, 0]);
            pl.add(31, 2, [2, 2, 2, 2, 0]);
            pl.add(55, 3, [3, 3, 3, 3, 0]);
            pl.add(65, 4, [4, 4, 4, 4, 0]);
            var plots = [
                {
                    name: 'plot1',
                    offset: 0,
                },
            ];
            var minMax = pl.minMaxOnRangeCached(30, 200, plots);
            chai_1.expect(minMax).not.to.be.equal(null);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(2);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(4);
            var minMax2 = pl.minMaxOnRangeCached(30, 60, plots);
            chai_1.expect(minMax2).not.to.be.equal(null);
            chai_1.expect(assertions_1.ensureNotNull(minMax2).min).to.be.equal(2);
            chai_1.expect(assertions_1.ensureNotNull(minMax2).max).to.be.equal(3);
        });
    });
    mocha_1.describe('minMaxOnRangeByPlotFunction and minMaxOnRangeByPlotFunctionCached', function () {
        var pl = new plot_list_1.PlotList(new Map([
            ['open', function (plotListRow) { return plotListRow[0]; }],
            ['high', function (plotListRow) { return plotListRow[1]; }],
            ['low', function (plotListRow) { return plotListRow[2]; }],
            ['close', function (plotListRow) { return plotListRow[3]; }],
            ['hl2', function (plotListRow) { return (assertions_1.ensure(plotListRow[1]) + assertions_1.ensure(plotListRow[2])) / 2; }],
            ['ohlc4', function (plotListRow) { return (assertions_1.ensure(plotListRow[0]) + assertions_1.ensure(plotListRow[1]) + assertions_1.ensure(plotListRow[2]) + assertions_1.ensure(plotListRow[3])) / 4; }],
        ]));
        beforeEach(function () {
            pl.clear();
            pl.add(0, 1, [5, 7, 3, 6]);
            pl.add(1, 2, [10, 12, 8, 11]);
            pl.add(2, 3, [15, 17, 13, 16]);
            pl.add(3, 4, [20, 22, 18, 21]);
            pl.add(4, 5, [25, 27, 23, 26]);
        });
        mocha_1.it('should return correct min max for open', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'open', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(25);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'open', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(25);
        });
        mocha_1.it('should return correct min max for high', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'high', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(7);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(27);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'high', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(7);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(27);
        });
        mocha_1.it('should return correct min max for low', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'low', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(3);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(23);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'low', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(3);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(23);
        });
        mocha_1.it('should return correct min max for close', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'close', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(6);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(26);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'close', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(6);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(26);
        });
        mocha_1.it('should return correct min max for hl/2', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'hl2', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(25);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'hl2', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(5);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(25);
        });
        mocha_1.it('should return correct min max for ohlc/4', function () {
            var minMax = pl.minMaxOnRangeCached(0, 4, [{ name: 'ohlc4', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMax).min).to.be.equal(5.25);
            chai_1.expect(assertions_1.ensureNotNull(minMax).max).to.be.equal(25.25);
            var minMaxNonCached = pl.minMaxOnRangeCached(0, 4, [{ name: 'ohlc4', offset: 0 }]);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).min).to.be.equal(5.25);
            chai_1.expect(assertions_1.ensureNotNull(minMaxNonCached).max).to.be.equal(25.25);
        });
        mocha_1.it('should throw specific error if there is no registered function', function () {
            chai_1.expect(pl.minMaxOnRangeCached.bind(pl, 0, 4, [{ name: 'no_such_function', offset: 0 }]))
                .to.throw('Plot "no_such_function" is not registered');
            chai_1.expect(pl.minMaxOnRangeCached.bind(pl, 0, 4, [{ name: 'no_such_function', offset: 0 }]))
                .to.throw('Plot "no_such_function" is not registered');
        });
    });
    mocha_1.describe('range', function () {
        mocha_1.it('should return correct range for existent data', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(0),
                row(1),
                row(2),
            ]);
            var range1 = plotList.range(0, 0);
            chai_1.expect(range1.size()).to.be.equal(1);
            var range2 = plotList.range(0, 1);
            chai_1.expect(range2.size()).to.be.equal(2);
            var range3 = plotList.range(2, 2);
            chai_1.expect(range3.size()).to.be.equal(1);
        });
        mocha_1.it('should correct start index to the first existent time point', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(-1),
                row(0),
                row(1),
            ]);
            var range = plotList.range(-10, 0);
            chai_1.expect(range.size()).to.be.equal(2);
            chai_1.expect(range.firstIndex()).to.be.equal(-1);
            chai_1.expect(range.lastIndex()).to.be.equal(0);
        });
        mocha_1.it('should correct end index to the last existent time point', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(-1),
                row(0),
                row(1),
            ]);
            var range = plotList.range(0, 10);
            chai_1.expect(range.size()).to.be.equal(2);
            chai_1.expect(range.firstIndex()).to.be.equal(0);
            chai_1.expect(range.lastIndex()).to.be.equal(1);
        });
        mocha_1.it('should correct start and end indexes to the first/last existent time point', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(-1),
                row(0),
                row(1),
            ]);
            var range = plotList.range(-10, 10);
            chai_1.expect(range.size()).to.be.equal(3);
            chai_1.expect(range.firstIndex()).to.be.equal(-1);
            chai_1.expect(range.lastIndex()).to.be.equal(1);
        });
        mocha_1.it('should return empty plot list if there is no data in the range', function () {
            var plotList = new plot_list_1.PlotList();
            plotList.merge([
                row(-1),
                row(0),
                row(1),
                row(5),
                row(6),
                row(7),
            ]);
            function checkIsEmpty(pl) {
                chai_1.expect(pl.size()).to.be.equal(0);
                chai_1.expect(pl.isEmpty()).to.be.equal(true);
                chai_1.expect(pl.firstIndex()).to.be.equal(null);
                chai_1.expect(pl.lastIndex()).to.be.equal(null);
            }
            checkIsEmpty(plotList.range(-10, -5));
            checkIsEmpty(plotList.range(10, 15));
            checkIsEmpty(plotList.range(2, 4));
        });
    });
});
mocha_1.describe('mergePlotRows', function () {
    function plotRow(index, data) {
        return { index: index, value: [data], time: 0 };
    }
    mocha_1.describe('(correctness)', function () {
        mocha_1.it('should merge disjoint arrays', function () {
            var firstArray = [plotRow(1), plotRow(3), plotRow(5)];
            var secondArray = [plotRow(2), plotRow(4)];
            var merged = plot_list_1.mergePlotRows(firstArray, secondArray);
            chai_1.expect(merged).to.eql([plotRow(1), plotRow(2), plotRow(3), plotRow(4), plotRow(5)]);
        });
        mocha_1.it('should merge arrays with one overlapped item', function () {
            var firstArray = [plotRow(3), plotRow(4), plotRow(5)];
            var secondArray = [plotRow(1), plotRow(2), plotRow(3)];
            var merged = plot_list_1.mergePlotRows(firstArray, secondArray);
            chai_1.expect(merged).to.eql([plotRow(1), plotRow(2), plotRow(3), plotRow(4), plotRow(5)]);
        });
        mocha_1.it('should merge array with sub-array', function () {
            var array = [plotRow(1), plotRow(2), plotRow(3), plotRow(4), plotRow(5)];
            var merged = plot_list_1.mergePlotRows(array, array.slice(1, 3));
            chai_1.expect(merged).to.eql(array, 'Merged array must be equals superset\'s array');
        });
        mocha_1.it('should merge fully overlapped arrays', function () {
            var array = [plotRow(1), plotRow(2), plotRow(3), plotRow(4), plotRow(5)];
            var merged = plot_list_1.mergePlotRows(array, array);
            chai_1.expect(merged).to.eql(array, 'Merged array must be equals to one of overlapped array');
        });
        mocha_1.it('should merge arrays with primitive types regardless of arrays\' order in args', function () {
            var firstArray = [plotRow(0), plotRow(2), plotRow(4), plotRow(6)];
            var secondArray = [plotRow(1), plotRow(3), plotRow(5)];
            var firstSecondMerged = plot_list_1.mergePlotRows(firstArray, secondArray);
            var secondFirstMerged = plot_list_1.mergePlotRows(secondArray, firstArray);
            chai_1.expect(firstSecondMerged).to.eql(secondFirstMerged);
        });
        mocha_1.it('should merge arrays with non-primitive types dependent of order in args', function () {
            var firstArray = [
                plotRow(0, 1000),
                plotRow(1, 2000),
                plotRow(2, 3000),
            ];
            var secondArray = [
                plotRow(1, 4000),
                plotRow(2, 5000),
                plotRow(3, 6000),
            ];
            var firstSecondMerged = plot_list_1.mergePlotRows(firstArray, secondArray);
            var secondFirstMerged = plot_list_1.mergePlotRows(secondArray, firstArray);
            chai_1.expect(firstSecondMerged).not.to.be.equal(secondFirstMerged);
            chai_1.expect(firstSecondMerged.length).to.be.equal(4);
            chai_1.expect(firstSecondMerged).to.include.ordered.members(tslib_1.__spreadArrays([firstArray[0]], secondArray));
            chai_1.expect(secondFirstMerged.length).to.be.equal(4);
            chai_1.expect(secondFirstMerged).to.include.ordered.members(tslib_1.__spreadArrays(firstArray, [secondArray[2]]));
        });
    });
    xdescribe('(perf)', function () {
        function isSorted(array) {
            for (var i = 1; i < array.length; ++i) {
                if (array[i - 1].index > array[i].index) {
                    return false;
                }
            }
            return true;
        }
        function generateSortedPlotRows(size) {
            var startIndex = (Math.random() * 1000) | 0;
            // tslint:disable-next-line:prefer-array-literal
            var array = new Array(size);
            for (var i = 0; i < size; ++i) {
                array[i] = plotRow(startIndex + i);
            }
            return array;
        }
        function measure(func) {
            var startTime = Date.now();
            var res = func();
            return [Date.now() - startTime, res];
        }
        mocha_1.it('should have linear complexity', function () {
            var first1MArray = generateSortedPlotRows(1000000);
            var second1MArray = generateSortedPlotRows(1000000);
            var total2MTime = measure(function () { return plot_list_1.mergePlotRows(first1MArray, second1MArray); })[0];
            var first3MArray = generateSortedPlotRows(3000000);
            var second3MArray = generateSortedPlotRows(3000000);
            var _a = measure(function () { return plot_list_1.mergePlotRows(first3MArray, second3MArray); }), total6MTime = _a[0], merged6MArray = _a[1];
            // we need to check that execution time for `N + M = 2 Millions` is more than
            // execution time for `N + M = 6 Millions` divided by 3 (and minus some delay to decrease false positive)
            // and if it is so - we have get linear complexity (approx.)
            chai_1.expect(total2MTime).to.be.greaterThan((total6MTime / 3) - total2MTime * 0.3);
            chai_1.expect(isSorted(merged6MArray)).to.be.true('Merged array must be sorted');
        });
    });
});
