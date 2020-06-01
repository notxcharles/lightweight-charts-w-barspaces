import { ensureNever } from '../helpers/assertions';
import { ceiledEven, ceiledOdd } from '../helpers/mathex';
var Constants;
(function (Constants) {
    Constants[Constants["MinShapeSize"] = 12] = "MinShapeSize";
    Constants[Constants["MaxShapeSize"] = 30] = "MaxShapeSize";
    Constants[Constants["MinShapeMargin"] = 3] = "MinShapeMargin";
})(Constants || (Constants = {}));
export function size(barSpacing, coeff) {
    var result = Math.min(Math.max(barSpacing, 12 /* MinShapeSize */), 30 /* MaxShapeSize */) * coeff;
    return ceiledOdd(result);
}
export function shapeSize(shape, originalSize) {
    switch (shape) {
        case 'arrowDown':
        case 'arrowUp':
            return size(originalSize, 1);
        case 'circle':
            return size(originalSize, 0.8);
        case 'square':
            return size(originalSize, 0.7);
    }
    ensureNever(shape);
}
export function calculateShapeHeight(barSpacing) {
    return ceiledEven(size(barSpacing, 1));
}
export function shapeMargin(barSpacing) {
    return Math.max(size(barSpacing, 0.1), 3 /* MinShapeMargin */);
}
