"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var format_date_1 = require("../../src/formatters/format-date");
mocha_1.describe('formatDate', function () {
    var date = new Date('1990-04-24');
    var locale = 'en-US';
    mocha_1.it('should correct handle yyyy sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'yyyy', locale)).to.be.equal('1990');
        chai_1.expect(format_date_1.formatDate(date, 'yyyy yyyy', locale)).to.be.equal('1990 1990');
    });
    mocha_1.it('should correct handle yy sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'yy', locale)).to.be.equal('90');
        chai_1.expect(format_date_1.formatDate(date, 'yy yy', locale)).to.be.equal('90 90');
    });
    mocha_1.it('should correct handle yyyy and yy sequences', function () {
        chai_1.expect(format_date_1.formatDate(date, 'yyyy yy', locale)).to.be.equal('1990 90');
        chai_1.expect(format_date_1.formatDate(date, 'yy yyyy', locale)).to.be.equal('90 1990');
        chai_1.expect(format_date_1.formatDate(date, 'yy yyyy yy yyyy yyyy yy', locale)).to.be.equal('90 1990 90 1990 1990 90');
    });
    mocha_1.it('should correct handle MMMM sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'MMMM', locale)).to.be.equal('April');
        chai_1.expect(format_date_1.formatDate(date, 'MMMM MMMM', locale)).to.be.equal('April April');
    });
    mocha_1.it('should correct handle MMM sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'MMM', locale)).to.be.equal('Apr');
        chai_1.expect(format_date_1.formatDate(date, 'MMM MMM', locale)).to.be.equal('Apr Apr');
    });
    mocha_1.it('should correct handle MM sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'MM', locale)).to.be.equal('04');
        chai_1.expect(format_date_1.formatDate(date, 'MM MM', locale)).to.be.equal('04 04');
    });
    mocha_1.it('should correct handle MMMM, MMM and MM sequences', function () {
        chai_1.expect(format_date_1.formatDate(date, 'MMMM MMM MM', locale)).to.be.equal('April Apr 04');
        chai_1.expect(format_date_1.formatDate(date, 'MMMM MMM MM MM MMM MMMM', locale)).to.be.equal('April Apr 04 04 Apr April');
    });
    mocha_1.it('should correct handle dd sequence', function () {
        chai_1.expect(format_date_1.formatDate(date, 'dd', locale)).to.be.equal('24');
        chai_1.expect(format_date_1.formatDate(date, 'dd dd', locale)).to.be.equal('24 24');
    });
    mocha_1.it('should ignore non-sequences', function () {
        chai_1.expect(format_date_1.formatDate(date, 'My custom format for date is yyyy-yy-MMMM-MM-MMM dd!', locale)).to.be.equal('My custom format for date is 1990-90-April-04-Apr 24!');
    });
});
