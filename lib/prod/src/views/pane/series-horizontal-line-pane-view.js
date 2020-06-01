import { HorizontalLineRenderer } from '../../renderers/horizontal-line-renderer';
var SeriesHorizontalLinePaneView = /** @class */ (function () {
    function SeriesHorizontalLinePaneView(series) {
        this._internal__lineRendererData = {
            _internal_width: 0,
            _internal_height: 0,
            _internal_y: 0,
            _internal_color: 'rgba(0, 0, 0, 0)',
            _internal_lineWidth: 1,
            _internal_lineStyle: 0 /* Solid */,
            _internal_visible: false,
        };
        this._internal__lineRenderer = new HorizontalLineRenderer();
        this._private__invalidated = true;
        this._internal__series = series;
        this._internal__model = series._internal_model();
        this._internal__lineRenderer._internal_setData(this._internal__lineRendererData);
    }
    SeriesHorizontalLinePaneView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    SeriesHorizontalLinePaneView.prototype._internal_renderer = function (height, width) {
        if (this._private__invalidated) {
            this._internal__updateImpl(height, width);
            this._private__invalidated = false;
        }
        return this._internal__lineRenderer;
    };
    return SeriesHorizontalLinePaneView;
}());
export { SeriesHorizontalLinePaneView };
