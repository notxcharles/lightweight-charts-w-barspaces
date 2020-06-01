import { IFormatter } from './iformatter';
export declare class DateFormatter implements IFormatter {
    private readonly _locale;
    private readonly _dateFormat;
    constructor(dateFormat?: string, locale?: string);
    format(date: Date): string;
}
