import { IFormatter } from './iformatter';
export interface DateTimeFormatterParams {
    dateFormat: string;
    timeFormat: string;
    dateTimeSeparator: string;
    locale: string;
}
export declare class DateTimeFormatter implements IFormatter {
    private readonly _dateFormatter;
    private readonly _timeFormatter;
    private readonly _separator;
    constructor(params?: Partial<DateTimeFormatterParams>);
    format(dateTime: Date): string;
}
