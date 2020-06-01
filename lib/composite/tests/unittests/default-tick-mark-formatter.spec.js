"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var default_tick_mark_formatter_1 = require("../../src/model/default-tick-mark-formatter");
function time(dateTimeStr) {
    return {
        timestamp: new Date(dateTimeStr).getTime() / 1000,
    };
}
mocha_1.describe('defaultTickMarkFormatter', function () {
    mocha_1.it('correct format year', function () {
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01'), 0 /* Year */, 'en')).to.be.equal('2019');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2020-01-01'), 0 /* Year */, 'en')).to.be.equal('2020');
    });
    mocha_1.it('correct format month', function () {
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01'), 1 /* Month */, 'en')).to.be.equal('Jan');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-12-01'), 1 /* Month */, 'en')).to.be.equal('Dec');
        // doesn't work in CI :(
        // expect(defaultTickMarkFormatter(time('2019-01-01'), TickMarkType.Month, 'ru')).to.be.equal('янв.');
    });
    mocha_1.it('correct format day of month', function () {
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01'), 2 /* DayOfMonth */, 'en')).to.be.equal('1');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-31'), 2 /* DayOfMonth */, 'en')).to.be.equal('31');
    });
    mocha_1.it('correct format time without seconds', function () {
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01T01:10:00.000Z'), 3 /* Time */, 'en')).to.be.equal('01:10');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01T17:59:00.000Z'), 3 /* Time */, 'en')).to.be.equal('17:59');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01T18:59:59.000Z'), 3 /* Time */, 'en')).to.be.equal('18:59');
    });
    mocha_1.it('correct format time with seconds', function () {
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01T01:10:10.000Z'), 4 /* TimeWithSeconds */, 'en')).to.be.equal('01:10:10');
        chai_1.expect(default_tick_mark_formatter_1.defaultTickMarkFormatter(time('2019-01-01T17:59:44.000Z'), 4 /* TimeWithSeconds */, 'en')).to.be.equal('17:59:44');
    });
});
