import { Binding as CanvasCoordinateSpaceBinding } from 'fancy-canvas/coordinate-space';
export declare class Size {
    h: number;
    w: number;
    constructor(w: number, h: number);
    equals(size: Size): boolean;
}
export declare function getCanvasDevicePixelRatio(canvas: HTMLCanvasElement): number;
export declare function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D;
export declare function createPreconfiguredCanvas(doc: Document, size: Size): HTMLCanvasElement;
export declare function createBoundCanvas(parentElement: HTMLElement, size: Size): CanvasCoordinateSpaceBinding;
export declare function drawScaled(ctx: CanvasRenderingContext2D, ratio: number, func: () => void): void;
