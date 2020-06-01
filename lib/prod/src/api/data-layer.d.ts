import { PlotRow } from '../model/plot-data';
import { Series } from '../model/series';
import { Bar } from '../model/series-data';
import { SeriesType } from '../model/series-options';
import { BusinessDay, TimePoint, TimePointIndex } from '../model/time-data';
import { SeriesDataItemTypeMap, Time } from './data-consumer';
export interface TickMarkPacket {
    span: number;
    time: TimePoint;
    index: TimePointIndex;
}
export interface SeriesUpdatePacket {
    update: PlotRow<Bar['time'], Bar['value']>[];
}
export interface TimeScaleUpdatePacket {
    seriesUpdates: Map<Series, SeriesUpdatePacket>;
    changes: TimePoint[];
    index: TimePointIndex;
    marks: TickMarkPacket[];
}
export interface UpdatePacket {
    timeScaleUpdate: TimeScaleUpdatePacket;
}
export declare type DataItemType = SeriesDataItemTypeMap[SeriesType];
export declare type TimedData = Pick<DataItemType, 'time'>;
export declare function convertTime(time: Time): TimePoint;
export declare function stringToBusinessDay(value: string): BusinessDay;
export declare class DataLayer {
    private _pointDataByTimePoint;
    private _timePointsByIndex;
    private _sortedTimePoints;
    destroy(): void;
    setSeriesData<TSeriesType extends SeriesType>(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType][]): UpdatePacket;
    removeSeries(series: Series): UpdatePacket;
    updateSeriesData<TSeriesType extends SeriesType>(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType]): UpdatePacket;
    private _setNewPoints;
    private _incrementIndicesFrom;
    private _rebuildTimePointsByIndex;
    private _generateMarksSinceIndex;
}
