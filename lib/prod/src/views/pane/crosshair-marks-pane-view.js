import { ensureNotNull } from '../../helpers/assertions';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererMarks } from '../../renderers/marks-renderer';
function createEmptyMarkerData(chartOptions) {
    return {
        _internal_items: [{
                _internal_x: 0,
                _internal_y: 0,
                _internal_time: 0,
                _internal_price: 0,
            }],
        _internal_lineColor: '',
        _internal_backColor: chartOptions.layout.backgroundColor,
        _internal_radius: 0,
        _internal_visibleRange: null,
    };
}
var rangeForSinglePoint = { from: 0, to: 1 };
var CrosshairMarksPaneView = /** @class */ (function () {
    function CrosshairMarksPaneView(chartModel, crosshair) {
        this._private__compositeRenderer = new CompositeRenderer();
        this._private__markersRenderers = [];
        this._private__markersData = [];
        this._private__invalidated = true;
        this._private__chartModel = chartModel;
        this._private__crosshair = crosshair;
        this._private__compositeRenderer._internal_setRenderers(this._private__markersRenderers);
    }
    CrosshairMarksPaneView.prototype._internal_update = function (updateType) {
        var _this = this;
        var serieses = this._private__chartModel._internal_serieses();
        if (serieses.length !== this._private__markersRenderers.length) {
            this._private__markersData = serieses.map(function () { return createEmptyMarkerData(_this._private__chartModel._internal_options()); });
            this._private__markersRenderers = this._private__markersData.map(function (data) {
                var res = new PaneRendererMarks();
                res._internal_setData(data);
                return res;
            });
            this._private__compositeRenderer._internal_setRenderers(this._private__markersRenderers);
        }
        this._private__invalidated = true;
    };
    CrosshairMarksPaneView.prototype._internal_renderer = function (height, width, addAnchors) {
        if (this._private__invalidated) {
            this._private__updateImpl();
            this._private__invalidated = false;
        }
        return this._private__compositeRenderer;
    };
    CrosshairMarksPaneView.prototype._private__updateImpl = function () {
        var _this = this;
        var serieses = this._private__chartModel._internal_serieses();
        var timePointIndex = this._private__crosshair._internal_appliedIndex();
        var timeScale = this._private__chartModel._internal_timeScale();
        serieses.forEach(function (s, index) {
            var data = _this._private__markersData[index];
            var seriesData = s._internal_markerDataAtIndex(timePointIndex);
            if (seriesData === null) {
                data._internal_visibleRange = null;
                return;
            }
            var firstValue = ensureNotNull(s._internal_firstValue());
            data._internal_lineColor = s._internal_barColorer()._internal_barStyle(timePointIndex)._internal_barColor;
            data._internal_backColor = _this._private__chartModel._internal_options().layout.backgroundColor;
            data._internal_radius = seriesData._internal_radius;
            data._internal_items[0]._internal_price = seriesData._internal_price;
            data._internal_items[0]._internal_y = s._internal_priceScale()._internal_priceToCoordinate(seriesData._internal_price, firstValue._internal_value);
            data._internal_items[0]._internal_time = timePointIndex;
            data._internal_items[0]._internal_x = timeScale._internal_indexToCoordinate(timePointIndex);
            data._internal_visibleRange = rangeForSinglePoint;
        });
    };
    return CrosshairMarksPaneView;
}());
export { CrosshairMarksPaneView };
