import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import cache from '../cache';
import { ContourSet } from '../cache/classes/ContourSet';
import { GeometryType } from '../enums';
async function createAndCacheGeometry(geometryId, options) {
    let geometry = cache.getGeometry(geometryId);
    if (geometry) {
        return geometry;
    }
    if (options.type === GeometryType.CONTOUR) {
        geometry = _createContourSet(geometryId, options.geometryData);
    }
    else {
        throw new Error('Unknown geometry type, Only CONTOUR is supported');
    }
    const geometryLoadObject = {
        promise: Promise.resolve(geometry),
    };
    await cache.putGeometryLoadObject(geometryId, geometryLoadObject);
    return geometry;
}
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
    const contourSet = new ContourSet({
        id: contourSetData.id,
        data: contourSetData.data,
        color: contourSetData.color,
        frameOfReferenceUID: contourSetData.frameOfReferenceUID,
        segmentIndex: contourSetData.segmentIndex,
    });
    const geometry = {
        id: geometryId,
        type: GeometryType.CONTOUR,
        data: contourSet,
        sizeInBytes: contourSet.getSizeInBytes(),
    };
    return geometry;
}
export { createAndCacheGeometry };
//# sourceMappingURL=geometryLoader.js.map