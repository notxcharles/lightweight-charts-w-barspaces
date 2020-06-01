import { CustomPriceLine } from '../../model/custom-price-line';
import { Series } from '../../model/series';
import { PriceAxisViewRendererCommonData, PriceAxisViewRendererData } from '../../renderers/iprice-axis-view-renderer';
import { PriceAxisView } from './price-axis-view';
export declare class CustomPriceLinePriceAxisView extends PriceAxisView {
    private readonly _series;
    private readonly _priceLine;
    constructor(series: Series, priceLine: CustomPriceLine);
    protected _updateRendererData(axisRendererData: PriceAxisViewRendererData, paneRendererData: PriceAxisViewRendererData, commonData: PriceAxisViewRendererCommonData): void;
}
