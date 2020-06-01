import { CustomPriceLine } from '../../model/custom-price-line';
import { Series } from '../../model/series';
import { SeriesHorizontalLinePaneView } from './series-horizontal-line-pane-view';
export declare class CustomPriceLinePaneView extends SeriesHorizontalLinePaneView {
    private readonly _priceLine;
    constructor(series: Series, priceLine: CustomPriceLine);
    protected _updateImpl(height: number, width: number): void;
}
