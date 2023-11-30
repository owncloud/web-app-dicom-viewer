import type { vtkImageData } from '@kitware/vtk.js/Common/DataModel/ImageData';
import { Metadata, VolumeScalarData, Point3, IImageLoadObject, Mat3 } from '../types';
interface IImageVolume {
    readonly volumeId: string;
    dimensions: Point3;
    direction: Mat3;
    metadata: Metadata;
    origin: Point3;
    isPreScaled: boolean;
    scaling?: {
        PT?: {
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
    sizeInBytes?: number;
    spacing: Point3;
    numVoxels: number;
    imageData?: vtkImageData;
    vtkOpenGLTexture: any;
    loadStatus?: Record<string, any>;
    imageIds: Array<string>;
    referencedVolumeId?: string;
    hasPixelSpacing: boolean;
    isDynamicVolume(): boolean;
    convertToCornerstoneImage?: (imageId: string, imageIdIndex: number) => IImageLoadObject;
    cancelLoading?: () => void;
    getScalarData(): VolumeScalarData;
    getImageIdIndex(imageId: string): number;
    getImageURIIndex(imageURI: string): number;
    destroy(): void;
}
export default IImageVolume;
