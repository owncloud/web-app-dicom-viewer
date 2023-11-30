"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndCacheGeometry = void 0;
require("@kitware/vtk.js/Rendering/Profiles/Geometry");
const cache_1 = __importDefault(require("../cache"));
const ContourSet_1 = require("../cache/classes/ContourSet");
const enums_1 = require("../enums");
function createAndCacheGeometry(geometryId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let geometry = cache_1.default.getGeometry(geometryId);
        if (geometry) {
            return geometry;
        }
        if (options.type === enums_1.GeometryType.CONTOUR) {
            geometry = _createContourSet(geometryId, options.geometryData);
        }
        else {
            throw new Error('Unknown geometry type, Only CONTOUR is supported');
        }
        const geometryLoadObject = {
            promise: Promise.resolve(geometry),
        };
        yield cache_1.default.putGeometryLoadObject(geometryId, geometryLoadObject);
        return geometry;
    });
}
exports.createAndCacheGeometry = createAndCacheGeometry;
function _createContourSet(geometryId, contourSetData) {
    if (!contourSetData || contourSetData.data.length === 0) {
        throw new Error('Invalid contour set data, see publicContourSetData type for more info');
    }
    if (!contourSetData.id) {
        throw new Error('Invalid contour set data, each contour set must have an id');
    }
    if (!contourSetData.data || !Array.isArray(contourSetData.data)) {
        throw new Error('Invalid contour set data, each contour set must have an array of contours');
    }
    contourSetData.data.forEach((contourData) => {
        if (!contourData.points || !Array.isArray(contourData.points)) {
            throw new Error('Invalid contour set data, each contour must have an array of points');
        }
        contourData.points.forEach((point) => {
            if (!point || !Array.isArray(point) || point.length !== 3) {
                throw new Error('Invalid contour set data, each point must be an array of length 3');
            }
        });
    });
    const contourSet = new ContourSet_1.ContourSet({
        id: contourSetData.id,
        data: contourSetData.data,
        color: contourSetData.color,
        frameOfReferenceUID: contourSetData.frameOfReferenceUID,
        segmentIndex: contourSetData.segmentIndex,
    });
    const geometry = {
        id: geometryId,
        type: enums_1.GeometryType.CONTOUR,
        data: contourSet,
        sizeInBytes: contourSet.getSizeInBytes(),
    };
    return geometry;
}
//# sourceMappingURL=geometryLoader.js.map