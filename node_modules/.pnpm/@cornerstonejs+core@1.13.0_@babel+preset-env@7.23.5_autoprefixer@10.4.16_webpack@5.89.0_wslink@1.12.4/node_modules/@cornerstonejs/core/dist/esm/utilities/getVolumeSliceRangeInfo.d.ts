import { ActorSliceRange, IVolumeViewport, ICamera } from '../types';
declare function getVolumeSliceRangeInfo(viewport: IVolumeViewport, volumeId: string): {
    sliceRange: ActorSliceRange;
    spacingInNormalDirection: number;
    camera: ICamera;
};
export default getVolumeSliceRangeInfo;
