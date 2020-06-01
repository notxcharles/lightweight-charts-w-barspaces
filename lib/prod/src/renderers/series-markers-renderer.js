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
        _this._private__data = null;
        _this._private__textWidthCache = new TextWidthCache();
        _this._private__fontSize = -1;
        _this._private__fontFamily = '';
        _this._private__font = '';
        return _this;
    }
    SeriesMarkersRenderer.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    SeriesMarkersRenderer.prototype._internal_setParams = function (fontSize, fontFamily) {
        if (this._private__fontSize !== fontSize || this._private__fontFamily !== fontFamily) {
            this._private__fontSize = fontSize;
            this._private__fontFamily = fontFamily;
            this._private__font = makeFont(fontSize, fontFamily);
            this._private__textWidthCache._internal_reset();
        }
    };
    SeriesMarkersRenderer.prototype._internal_hitTest = function (x, y) {
        if (this._private__data === null || this._private__data._internal_visibleRange === null) {
            return null;
        }
        for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
            var item = this._private__data._internal_items[i];
            if (hitTestItem(item, x, y)) {
                return {
                    _internal_hitTestData: item._internal_internalId,
                    _internal_externalId: item._internal_externalId,
                };
            }
        }
        return null;
    };
    SeriesMarkersRenderer.prototype._internal__drawImpl = function (ctx, isHovered, hitTestData) {
        if (this._private__data === null || this._private__data._internal_visibleRange === null) {
            return;
        }
        ctx.textBaseline = 'middle';
        ctx.font = this._private__font;
        for (var i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; i++) {
            var item = this._private__data._internal_items[i];
            if (item._internal_text !== undefined) {
                item._internal_text._internal_width = this._private__textWidthCache._internal_measureText(ctx, item._internal_text._internal_content);
                item._internal_text._internal_height = this._private__fontSize;
            }
            drawItem(item, ctx);
        }
    };
    return SeriesMarkersRenderer;
}(ScaledRenderer));
export { SeriesMarkersRenderer };
function drawItem(item, ctx) {
    ctx.fillStyle = item._internal_color;
    if (item._internal_text !== undefined) {
        drawText(ctx, item._internal_text._internal_content, item._internal_x - item._internal_text._internal_width / 2, item._internal_text._internal_y);
    }
    drawShape(item, ctx);
}
function drawShape(item, ctx) {
    if (item._internal_size === 0) {
        return;
    }
    switch (item._internal_shape) {
        case 'arrowDown':
            drawArrow(false, ctx, item._internal_x, item._internal_y, item._internal_size);
            return;
        case 'arrowUp':
            drawArrow(true, ctx, item._internal_x, item._internal_y, item._internal_size);
            return;
        case 'circle':
            drawCircle(ctx, item._internal_x, item._internal_y, item._internal_size);
            return;
        case 'square':
            drawSquare(ctx, item._internal_x, item._internal_y, item._internal_size);
            return;
    }
    ensureNever(item._internal_shape);
}
function hitTestItem(item, x, y) {
    if (item._internal_text !== undefined && hitTestText(item._internal_x, item._internal_text._internal_y, item._internal_text._internal_width, item._internal_text._internal_height, x, y)) {
        return true;
    }
    return hitTestShape(item, x, y);
}
function hitTestShape(item, x, y) {
    if (item._internal_size === 0) {
        return false;
    }
    switch (item._internal_shape) {
        case 'arrowDown':
            return hitTestArrow(true, item._internal_x, item._internal_y, item._internal_size, x, y);
        case 'arrowUp':
            return hitTestArrow(false, item._internal_x, item._internal_y, item._internal_size, x, y);
        case 'circle':
            return hitTestCircle(item._internal_x, item._internal_y, item._internal_size, x, y);
        case 'square':
            return hitTestSquare(item._internal_x, item._internal_y, item._internal_size, x, y);
    }
    ensureNever(item._internal_shape);
}
