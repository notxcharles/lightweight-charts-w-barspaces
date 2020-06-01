import { IPaneRenderer } from './ipane-renderer';
export declare class CompositeRenderer implements IPaneRenderer {
    private _renderers;
    setRenderers(renderers: ReadonlyArray<IPaneRenderer>): void;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
