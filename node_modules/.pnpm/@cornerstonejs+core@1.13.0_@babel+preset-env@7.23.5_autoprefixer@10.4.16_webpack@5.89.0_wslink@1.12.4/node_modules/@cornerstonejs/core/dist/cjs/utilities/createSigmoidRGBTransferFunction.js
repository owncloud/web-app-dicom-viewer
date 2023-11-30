"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ColorTransferFunction_1 = __importDefault(require("@kitware/vtk.js/Rendering/Core/ColorTransferFunction"));
const DataArray_1 = __importDefault(require("@kitware/vtk.js/Common/Core/DataArray"));
const _1 = require(".");
function createSigmoidRGBTransferFunction(voiRange, approximationNodes = 1024) {
    const { windowWidth, windowCenter } = _1.windowLevel.toWindowLevel(voiRange.lower, voiRange.upper);
    const sigmoid = (x, wc, ww) => {
        return 1 / (1 + Math.exp((-4 * (x - wc)) / ww));
    };
    const logit = (y, wc, ww) => {
        return wc - (ww / 4) * Math.log((1 - y) / y);
    };
    const range = [...Array(approximationNodes + 2).keys()]
        .map((v) => v / (approximationNodes + 2))
        .slice(1, -1);
    const table = range.reduce((res, y) => {
        const x = logit(y, windowCenter, windowWidth);
        return res.concat(x, y, y, y, 0.5, 0.0);
    }, []);
    const cfun = ColorTransferFunction_1.default.newInstance();
    cfun.buildFunctionFromArray(DataArray_1.default.newInstance({ values: table, numberOfComponents: 6 }));
    return cfun;
}
exports.default = createSigmoidRGBTransferFunction;
//# sourceMappingURL=createSigmoidRGBTransferFunction.js.map