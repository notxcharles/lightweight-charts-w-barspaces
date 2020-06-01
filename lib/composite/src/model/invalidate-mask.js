export var InvalidationLevel;
(function (InvalidationLevel) {
    InvalidationLevel[InvalidationLevel["None"] = 0] = "None";
    InvalidationLevel[InvalidationLevel["Cursor"] = 1] = "Cursor";
    InvalidationLevel[InvalidationLevel["Light"] = 2] = "Light";
    InvalidationLevel[InvalidationLevel["Full"] = 3] = "Full";
})(InvalidationLevel || (InvalidationLevel = {}));
function mergePaneInvalidation(beforeValue, newValue) {
    if (beforeValue === undefined) {
        return newValue;
    }
    var level = Math.max(beforeValue.level, newValue.level);
    var autoScale = beforeValue.autoScale || newValue.autoScale;
    return { level: level, autoScale: autoScale };
}
var InvalidateMask = /** @class */ (function () {
    function InvalidateMask(globalLevel) {
        this._invalidatedPanes = new Map();
        this._force = false;
        this._fitContent = false;
        this._logicalRange = null;
        this._globalLevel = globalLevel;
    }
    InvalidateMask.prototype.invalidatePane = function (paneIndex, invalidation) {
        var prevValue = this._invalidatedPanes.get(paneIndex);
        var newValue = mergePaneInvalidation(prevValue, invalidation);
        this._invalidatedPanes.set(paneIndex, newValue);
    };
    InvalidateMask.prototype.invalidateAll = function (level) {
        this._globalLevel = Math.max(this._globalLevel, level);
    };
    InvalidateMask.prototype.fullInvalidation = function () {
        return this._globalLevel;
    };
    InvalidateMask.prototype.invalidateForPane = function (paneIndex) {
        var paneInvalidation = this._invalidatedPanes.get(paneIndex);
        if (paneInvalidation === undefined) {
            return {
                level: this._globalLevel,
            };
        }
        return {
            level: Math.max(this._globalLevel, paneInvalidation.level),
            autoScale: paneInvalidation.autoScale,
        };
    };
    InvalidateMask.prototype.setFitContent = function () {
        this._fitContent = true;
        this._logicalRange = null;
    };
    InvalidateMask.prototype.getFitContent = function () {
        return this._fitContent;
    };
    InvalidateMask.prototype.setLogicalRange = function (range) {
        this._logicalRange = range;
        this._fitContent = false;
    };
    InvalidateMask.prototype.getLogicalRange = function () {
        return this._logicalRange;
    };
    InvalidateMask.prototype.merge = function (other) {
        var _this = this;
        this._force = this._force || other._force;
        if (other._fitContent) {
            this.setFitContent();
        }
        if (other._logicalRange) {
            this.setLogicalRange(other._logicalRange);
        }
        this._globalLevel = Math.max(this._globalLevel, other._globalLevel);
        other._invalidatedPanes.forEach(function (invalidation, index) {
            _this.invalidatePane(index, invalidation);
        });
    };
    return InvalidateMask;
}());
export { InvalidateMask };
