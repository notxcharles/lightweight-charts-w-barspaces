import { __extends } from "tslib";
import { ensureNever } from '../helpers/assertions';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { ScaledRenderer } from './scaled-renderer';
import { drawArrow, hitTestArrow } from './series-markers-arrow';
import { drawCircle, hitTestCircle } from './series-markers-circle';
import { drawSquare, hitTestSquare } from './series-markers-square';
import { drawText, hitTestText } from './series-markers-text';
var SeriesMarkersRenderer = /** @class */ (function (_super) {
    __extends(SeriesMarkersRenderer, _super);
    function SeriesMarkersRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._data = null;
        _this._textWidthCache = new TextWidthCache();
        _this._fontSize = -1;
        _this._fontFamily = '';
        _this._font = '';
        return _this;
    }
    SeriesMarkersRenderer.prototype.setData = function (data) {
        this._data = data;
    };
    SeriesMarkersRenderer.prototype.setParams = function (fontSize, fontFamily) {
        if (this._fontSize !== fontSize || this._fontFamily !== fontFamily) {
            this._fontSize = fontSize;
            this._fontFamily = fontFamily;
            this._font = makeFont(fontSize, fontFamily);
            this._textWidthCache.reset();
        }
    };
    SeriesMarkersRenderer.prototype.hitTest = function (x, y) {
        if (this._data === null || this._data.visibleRange === null) {
            return null;
        }
        for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
            var item = this._data.items[i];
            if (hitTestItem(item, x, y)) {
                return {
                    hitTestData: item.internalId,
                    externalId: item.externalId,
                };
            }
        }
        return null;
    };
    SeriesMarkersRenderer.prototype._drawImpl = function (ctx, isHovered, hitTestData) {
        if (this._data === null || this._data.visibleRange === null) {
            return;
        }
        ctx.textBaseline = 'middle';
        ctx.font = this._font;
        for (var i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
            var item = this._data.items[i];
            if (item.text !== undefined) {
                item.text.width = this._textWidthCache.measureText(ctx, item.text.content);
                item.text.height = this._fontSize;
            }
            drawItem(item, ctx);
        }
    };
    return SeriesMarkersRenderer;
}(ScaledRenderer));
export { SeriesMarkersRenderer };
function drawItem(item, ctx) {
    ctx.fillStyle = item.color;
    if (item.text !== undefined) {
        drawText(ctx, item.text.content, item.x - item.text.width / 2, item.text.y);
    }
    drawShape(item, ctx);
}
function drawShape(item, ctx) {
    if (item.size === 0) {
        return;
    }
    switch (item.shape) {
        case 'arrowDown':
            drawArrow(false, ctx, item.x, item.y, item.size);
            return;
        case 'arrowUp':
            drawArrow(true, ctx, item.x, item.y, item.size);
            return;
        case 'circle':
            drawCircle(ctx, item.x, item.y, item.size);
            return;
        case 'square':
            drawSquare(ctx, item.x, item.y, item.size);
            return;
    }
    ensureNever(item.shape);
}
function hitTestItem(item, x, y) {
    if (item.text !== undefined && hitTestText(item.x, item.text.y, item.text.width, item.text.height, x, y)) {
        return true;
    }
    return hitTestShape(item, x, y);
}
function hitTestShape(item, x, y) {
    if (item.size === 0) {
        return false;
    }
    switch (item.shape) {
        case 'arrowDown':
            return hitTestArrow(true, item.x, item.y, item.size, x, y);
        case 'arrowUp':
            return hitTestArrow(false, item.x, item.y, item.size, x, y);
        case 'circle':
            return hitTestCircle(item.x, item.y, item.size, x, y);
        case 'square':
            return hitTestSquare(item.x, item.y, item.size, x, y);
    }
    ensureNever(item.shape);
}
