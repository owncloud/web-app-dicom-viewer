import { getRenderingEngine } from '../RenderingEngine';
import { getRenderingEngines } from '../RenderingEngine/getRenderingEngine';
export default function getViewportsWithImageURI(imageURI, renderingEngineId) {
    let renderingEngines;
    if (renderingEngineId) {
        renderingEngines = [getRenderingEngine(renderingEngineId)];
    }
    else {
        renderingEngines = getRenderingEngines();
    }
    const viewports = [];
    renderingEngines.forEach((renderingEngine) => {
        const stackViewports = renderingEngine.getStackViewports();
        const filteredStackViewports = stackViewports.filter((viewport) => viewport.hasImageURI(imageURI));
        const volumeViewports = renderingEngine.getVolumeViewports();
        const filteredVolumeViewports = volumeViewports.filter((viewport) => viewport.hasImageURI(imageURI));
        viewports.push(...filteredStackViewports, ...filteredVolumeViewports);
    });
    return viewports;
}
//# sourceMappingURL=getViewportsWithImageURI.js.map