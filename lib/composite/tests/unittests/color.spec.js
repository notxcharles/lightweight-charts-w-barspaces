"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mocha_1 = require("mocha");
var color_1 = require("../../src/helpers/color");
mocha_1.describe('rgbToBlackWhiteString', function () {
    mocha_1.it('should return \'black\' for black color and every non-zero threshold', function () {
        chai_1.expect(color_1.rgbToBlackWhiteString([0, 0, 0], 0)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0, 0, 0], 1)).to.equal('black');
        chai_1.expect(color_1.rgbToBlackWhiteString([0, 0, 0], 255)).to.equal('black');
    });
    mocha_1.it('should return \'white\' for white color and any threshold', function () {
        chai_1.expect(color_1.rgbToBlackWhiteString([255, 255, 255], 0)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([255, 255, 255], 1)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([255, 255, 255], 255)).to.equal('white');
    });
    mocha_1.it('should respect the threshold value', function () {
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x00)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x11)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x33)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x55)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x77)).to.equal('white');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0x99)).to.equal('white');
        // ------------------------------------------------------------------- //
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0xBB)).to.equal('black');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0xDD)).to.equal('black');
        chai_1.expect(color_1.rgbToBlackWhiteString([0xAA, 0xAA, 0xAA], 0xFF)).to.equal('black');
    });
});
// parsers
mocha_1.describe('parseRgb', function () {
    mocha_1.it('should correctly parse known named colors', function () {
        chai_1.expect(color_1.parseRgb('aliceblue')).to.deep.equal([240, 248, 255]);
        chai_1.expect(color_1.parseRgb('coral')).to.deep.equal([255, 127, 80]);
        chai_1.expect(color_1.parseRgb('darkmagenta')).to.deep.equal([139, 0, 139]);
        chai_1.expect(color_1.parseRgb('linen')).to.deep.equal([250, 240, 230]);
        chai_1.expect(color_1.parseRgb('whitesmoke')).to.deep.equal([245, 245, 245]);
    });
    mocha_1.it('should correctly parse RGB tuple string', function () {
        chai_1.expect(color_1.parseRgb('rgb(10, 20, 30)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgb(0,0,0)')).to.deep.equal([0, 0, 0]);
        chai_1.expect(color_1.parseRgb('rgb(	10	 , 	20 	, 	30  	)')).to.deep.equal([10, 20, 30]);
        // RGB tuple may contain values exceeding 255, that should be clamped to 255 after parsing
        chai_1.expect(color_1.parseRgb('rgb(256, 256, 256)')).to.deep.equal([255, 255, 255]);
        chai_1.expect(color_1.parseRgb('rgb(100500, 100500, 100500)')).to.deep.equal([255, 255, 255]);
        chai_1.expect(color_1.parseRgb('rgb(0, 100500, 0)')).to.deep.equal([0, 255, 0]);
        // RGB tuple may contain negative values, that should be clamped to zero after parsing
        chai_1.expect(color_1.parseRgb('rgb(-10, -20, -30)')).to.deep.equal([0, 0, 0]);
        chai_1.expect(color_1.parseRgb('rgb(10, -20, 30)')).to.deep.equal([10, 0, 30]);
        // whitespace characters before 'rgb', after 'rgb' and after the closing parenthesis are prohibited
        chai_1.expect(color_1.parseRgb.bind(null, '   	rgb(	10, 	20, 	30 		 )')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb	  (	10, 	20, 	30 		 )')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(	10, 	20, 	30 		 ) 	  ')).to.throw();
        // RGB tuple should not contain non-integer values
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(10.0, 20, 30)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(10, 20.0, 30)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(10, 20, 30.0)')).to.throw();
        // not enough values in the tuple
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(10, 20)')).to.throw();
        // too much values in the tuple
        chai_1.expect(color_1.parseRgb.bind(null, 'rgb(10, 20, 30, 40)')).to.throw();
    });
});
mocha_1.describe('parseRgb with rgba', function () {
    mocha_1.it('should correctly parse RGBA tuple string', function () {
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, 0.40)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(0,0,0,1)')).to.deep.equal([0, 0, 0]);
        chai_1.expect(color_1.parseRgb('rgba(	10 	, 	20 	, 	30	, 	0.40   	)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, 0.1)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .1)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .001)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .000000000001)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .10001)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .10005)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, .100000000005)')).to.deep.equal([10, 20, 30]);
        // RGB components of a tuple may contain values exceeding 255, that should be clamped to 255 after parsing
        chai_1.expect(color_1.parseRgb('rgba(256, 256, 256, 1.0)')).to.deep.equal([255, 255, 255]);
        chai_1.expect(color_1.parseRgb('rgba(100500, 100500, 100500, 1.0)')).to.deep.equal([255, 255, 255]);
        chai_1.expect(color_1.parseRgb('rgba(0, 100500, 0, 1.0)')).to.deep.equal([0, 255, 0]);
        // RGB components of a tuple may contain negative values, that should be clamped to zero after parsing
        chai_1.expect(color_1.parseRgb('rgba(-10, -20, -30, 1.0)')).to.deep.equal([0, 0, 0]);
        chai_1.expect(color_1.parseRgb('rgba(10, -20, 30, 1.0)')).to.deep.equal([10, 0, 30]);
        // Alpha component of a tuple may be a value exceeding 1.0, that should be clamped to 1.0 after parsing
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, 1.1)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, 1000.0)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, 1000000)')).to.deep.equal([10, 20, 30]);
        // Alpha component of a tuple may be a negative value, that should be clamped to zero after parsing
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, -0.1)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, -1.1)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, -1000.0)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, -1000000)')).to.deep.equal([10, 20, 30]);
        chai_1.expect(color_1.parseRgb('rgba(10, 20, 30, -1000000.100000000005)')).to.deep.equal([10, 20, 30]);
        // dangling dot is prohibited
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10, 20, 30, 1.)')).to.throw();
        // whitespace characters before 'rgba', after 'rgba' and after the closing parenthesis are prohibited
        chai_1.expect(color_1.parseRgb.bind(null, '   	rgba(	10, 	20, 	30	, 	0.40   	)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba	  (	10, 	20, 	30	, 	0.40   	)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(	10, 	20, 	30	, 	0.40   	) 	  ')).to.throw();
        // RGB components of tuple should not contain non-integer values
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10.0, 20, 30, 0)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10, 20.0, 30, 0)')).to.throw();
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10, 20, 30.0, 0)')).to.throw();
        // not enough values in the tuple
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10, 20, 30)')).to.throw();
        // too much values in the tuple
        chai_1.expect(color_1.parseRgb.bind(null, 'rgba(10, 20, 30, 1.0, 1.0)')).to.throw();
    });
});
mocha_1.describe('resetTransparency', function () {
    mocha_1.it('should work', function () {
        chai_1.expect(color_1.resetTransparency('red')).to.equal('rgba(255, 0, 0, 1)');
        chai_1.expect(color_1.resetTransparency('rgba(255, 0, 0, .1)')).to.equal('rgba(255, 0, 0, 1)');
    });
    mocha_1.it('should keep hex colors as is', function () {
        chai_1.expect(color_1.resetTransparency('#0f0')).to.equal('#0f0');
        chai_1.expect(color_1.resetTransparency('#0000ff')).to.equal('#0000ff');
    });
});
mocha_1.describe('colorWithTransparency', function () {
    mocha_1.it('should work', function () {
        chai_1.expect(color_1.colorWithTransparency('red', 1)).to.equal('rgba(255, 0, 0, 1)');
        chai_1.expect(color_1.colorWithTransparency('red', 0.5)).to.equal('rgba(255, 0, 0, 0.5)');
        chai_1.expect(color_1.colorWithTransparency('red', 0)).to.equal('rgba(255, 0, 0, 0)');
        chai_1.expect(color_1.colorWithTransparency('#0f0', 0.2)).to.equal('rgba(0, 255, 0, 0.2)');
        chai_1.expect(color_1.colorWithTransparency('#00ff00', 0.7)).to.equal('rgba(0, 255, 0, 0.7)');
        // That how we roll!
        chai_1.expect(color_1.colorWithTransparency('rgba(0, 0, 255, .1)', 0.6)).to.equal('rgba(0, 0, 255, 0.6)');
        chai_1.expect(color_1.colorWithTransparency('rgba(-1, -2, 123, 9001)', 0.65)).to.equal('rgba(0, 0, 123, 0.65)');
    });
    mocha_1.it('should normalize alpha channel', function () {
        chai_1.expect(color_1.colorWithTransparency('red', -1)).to.equal('rgba(255, 0, 0, 0)');
        chai_1.expect(color_1.colorWithTransparency('red', 2)).to.equal('rgba(255, 0, 0, 1)');
        chai_1.expect(color_1.colorWithTransparency('red', -0)).to.equal('rgba(255, 0, 0, 0)');
        chai_1.expect(color_1.colorWithTransparency('red', NaN)).to.equal('rgba(255, 0, 0, 0)');
        chai_1.expect(color_1.colorWithTransparency('red', 0.30004)).to.equal('rgba(255, 0, 0, 0.3)');
        chai_1.expect(color_1.colorWithTransparency('red', 0.30006)).to.equal('rgba(255, 0, 0, 0.3001)');
    });
});
