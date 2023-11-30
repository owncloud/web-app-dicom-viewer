"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gl_matrix_1 = require("gl-matrix");
const RenderingEngine_1 = require("../RenderingEngine");
const spatialRegistrationMetadataProvider_1 = __importDefault(require("./spatialRegistrationMetadataProvider"));
const __1 = require("..");
const isEqual_1 = __importDefault(require("./isEqual"));
function calculateViewportsSpatialRegistration(viewport1, viewport2) {
    if (!(viewport1 instanceof RenderingEngine_1.StackViewport) ||
        !(viewport2 instanceof RenderingEngine_1.StackViewport)) {
        throw new Error('calculateViewportsSpatialRegistration: Both viewports must be StackViewports, volume viewports are not supported yet');
    }
    const isSameFrameOfReference = viewport1.getFrameOfReferenceUID() === viewport2.getFrameOfReferenceUID();
    if (isSameFrameOfReference) {
        return;
    }
    const imageId1 = viewport1.getCurrentImageId();
    const imageId2 = viewport2.getCurrentImageId();
    const imagePlaneModule1 = __1.metaData.get('imagePlaneModule', imageId1);
    const imagePlaneModule2 = __1.metaData.get('imagePlaneModule', imageId2);
    const isSameImagePlane = imagePlaneModule1 &&
        imagePlaneModule2 &&
        (0, isEqual_1.default)(imagePlaneModule1.imageOrientationPatient, imagePlaneModule2.imageOrientationPatient);
    if (!isSameImagePlane) {
        throw new Error('Viewport spatial registration only supported for same orientation (hence translation only) for now');
    }
    const imagePositionPatient1 = imagePlaneModule1.imagePositionPatient;
    const imagePositionPatient2 = imagePlaneModule2.imagePositionPatient;
    const translation = gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), imagePositionPatient1, imagePositionPatient2);
    const mat = gl_matrix_1.mat4.fromTranslation(gl_matrix_1.mat4.create(), translation);
    spatialRegistrationMetadataProvider_1.default.add([viewport1.id, viewport2.id], mat);
}
exports.default = calculateViewportsSpatialRegistration;
//# sourceMappingURL=calculateViewportsSpatialRegistration.js.map