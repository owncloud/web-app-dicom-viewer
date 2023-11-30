import { ICamera, IImageVolume, IVolumeViewport } from '../types';
export default function getTargetVolumeAndSpacingInNormalDir(viewport: IVolumeViewport, camera: ICamera, targetVolumeId?: string): {
    imageVolume: IImageVolume;
    spacingInNormalDirection: number;
    actorUID: string;
};
