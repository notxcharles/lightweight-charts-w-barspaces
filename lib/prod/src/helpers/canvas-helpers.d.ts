/** Draw rectangle with outer border defined with parameters. FillStyle is used as color
 * @param ctx - context to draw on
 * @param x - left outer border of the target rectangle
 * @param y - top outer border of the target rectangle
 * @param w - width of the target rectangle
 * @param h - height of the target rectangle
 * @param lineWidth - line width. Must be less than width and height
 */
export declare function strokeRectInnerWithFill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lineWidth: number): void;
export declare function drawScaled(ctx: CanvasRenderingContext2D, ratio: number, func: () => void): void;
export declare function clearRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, clearColor: string): void;
