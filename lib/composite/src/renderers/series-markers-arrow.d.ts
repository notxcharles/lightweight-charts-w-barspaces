import { Coordinate } from '../model/coordinate';
export declare function drawArrow(up: boolean, ctx: CanvasRenderingContext2D, centerX: Coordinate, centerY: Coordinate, size: number): void;
export declare function hitTestArrow(up: boolean, centerX: Coordinate, centerY: Coordinate, size: number, x: Coordinate, y: Coordinate): boolean;
