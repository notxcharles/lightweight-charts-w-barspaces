import { CandlestickSeriesPartialOptions } from '../model/series-options';
import { SeriesApi } from './series-api';
export declare class CandlestickSeriesApi extends SeriesApi<'Candlestick'> {
    applyOptions(options: CandlestickSeriesPartialOptions): void;
}
