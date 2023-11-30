import type { vtkImageData } from '@kitware/vtk.js/Common/DataModel/ImageData';
import { IVolume, VolumeScalarData, Metadata, Point3, IImageVolume, Mat3 } from '../../types';
export declare class ImageVolume implements IImageVolume {
    private _imageIds;
    private _imageIdsIndexMap;
    private _imageURIsIndexMap;
    protected scalarData: VolumeScalarData | Array<VolumeScalarData>;
    readonly volumeId: string;
    isPreScaled: boolean;
    dimensions: Point3;
    direction: Mat3;
    metadata: Metadata;
    origin: Point3;
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
    referencedVolumeId?: string;
    hasPixelSpacing: boolean;
    constructor(props: IVolume);
    get imageIds(): Array<string>;
    set imageIds(newImageIds: Array<string>);
    private _reprocessImageIds;
    cancelLoading: () => void;
    isDynamicVolume(): boolean;
    getScalarData(): VolumeScalarData;
    getImageIdIndex(imageId: string): number;
    getImageURIIndex(imageURI: string): number;
    destroy(): void;
}
export default ImageVolume;
