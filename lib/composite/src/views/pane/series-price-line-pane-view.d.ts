import { Series } from '../../model/series';
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
export declare class SeriesPriceLinePaneView extends SeriesHorizontalLinePaneView {
    constructor(series: Series);
    protected _updateImpl(height: number, width: number): void;
}
