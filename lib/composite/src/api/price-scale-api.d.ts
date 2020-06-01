import { ChartWidget } from '../gui/chart-widget';
import { IDestroyable } from '../helpers/idestroyable';
import { DeepPartial } from '../helpers/strict-type-checks';
import { PriceScaleOptions } from '../model/price-scale';
import { IPriceScaleApi } from './iprice-scale-api';
export declare class PriceScaleApi implements IPriceScaleApi, IDestroyable {
    private _chartWidget;
    private readonly _priceScaleId;
    constructor(chartWidget: ChartWidget, priceScaleId: string);
    destroy(): void;
    id(): string;
    applyOptions(options: DeepPartial<PriceScaleOptions>): void;
    options(): Readonly<PriceScaleOptions>;
    width(): number;
    private _priceScale;
}
