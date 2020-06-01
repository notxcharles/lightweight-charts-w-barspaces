import { TimeAxisViewRenderer } from '../../renderers/time-axis-view-renderer';
export declare abstract class TimeAxisView {
    protected _text: string;
    protected _background: string;
    protected _coordinate: number;
    text(): string;
    background(): string;
    color(): string;
    coordinate(): number;
    abstract renderer(): TimeAxisViewRenderer;
}
