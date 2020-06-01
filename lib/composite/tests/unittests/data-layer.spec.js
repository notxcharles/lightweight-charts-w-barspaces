"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var data_layer_1 = require("../../src/api/data-layer");
var assertions_1 = require("../../src/helpers/assertions");
var palette_1 = require("../../src/model/palette");
var series_data_1 = require("../../src/model/series-data");
// TODO: add tests for marks spans
function createSeriesMock(seriesType) {
    var data = new series_data_1.SeriesData();
    // tslint:disable-next-line:no-object-literal-type-assertion
    return {
        data: function () { return data; },
        palette: function () { return new palette_1.Palette(); },
        seriesType: function () { return seriesType || 'Line'; },
        clearData: function () { return data.clear(); },
    };
}
// just for tests
function dataItemAt(time) {
    return { time: time, value: 0, open: 0, high: 0, low: 0, close: 0 };
}
mocha_1.describe('DataLayer', function () {
    mocha_1.it('should be able to append new series', function () {
        var dataLayer = new data_layer_1.DataLayer();
        // actually we don't need to use Series, so we just use new Object()
        var series1 = createSeriesMock();
        var series2 = createSeriesMock();
        var updateResult1 = dataLayer.setSeriesData(series1, [dataItemAt(1000), dataItemAt(3000)]);
        chai_1.expect(updateResult1.timeScaleUpdate.index).to.be.equal(0);
        chai_1.expect(updateResult1.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 1000 }, { timestamp: 3000 }]);
        chai_1.expect(updateResult1.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult1.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series1);
            chai_1.expect(updatePacket.update.length).to.be.equal(2);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(0);
            chai_1.expect(updatePacket.update[0].time.timestamp).to.be.equal(1000);
            chai_1.expect(updatePacket.update[1].index).to.be.equal(1);
            chai_1.expect(updatePacket.update[1].time.timestamp).to.be.equal(3000);
        });
        chai_1.expect(updateResult1.timeScaleUpdate.marks.length).to.be.equal(2);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].index).to.be.equal(0);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 1000 });
        chai_1.expect(updateResult1.timeScaleUpdate.marks[1].index).to.be.equal(1);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[1].time).to.be.deep.equal({ timestamp: 3000 });
        var updateResult2 = dataLayer.setSeriesData(series2, [dataItemAt(2000), dataItemAt(4000)]);
        chai_1.expect(updateResult2.timeScaleUpdate.index).to.be.equal(0);
        chai_1.expect(updateResult2.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 1000 }, { timestamp: 2000 }, { timestamp: 3000 }, { timestamp: 4000 }]);
        chai_1.expect(updateResult2.timeScaleUpdate.seriesUpdates.size).to.be.equal(2);
        updateResult2.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            if (series === series1) {
                chai_1.expect(updatePacket.update.length).to.be.equal(2);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(0);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 1000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(2);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 3000 });
            }
            else {
                chai_1.expect(updatePacket.update[0].index).to.be.equal(1);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 2000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(3);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 4000 });
            }
        });
        chai_1.expect(updateResult2.timeScaleUpdate.marks.length).to.be.equal(4);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].index).to.be.equal(0);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 1000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[1].index).to.be.equal(1);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[1].time).to.be.deep.equal({ timestamp: 2000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[2].index).to.be.equal(2);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[2].time).to.be.deep.equal({ timestamp: 3000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[3].index).to.be.equal(3);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[3].time).to.be.deep.equal({ timestamp: 4000 });
    });
    mocha_1.it('should be able to remove series', function () {
        var dataLayer = new data_layer_1.DataLayer();
        // actually we don't need to use Series, so we just use new Object()
        var series1 = createSeriesMock();
        var series2 = createSeriesMock();
        var series3 = createSeriesMock();
        dataLayer.setSeriesData(series1, [dataItemAt(2000), dataItemAt(5000)]);
        dataLayer.setSeriesData(series2, [dataItemAt(3000), dataItemAt(7000)]);
        dataLayer.setSeriesData(series3, [dataItemAt(4000), dataItemAt(6000)]);
        var updateResult = dataLayer.removeSeries(series3);
        chai_1.expect(updateResult.timeScaleUpdate.index).to.be.equal(0);
        chai_1.expect(updateResult.timeScaleUpdate.changes.length).to.be.equal(4);
        chai_1.expect(updateResult.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 2000 }, { timestamp: 3000 }, { timestamp: 5000 }, { timestamp: 7000 }]);
        chai_1.expect(updateResult.timeScaleUpdate.seriesUpdates.size).to.be.equal(2);
        updateResult.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            if (series === series1) {
                chai_1.expect(updatePacket.update.length).to.be.equal(2);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(0);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 2000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(2);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 5000 });
            }
            else {
                chai_1.expect(updatePacket.update[0].index).to.be.equal(1);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 3000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(3);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 7000 });
            }
        });
        chai_1.expect(updateResult.timeScaleUpdate.marks.length).to.be.equal(4);
        chai_1.expect(updateResult.timeScaleUpdate.marks[0].index).to.be.equal(0);
        chai_1.expect(updateResult.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 2000 });
        chai_1.expect(updateResult.timeScaleUpdate.marks[1].index).to.be.equal(1);
        chai_1.expect(updateResult.timeScaleUpdate.marks[1].time).to.be.deep.equal({ timestamp: 3000 });
        chai_1.expect(updateResult.timeScaleUpdate.marks[2].index).to.be.equal(2);
        chai_1.expect(updateResult.timeScaleUpdate.marks[2].time).to.be.deep.equal({ timestamp: 5000 });
        chai_1.expect(updateResult.timeScaleUpdate.marks[3].index).to.be.equal(3);
        chai_1.expect(updateResult.timeScaleUpdate.marks[3].time).to.be.deep.equal({ timestamp: 7000 });
    });
    mocha_1.it('should be able to add new point in the end', function () {
        var dataLayer = new data_layer_1.DataLayer();
        // actually we don't need to use Series, so we just use new Object()
        var series1 = createSeriesMock();
        var series2 = createSeriesMock();
        dataLayer.setSeriesData(series1, [dataItemAt(1000), dataItemAt(3000)]);
        dataLayer.setSeriesData(series2, [dataItemAt(2000), dataItemAt(4000)]);
        // add a new point
        var updateResult1 = dataLayer.updateSeriesData(series1, dataItemAt(5000));
        chai_1.expect(updateResult1.timeScaleUpdate.index).to.be.equal(4);
        chai_1.expect(updateResult1.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 5000 }]);
        chai_1.expect(updateResult1.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult1.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series1);
            chai_1.expect(updatePacket.update.length).to.be.equal(1);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(4);
            chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 5000 });
        });
        chai_1.expect(updateResult1.timeScaleUpdate.marks.length).to.be.equal(1);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].index).to.be.equal(4);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 5000 });
        // add one more point
        var updateResult2 = dataLayer.updateSeriesData(series2, dataItemAt(6000));
        chai_1.expect(updateResult2.timeScaleUpdate.index).to.be.equal(5);
        chai_1.expect(updateResult2.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 6000 }]);
        chai_1.expect(updateResult2.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult2.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series2);
            chai_1.expect(updatePacket.update.length).to.be.equal(1);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(5);
            chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 6000 });
        });
        chai_1.expect(updateResult2.timeScaleUpdate.marks.length).to.be.equal(1);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].index).to.be.equal(5);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 6000 });
    });
    mocha_1.it('should be able to change last existing point', function () {
        var dataLayer = new data_layer_1.DataLayer();
        // actually we don't need to use Series, so we just use new Object()
        var series1 = createSeriesMock();
        var series2 = createSeriesMock();
        dataLayer.setSeriesData(series1, [dataItemAt(1000), dataItemAt(4000)]);
        dataLayer.setSeriesData(series2, [dataItemAt(2000), dataItemAt(4000)]);
        // change the last point of the first series
        var updateResult1 = dataLayer.updateSeriesData(series1, dataItemAt(4000));
        chai_1.expect(updateResult1.timeScaleUpdate.index).to.be.equal(2);
        chai_1.expect(updateResult1.timeScaleUpdate.changes.length).to.be.equal(0);
        chai_1.expect(updateResult1.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult1.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series1);
            chai_1.expect(updatePacket.update.length).to.be.equal(1);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(2);
            chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 4000 });
        });
        chai_1.expect(updateResult1.timeScaleUpdate.marks.length).to.be.equal(0);
        // change the last point of the second series
        var updateResult2 = dataLayer.updateSeriesData(series2, dataItemAt(4000));
        chai_1.expect(updateResult2.timeScaleUpdate.index).to.be.equal(2);
        chai_1.expect(updateResult2.timeScaleUpdate.changes.length).to.be.equal(0);
        chai_1.expect(updateResult2.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult2.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series2);
            chai_1.expect(updatePacket.update.length).to.be.equal(1);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(2);
            chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 4000 });
        });
        chai_1.expect(updateResult2.timeScaleUpdate.marks.length).to.be.equal(0);
    });
    mocha_1.it('should be able to add new point in the middle', function () {
        var dataLayer = new data_layer_1.DataLayer();
        // actually we don't need to use Series, so we just use new Object()
        var series1 = createSeriesMock();
        var series2 = createSeriesMock();
        dataLayer.setSeriesData(series1, [dataItemAt(5000), dataItemAt(6000)]);
        dataLayer.setSeriesData(series2, [dataItemAt(2000), dataItemAt(3000)]);
        // add a new point in the end of one series but not in the end of all points
        var updateResult = dataLayer.updateSeriesData(series2, dataItemAt(4000));
        chai_1.expect(updateResult.timeScaleUpdate.index).to.be.equal(2);
        chai_1.expect(updateResult.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 4000 }, { timestamp: 5000 }, { timestamp: 6000 }]);
        chai_1.expect(updateResult.timeScaleUpdate.seriesUpdates.size).to.be.equal(2);
        updateResult.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            if (series === series1) {
                chai_1.expect(updatePacket.update.length).to.be.equal(2);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(3);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 5000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(4);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 6000 });
            }
            else {
                chai_1.expect(updatePacket.update.length).to.be.equal(1);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(2);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 4000 });
            }
        });
        chai_1.expect(updateResult.timeScaleUpdate.marks.length).to.be.equal(3);
        chai_1.expect(updateResult.timeScaleUpdate.marks[0].index).to.be.equal(2);
        chai_1.expect(updateResult.timeScaleUpdate.marks[1].index).to.be.equal(3);
        chai_1.expect(updateResult.timeScaleUpdate.marks[2].index).to.be.equal(4);
        chai_1.expect(updateResult.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 4000 });
        chai_1.expect(updateResult.timeScaleUpdate.marks[1].time).to.be.deep.equal({ timestamp: 5000 });
        chai_1.expect(updateResult.timeScaleUpdate.marks[2].time).to.be.deep.equal({ timestamp: 6000 });
        // add a new point before all points
        var updateResult2 = dataLayer.updateSeriesData(series2, dataItemAt(1000));
        chai_1.expect(updateResult2.timeScaleUpdate.index).to.be.equal(0);
        chai_1.expect(updateResult2.timeScaleUpdate.changes).to.have.deep.members([{ timestamp: 1000 }, { timestamp: 2000 }, { timestamp: 3000 }, { timestamp: 4000 }, { timestamp: 5000 }, { timestamp: 6000 }]);
        chai_1.expect(updateResult2.timeScaleUpdate.seriesUpdates.size).to.be.equal(2);
        updateResult2.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            if (series === series1) {
                chai_1.expect(updatePacket.update.length).to.be.equal(2);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(4);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 5000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(5);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 6000 });
            }
            else {
                chai_1.expect(updatePacket.update.length).to.be.equal(4);
                chai_1.expect(updatePacket.update[0].index).to.be.equal(0);
                chai_1.expect(updatePacket.update[0].time).to.be.deep.equal({ timestamp: 1000 });
                chai_1.expect(updatePacket.update[1].index).to.be.equal(1);
                chai_1.expect(updatePacket.update[1].time).to.be.deep.equal({ timestamp: 2000 });
                chai_1.expect(updatePacket.update[2].index).to.be.equal(2);
                chai_1.expect(updatePacket.update[2].time).to.be.deep.equal({ timestamp: 3000 });
                chai_1.expect(updatePacket.update[3].index).to.be.equal(3);
                chai_1.expect(updatePacket.update[3].time).to.be.deep.equal({ timestamp: 4000 });
            }
        });
        chai_1.expect(updateResult2.timeScaleUpdate.marks.length).to.be.equal(6);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].index).to.be.equal(0);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[1].index).to.be.equal(1);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[2].index).to.be.equal(2);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[3].index).to.be.equal(3);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[4].index).to.be.equal(4);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[5].index).to.be.equal(5);
        chai_1.expect(updateResult2.timeScaleUpdate.marks[0].time).to.be.deep.equal({ timestamp: 1000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[1].time).to.be.deep.equal({ timestamp: 2000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[2].time).to.be.deep.equal({ timestamp: 3000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[3].time).to.be.deep.equal({ timestamp: 4000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[4].time).to.be.deep.equal({ timestamp: 5000 });
        chai_1.expect(updateResult2.timeScaleUpdate.marks[5].time).to.be.deep.equal({ timestamp: 6000 });
    });
    mocha_1.it('allow business days', function () {
        var dataLayer = new data_layer_1.DataLayer();
        var series1 = createSeriesMock();
        var date1 = { day: 1, month: 10, year: 2019 };
        var date2 = { day: 2, month: 10, year: 2019 };
        var updateResult1 = dataLayer.setSeriesData(series1, [dataItemAt(date1), dataItemAt(date2)]);
        chai_1.expect(updateResult1.timeScaleUpdate.index).to.be.equal(0);
        var timePoint1 = {
            businessDay: {
                day: 1,
                month: 10,
                year: 2019,
            },
            timestamp: 1569888000,
        };
        var timePoint2 = {
            businessDay: {
                day: 2,
                month: 10,
                year: 2019,
            },
            timestamp: 1569974400,
        };
        chai_1.expect(updateResult1.timeScaleUpdate.changes).to.have.deep.members([timePoint1, timePoint2]);
        chai_1.expect(updateResult1.timeScaleUpdate.seriesUpdates.size).to.be.equal(1);
        updateResult1.timeScaleUpdate.seriesUpdates.forEach(function (updatePacket, series) {
            chai_1.expect(series).to.be.equal(series);
            chai_1.expect(updatePacket.update.length).to.be.equal(2);
            chai_1.expect(updatePacket.update[0].index).to.be.equal(0);
            chai_1.expect(updatePacket.update[0].time.timestamp).to.be.equal(1569888000);
            chai_1.expect(updatePacket.update[1].index).to.be.equal(1);
            chai_1.expect(updatePacket.update[1].time.timestamp).to.be.equal(1569974400);
        });
        chai_1.expect(updateResult1.timeScaleUpdate.marks.length).to.be.equal(2);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].index).to.be.equal(0);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[0].time).to.be.deep.equal(timePoint1);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[1].index).to.be.equal(1);
        chai_1.expect(updateResult1.timeScaleUpdate.marks[1].time).to.be.deep.equal(timePoint2);
    });
    mocha_1.it('all points should have same time type', function () {
        var dataLayer = new data_layer_1.DataLayer();
        var series = createSeriesMock();
        chai_1.expect(function () { return dataLayer.setSeriesData(series, [dataItemAt(5000), dataItemAt({ day: 1, month: 10, year: 2019 })]); })
            .to.throw();
    });
    mocha_1.it('all points should have same time type on updating', function () {
        var dataLayer = new data_layer_1.DataLayer();
        var series = createSeriesMock();
        var packet = dataLayer.setSeriesData(series, [dataItemAt({ day: 1, month: 10, year: 2019 })]);
        var update = assertions_1.ensureDefined(packet.timeScaleUpdate.seriesUpdates.get(series));
        series.data().bars().merge(update.update);
        chai_1.expect(function () { return dataLayer.updateSeriesData(series, dataItemAt(5000)); })
            .to.throw();
    });
    mocha_1.it('convertTime', function () {
        chai_1.expect(data_layer_1.convertTime(1554792010)).to.be.deep.equal({ timestamp: 1554792010 });
        var bd = { day: 1, month: 10, year: 2018 };
        chai_1.expect(data_layer_1.convertTime(bd)).to.be.deep.equal({ timestamp: 1538352000, businessDay: bd });
    });
    mocha_1.it('stringToBusinessDay', function () {
        chai_1.expect(data_layer_1.stringToBusinessDay('2019-05-01')).to.be.deep.equal({ day: 1, month: 5, year: 2019 });
        chai_1.expect(function () { return data_layer_1.stringToBusinessDay('2019-15-01'); }).to.throw();
    });
    mocha_1.it('stringToBusinessDay', function () {
        chai_1.expect(data_layer_1.stringToBusinessDay('2019-05-01')).to.be.deep.equal({ day: 1, month: 5, year: 2019 });
        chai_1.expect(function () { return data_layer_1.stringToBusinessDay('2019-15-01'); }).to.throw();
    });
    mocha_1.it('should ignore "value" fields on OHLC-based series update', function () {
        var ohlcBasedTypes = ['Bar', 'Candlestick'];
        for (var _i = 0, ohlcBasedTypes_1 = ohlcBasedTypes; _i < ohlcBasedTypes_1.length; _i++) {
            var seriesType = ohlcBasedTypes_1[_i];
            var dataLayer = new data_layer_1.DataLayer();
            var series = createSeriesMock(seriesType);
            var item = {
                time: '2017-01-01',
                open: 10,
                high: 15,
                low: 5,
                close: 11,
                value: 100,
            };
            var packet = dataLayer.setSeriesData(series, [item]);
            var update = assertions_1.ensureDefined(packet.timeScaleUpdate.seriesUpdates.get(series));
            chai_1.expect(update.update[0].value[0 /* Open */]).to.be.equal(item.open);
            chai_1.expect(update.update[0].value[1 /* High */]).to.be.equal(item.high);
            chai_1.expect(update.update[0].value[2 /* Low */]).to.be.equal(item.low);
            chai_1.expect(update.update[0].value[3 /* Close */]).to.be.equal(item.close);
        }
    });
});
