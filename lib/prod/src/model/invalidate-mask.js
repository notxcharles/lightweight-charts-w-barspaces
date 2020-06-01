;
function mergePaneInvalidation(beforeValue, newValue) {
    if (beforeValue === undefined) {
        return newValue;
    }
    var level = Math.max(beforeValue._internal_level, newValue._internal_level);
    var autoScale = beforeValue._internal_autoScale || newValue._internal_autoScale;
    return { _internal_level: level, _internal_autoScale: autoScale };
}
var InvalidateMask = /** @class */ (function () {
    function InvalidateMask(globalLevel) {
        this._private__invalidatedPanes = new Map();
        this._private__force = false;
        this._private__fitContent = false;
        this._private__logicalRange = null;
        this._private__globalLevel = globalLevel;
    }
    InvalidateMask.prototype._internal_invalidatePane = function (paneIndex, invalidation) {
        var prevValue = this._private__invalidatedPanes.get(paneIndex);
        var newValue = mergePaneInvalidation(prevValue, invalidation);
        this._private__invalidatedPanes.set(paneIndex, newValue);
    };
    InvalidateMask.prototype._internal_invalidateAll = function (level) {
        this._private__globalLevel = Math.max(this._private__globalLevel, level);
    };
    InvalidateMask.prototype._internal_fullInvalidation = function () {
        return this._private__globalLevel;
    };
    InvalidateMask.prototype._internal_invalidateForPane = function (paneIndex) {
        var paneInvalidation = this._private__invalidatedPanes.get(paneIndex);
        if (paneInvalidation === undefined) {
            return {
                _internal_level: this._private__globalLevel,
            };
        }
        return {
            _internal_level: Math.max(this._private__globalLevel, paneInvalidation._internal_level),
            _internal_autoScale: paneInvalidation._internal_autoScale,
        };
    };
    InvalidateMask.prototype._internal_setFitContent = function () {
        this._private__fitContent = true;
        this._private__logicalRange = null;
    };
    InvalidateMask.prototype._internal_getFitContent = function () {
        return this._private__fitContent;
    };
    InvalidateMask.prototype._internal_setLogicalRange = function (range) {
        this._private__logicalRange = range;
        this._private__fitContent = false;
    };
    InvalidateMask.prototype._internal_getLogicalRange = function () {
        return this._private__logicalRange;
    };
    InvalidateMask.prototype._internal_merge = function (other) {
        var _this = this;
        this._private__force = this._private__force || other._private__force;
        if (other._private__fitContent) {
            this._internal_setFitContent();
        }
        if (other._private__logicalRange) {
            this._internal_setLogicalRange(other._private__logicalRange);
        }
        this._private__globalLevel = Math.max(this._private__globalLevel, other._private__globalLevel);
        other._private__invalidatedPanes.forEach(function (invalidation, index) {
            _this._internal_invalidatePane(index, invalidation);
        });
    };
    return InvalidateMask;
}());
export { InvalidateMask };
