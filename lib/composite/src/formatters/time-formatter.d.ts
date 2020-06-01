import { IFormatter } from './iformatter';
export declare class TimeFormatter implements IFormatter {
    private _formatStr;
    constructor(format?: string);
    format(date: Date): string;
}
