import { HorizontalLineRenderer } from '../../renderers/horizontal-line-renderer';
var SeriesHorizontalLinePaneView = /** @class */ (function () {
    function SeriesHorizontalLinePaneView(series) {
        this._lineRendererData = {
            width: 0,
            height: 0,
            y: 0,
            color: 'rgba(0, 0, 0, 0)',
            lineWidth: 1,
            lineStyle: 0 /* Solid */,
            visible: false,
        };
        this._lineRenderer = new HorizontalLineRenderer();
        this._invalidated = true;
        this._series = series;
        this._model = series.model();
        this._lineRenderer.setData(this._lineRendererData);
    }
    SeriesHorizontalLinePaneView.prototype.update = function () {
        this._invalidated = true;
    };
    SeriesHorizontalLinePaneView.prototype.renderer = function (height, width) {
        if (this._invalidated) {
            this._updateImpl(height, width);
            this._invalidated = false;
        }
        return this._lineRenderer;
    };
    return SeriesHorizontalLinePaneView;
}());
export { SeriesHorizontalLinePaneView };
