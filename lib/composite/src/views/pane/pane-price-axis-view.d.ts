import { ChartModel } from '../../model/chart-model';
import { IPriceDataSource } from '../../model/iprice-data-source';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IPriceAxisView } from '../price-axis/iprice-axis-view';
import { IPaneView } from './ipane-view';
export declare class PanePriceAxisView implements IPaneView {
    private _priceAxisView;
    private readonly _textWidthCache;
    private readonly _dataSource;
    private readonly _chartModel;
    private readonly _renderer;
    private _fontSize;
    constructor(priceAxisView: IPriceAxisView, dataSource: IPriceDataSource, chartModel: ChartModel);
    update(): void;
    renderer(height: number, width: number): IPaneRenderer | null;
}
