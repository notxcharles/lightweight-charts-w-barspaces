import { Coordinate } from '../model/coordinate';
export declare function drawSquare(ctx: CanvasRenderingContext2D, centerX: Coordinate, centerY: Coordinate, size: number): void;
export declare function hitTestSquare(centerX: Coordinate, centerY: Coordinate, size: number, x: Coordinate, y: Coordinate): boolean;
