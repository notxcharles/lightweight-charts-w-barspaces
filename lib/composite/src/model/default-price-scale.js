export var DefaultPriceScaleId;
(function (DefaultPriceScaleId) {
    DefaultPriceScaleId["Left"] = "left";
    DefaultPriceScaleId["Right"] = "right";
})(DefaultPriceScaleId || (DefaultPriceScaleId = {}));
export function isDefaultPriceScale(priceScaleId) {
    return priceScaleId === "left" /* Left */ || priceScaleId === "right" /* Right */;
}
