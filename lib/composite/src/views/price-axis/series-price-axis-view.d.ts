import { ChartModel } from '../../model/chart-model';
import { LastValueDataResultWithData, Series } from '../../model/series';
import { PriceAxisViewRendererCommonData, PriceAxisViewRendererData } from '../../renderers/iprice-axis-view-renderer';
import { PriceAxisView } from './price-axis-view';
export interface SeriesPriceAxisViewData {
    model: ChartModel;
}
export declare class SeriesPriceAxisView extends PriceAxisView {
    private readonly _source;
    private readonly _data;
    constructor(source: Series, data: SeriesPriceAxisViewData);
    protected _getSource(): Series;
    protected _getData(): SeriesPriceAxisViewData;
    protected _updateRendererData(axisRendererData: PriceAxisViewRendererData, paneRendererData: PriceAxisViewRendererData, commonRendererData: PriceAxisViewRendererCommonData): void;
    protected _paneText(lastValue: LastValueDataResultWithData, showSeriesLastValue: boolean, showSymbolLabel: boolean, showPriceAndPercentage: boolean): string;
    protected _axisText(lastValueData: LastValueDataResultWithData, showSeriesLastValue: boolean, showPriceAndPercentage: boolean): string;
}
