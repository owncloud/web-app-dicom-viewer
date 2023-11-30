import { vec3, mat4 } from 'gl-matrix';
import { StackViewport } from '../RenderingEngine';
import spatialRegistrationMetadataProvider from './spatialRegistrationMetadataProvider';
import { metaData } from '..';
import isEqual from './isEqual';
function calculateViewportsSpatialRegistration(viewport1, viewport2) {
    if (!(viewport1 instanceof StackViewport) ||
        !(viewport2 instanceof StackViewport)) {
        throw new Error('calculateViewportsSpatialRegistration: Both viewports must be StackViewports, volume viewports are not supported yet');
    }
    const isSameFrameOfReference = viewport1.getFrameOfReferenceUID() === viewport2.getFrameOfReferenceUID();
    if (isSameFrameOfReference) {
        return;
    }
    const imageId1 = viewport1.getCurrentImageId();
    const imageId2 = viewport2.getCurrentImageId();
    const imagePlaneModule1 = metaData.get('imagePlaneModule', imageId1);
    const imagePlaneModule2 = metaData.get('imagePlaneModule', imageId2);
    const isSameImagePlane = imagePlaneModule1 &&
        imagePlaneModule2 &&
        isEqual(imagePlaneModule1.imageOrientationPatient, imagePlaneModule2.imageOrientationPatient);
    if (!isSameImagePlane) {
        throw new Error('Viewport spatial registration only supported for same orientation (hence translation only) for now');
    }
    const imagePositionPatient1 = imagePlaneModule1.imagePositionPatient;
    const imagePositionPatient2 = imagePlaneModule2.imagePositionPatient;
    const translation = vec3.subtract(vec3.create(), imagePositionPatient1, imagePositionPatient2);
    const mat = mat4.fromTranslation(mat4.create(), translation);
    spatialRegistrationMetadataProvider.add([viewport1.id, viewport2.id], mat);
}
export default calculateViewportsSpatialRegistration;
//# sourceMappingURL=calculateViewportsSpatialRegistration.js.map