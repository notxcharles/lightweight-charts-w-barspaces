import { Coordinate } from '../model/coordinate';
export declare function drawCircle(ctx: CanvasRenderingContext2D, centerX: Coordinate, centerY: Coordinate, size: number): void;
export declare function hitTestCircle(centerX: Coordinate, centerY: Coordinate, size: number, x: Coordinate, y: Coordinate): boolean;
