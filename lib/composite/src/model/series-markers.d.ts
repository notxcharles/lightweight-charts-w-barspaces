export declare type SeriesMarkerPosition = 'aboveBar' | 'belowBar' | 'inBar';
export declare type SeriesMarkerShape = 'circle' | 'square' | 'arrowUp' | 'arrowDown';
export interface SeriesMarker<TimeType> {
    time: TimeType;
    position: SeriesMarkerPosition;
    shape: SeriesMarkerShape;
    color: string;
    id?: string;
    text?: string;
    size?: number;
}
export interface InternalSeriesMarker<TimeType> extends SeriesMarker<TimeType> {
    internalId: number;
}
