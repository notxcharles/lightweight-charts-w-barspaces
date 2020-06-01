import { IDestroyable } from '../helpers/idestroyable';
export declare class LabelsImageCache implements IDestroyable {
    private _textWidthCache;
    private _fontSize;
    private _color;
    private _font;
    private _keys;
    private _hash;
    constructor(fontSize: number, color: string, fontFamily?: string, fontStyle?: string);
    destroy(): void;
    paintTo(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align: string): void;
    private _getLabelImage;
}
