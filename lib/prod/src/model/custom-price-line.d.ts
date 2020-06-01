import { IPaneView } from '../views/pane/ipane-view';
import { IPriceAxisView } from '../views/price-axis/iprice-axis-view';
import { Coordinate } from './coordinate';
import { PriceLineOptions } from './price-line-options';
import { Series } from './series';
export declare class CustomPriceLine {
    private readonly _series;
    private readonly _priceLineView;
    private readonly _priceAxisView;
    private readonly _options;
    constructor(series: Series, options: PriceLineOptions);
    applyOptions(options: Partial<PriceLineOptions>): void;
    options(): PriceLineOptions;
    paneView(): IPaneView;
    priceAxisView(): IPriceAxisView;
    update(): void;
    yCoord(): Coordinate | null;
}
