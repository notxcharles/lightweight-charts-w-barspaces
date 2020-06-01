import { ensureNever } from '../../helpers/assertions';
import { isNumber } from '../../helpers/strict-type-checks';
import { visibleTimedValues } from '../../model/time-data';
import { SeriesMarkersRenderer, } from '../../renderers/series-markers-renderer';
import { calculateShapeHeight, shapeMargin as calculateShapeMargin, } from '../../renderers/series-markers-utils';
var Constants;
(function (Constants) {
    Constants[Constants["TextMargin"] = 0.1] = "TextMargin";
})(Constants || (Constants = {}));
function fillSizeAndY(
// tslint:disable-next-line:max-params
rendererItem, marker, seriesData, offsets, textHeight, shapeMargin, priceScale, timeScale, firstValue) {
    var inBarPrice = isNumber(seriesData) ? seriesData : seriesData.close;
    var highPrice = isNumber(seriesData) ? seriesData : seriesData.high;
    var lowPrice = isNumber(seriesData) ? seriesData : seriesData.low;
    var sizeMultiplier = isNumber(marker.size) ? Math.max(marker.size, 0) : 1;
    var shapeSize = calculateShapeHeight(timeScale.barSpacing()) * sizeMultiplier;
    var halfSize = shapeSize / 2;
    rendererItem.size = shapeSize;
    switch (marker.position) {
        case 'inBar': {
            rendererItem.y = priceScale.priceToCoordinate(inBarPrice, firstValue);
            if (rendererItem.text !== undefined) {
                rendererItem.text.y = rendererItem.y + halfSize + shapeMargin + textHeight * (0.5 + 0.1 /* TextMargin */);
            }
            return;
        }
        case 'aboveBar': {
            rendererItem.y = (priceScale.priceToCoordinate(highPrice, firstValue) - halfSize - offsets.aboveBar);
            if (rendererItem.text !== undefined) {
                rendererItem.text.y = rendererItem.y - halfSize - textHeight * (0.5 + 0.1 /* TextMargin */);
                offsets.aboveBar += textHeight * (1 + 2 * 0.1 /* TextMargin */);
            }
            offsets.aboveBar += shapeSize + shapeMargin;
            return;
        }
        case 'belowBar': {
            rendererItem.y = (priceScale.priceToCoordinate(lowPrice, firstValue) + halfSize + offsets.belowBar);
            if (rendererItem.text !== undefined) {
                rendererItem.text.y = rendererItem.y + halfSize + shapeMargin + textHeight * (0.5 + 0.1 /* TextMargin */);
                offsets.belowBar += textHeight * (1 + 2 * 0.1 /* TextMargin */);
            }
            offsets.belowBar += shapeSize + shapeMargin;
            return;
        }
    }
    ensureNever(marker.position);
}
var SeriesMarkersPaneView = /** @class */ (function () {
    function SeriesMarkersPaneView(series, model) {
        this._invalidated = true;
        this._dataInvalidated = true;
        this._autoScaleMarginsInvalidated = true;
        this._autoScaleMargins = null;
        this._renderer = new SeriesMarkersRenderer();
        this._series = series;
        this._model = model;
        this._data = {
            items: [],
            visibleRange: null,
        };
    }
    SeriesMarkersPaneView.prototype.update = function (updateType) {
        this._invalidated = true;
        this._autoScaleMarginsInvalidated = true;
        if (updateType === 'data') {
            this._dataInvalidated = true;
        }
    };
    SeriesMarkersPaneView.prototype.renderer = function (height, width, addAnchors) {
        if (this._invalidated) {
            this._makeValid();
        }
        var layout = this._model.options().layout;
        this._renderer.setParams(layout.fontSize, layout.fontFamily);
        this._renderer.setData(this._data);
        return this._renderer;
    };
    SeriesMarkersPaneView.prototype.autoScaleMargins = function () {
        if (this._autoScaleMarginsInvalidated) {
            if (this._series.indexedMarkers().length > 0) {
                var barSpacing = this._model.timeScale().barSpacing();
                var shapeMargin = calculateShapeMargin(barSpacing);
                var marginsAboveAndBelow = calculateShapeHeight(barSpacing) * 1.5 + shapeMargin * 2;
                this._autoScaleMargins = {
                    above: marginsAboveAndBelow,
                    below: marginsAboveAndBelow,
                };
            }
            else {
                this._autoScaleMargins = null;
            }
            this._autoScaleMarginsInvalidated = false;
        }
        return this._autoScaleMargins;
    };
    SeriesMarkersPaneView.prototype._makeValid = function () {
        var priceScale = this._series.priceScale();
        var timeScale = this._model.timeScale();
        var seriesMarkers = this._series.indexedMarkers();
        if (this._dataInvalidated) {
            this._data.items = seriesMarkers.map(function (marker) { return ({
                time: marker.time,
                x: 0,
                y: 0,
                size: 0,
                shape: marker.shape,
                color: marker.color,
                internalId: marker.internalId,
                externalId: marker.id,
                text: undefined,
            }); });
            this._dataInvalidated = false;
        }
        var layoutOptions = this._model.options().layout;
        this._data.visibleRange = null;
        var visibleBars = timeScale.visibleStrictRange();
        if (visibleBars === null) {
            return;
        }
        var firstValue = this._series.firstValue();
        if (firstValue === null) {
            return;
        }
        if (this._data.items.length === 0) {
            return;
        }
        var prevTimeIndex = NaN;
        var shapeMargin = calculateShapeMargin(timeScale.barSpacing());
        var offsets = {
            aboveBar: shapeMargin,
            belowBar: shapeMargin,
        };
        this._data.visibleRange = visibleTimedValues(this._data.items, visibleBars, true);
        for (var index = this._data.visibleRange.from; index < this._data.visibleRange.to; index++) {
            var marker = seriesMarkers[index];
            if (marker.time !== prevTimeIndex) {
                // new bar, reset stack counter
                offsets.aboveBar = shapeMargin;
                offsets.belowBar = shapeMargin;
                prevTimeIndex = marker.time;
            }
            var rendererItem = this._data.items[index];
            rendererItem.x = timeScale.indexToCoordinate(marker.time);
            if (marker.text !== undefined && marker.text.length > 0) {
                rendererItem.text = {
                    content: marker.text,
                    y: 0,
                    width: 0,
                    height: 0,
                };
            }
            var dataAt = this._series.dataAt(marker.time);
            if (dataAt === null) {
                continue;
            }
            fillSizeAndY(rendererItem, marker, dataAt, offsets, layoutOptions.fontSize, shapeMargin, priceScale, timeScale, firstValue.value);
        }
        this._invalidated = false;
    };
    return SeriesMarkersPaneView;
}());
export { SeriesMarkersPaneView };
