import type { vtkImageData } from '@kitware/vtk.js/Common/DataModel/ImageData';
import type Point3 from './Point3';
import type Metadata from './Metadata';
import Mat3 from './Mat3';
declare type VolumeScalarData = Float32Array | Uint8Array | Uint16Array | Int16Array;
interface IVolume {
    volumeId: string;
    metadata: Metadata;
    dimensions: Point3;
    spacing: Point3;
    origin: Point3;
    direction: Mat3;
    scalarData: VolumeScalarData | Array<VolumeScalarData>;
    sizeInBytes?: number;
    imageData?: vtkImageData;
    referencedVolumeId?: string;
    scaling?: {
        PT?: {
            SUVlbmFactor?: number;
            SUVbsaFactor?: number;
            suvbwToSuvlbm?: number;
            suvbwToSuvbsa?: number;
        };
    };
}
export { IVolume as default, IVolume, VolumeScalarData };
