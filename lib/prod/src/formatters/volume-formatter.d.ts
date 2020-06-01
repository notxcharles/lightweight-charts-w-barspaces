import { IFormatter } from './iformatter';
export declare class VolumeFormatter implements IFormatter {
    private readonly _precision;
    constructor(precision: number);
    format(vol: number): string;
    private _formatNumber;
}
