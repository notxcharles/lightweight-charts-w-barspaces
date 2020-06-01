"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var make_font_1 = require("../../src/helpers/make-font");
mocha_1.describe('makeFont', function () {
    mocha_1.it('should correct generate font family without style', function () {
        chai_1.expect(make_font_1.makeFont(12, 'Roboto')).to.be.equal('12px Roboto');
        chai_1.expect(make_font_1.makeFont(120, 'Roboto')).to.be.equal('120px Roboto');
    });
    mocha_1.it('should correct generate font family with style', function () {
        chai_1.expect(make_font_1.makeFont(12, 'Roboto', 'italic')).to.be.equal('italic 12px Roboto');
        chai_1.expect(make_font_1.makeFont(120, 'Roboto', 'bold')).to.be.equal('bold 120px Roboto');
    });
    mocha_1.it('should correct generate font with default family', function () {
        chai_1.expect(make_font_1.makeFont(12)).to.be.equal("12px " + make_font_1.defaultFontFamily);
    });
});
