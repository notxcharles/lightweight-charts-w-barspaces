import { IFormatter } from '../formatters/iformatter';
import { AutoscaleInfoImpl } from './autoscale-info-impl';
import { ChartModel } from './chart-model';
import { DataSource } from './data-source';
import { FirstValue, IPriceDataSource } from './iprice-data-source';
import { TimePointIndex } from './time-data';
export declare abstract class PriceDataSource extends DataSource implements IPriceDataSource {
    private readonly _model;
    constructor(model: ChartModel);
    model(): ChartModel;
    minMove(): number;
    autoscaleInfo(startTimePoint: TimePointIndex, endTimePoint: TimePointIndex): AutoscaleInfoImpl | null;
    abstract firstValue(): FirstValue | null;
    abstract formatter(): IFormatter;
    abstract priceLineColor(lastBarColor: string): string;
}
