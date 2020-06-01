import { TextWidthCache } from '../model/text-width-cache';
import { IPriceAxisViewRenderer, PriceAxisViewRendererCommonData, PriceAxisViewRendererData, PriceAxisViewRendererOptions } from './iprice-axis-view-renderer';
export declare class PriceAxisViewRenderer implements IPriceAxisViewRenderer {
    private _data;
    private _commonData;
    constructor(data: PriceAxisViewRendererData, commonData: PriceAxisViewRendererCommonData);
    setData(data: PriceAxisViewRendererData, commonData: PriceAxisViewRendererCommonData): void;
    draw(ctx: CanvasRenderingContext2D, rendererOptions: PriceAxisViewRendererOptions, textWidthCache: TextWidthCache, width: number, align: 'left' | 'right', pixelRatio: number): void;
    height(rendererOptions: PriceAxisViewRendererOptions, useSecondLine: boolean): number;
}
