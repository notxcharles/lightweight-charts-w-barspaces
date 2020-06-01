import { ChartModel } from '../model/chart-model';
import { PriceAxisViewRendererOptions } from './iprice-axis-view-renderer';
export declare class PriceAxisRendererOptionsProvider {
    private readonly _chartModel;
    private readonly _rendererOptions;
    constructor(chartModel: ChartModel);
    options(): Readonly<PriceAxisViewRendererOptions>;
    private _textColor;
    private _fontSize;
    private _fontFamily;
}
