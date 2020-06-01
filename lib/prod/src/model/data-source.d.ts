import { IPaneView } from '../views/pane/ipane-view';
import { IPriceAxisView } from '../views/price-axis/iprice-axis-view';
import { TimeAxisView } from '../views/time-axis/time-axis-view';
import { IDataSource } from './idata-source';
import { Pane } from './pane';
import { PriceScale } from './price-scale';
export declare abstract class DataSource implements IDataSource {
    protected _priceScale: PriceScale | null;
    private _zorder;
    zorder(): number;
    setZorder(zorder: number): void;
    priceScale(): PriceScale | null;
    setPriceScale(priceScale: PriceScale | null): void;
    priceAxisViews(pane?: Pane, priceScale?: PriceScale): ReadonlyArray<IPriceAxisView>;
    paneViews(pane?: Pane): ReadonlyArray<IPaneView>;
    timeAxisViews(): ReadonlyArray<TimeAxisView>;
    abstract updateAllViews(): void;
}
