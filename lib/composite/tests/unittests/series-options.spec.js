"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var series_options_1 = require("../../src/model/series-options");
mocha_1.describe('SeriesOptions', function () {
    mocha_1.it('precisionByMinMove', function () {
        chai_1.expect(series_options_1.precisionByMinMove(0.001)).to.be.equal(3);
        chai_1.expect(series_options_1.precisionByMinMove(0.01)).to.be.equal(2);
        chai_1.expect(series_options_1.precisionByMinMove(0.1)).to.be.equal(1);
        chai_1.expect(series_options_1.precisionByMinMove(1)).to.be.equal(0);
        chai_1.expect(series_options_1.precisionByMinMove(10)).to.be.equal(0);
        chai_1.expect(series_options_1.precisionByMinMove(0.25)).to.be.equal(2);
    });
});
