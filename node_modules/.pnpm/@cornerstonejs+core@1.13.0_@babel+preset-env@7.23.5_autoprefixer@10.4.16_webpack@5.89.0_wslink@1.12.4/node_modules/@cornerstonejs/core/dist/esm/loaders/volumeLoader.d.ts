import '@kitware/vtk.js/Rendering/Profiles/Volume';
import { ImageVolume } from '../cache/classes/ImageVolume';
import type * as Types from '../types';
import { Point3, Metadata, Mat3 } from '../types';
interface VolumeLoaderOptions {
    imageIds: Array<string>;
}
interface DerivedVolumeOptions {
    volumeId: string;
    targetBuffer?: {
        type: 'Float32Array' | 'Uint8Array' | 'Uint16Array' | 'Int16Array';
        sharedArrayBuffer?: boolean;
    };
}
interface LocalVolumeOptions {
    scalarData: Float32Array | Uint8Array | Uint16Array | Int16Array;
    metadata: Metadata;
    dimensions: Point3;
    spacing: Point3;
    origin: Point3;
    direction: Mat3;
}
export declare function loadVolume(volumeId: string, options?: VolumeLoaderOptions): Promise<Types.IImageVolume>;
export declare function createAndCacheVolume(volumeId: string, options: VolumeLoaderOptions): Promise<Record<string, any>>;
export declare function createAndCacheDerivedVolume(referencedVolumeId: string, options: DerivedVolumeOptions): Promise<ImageVolume>;
export declare function createLocalVolume(options: LocalVolumeOptions, volumeId: string, preventCache?: boolean): ImageVolume;
export declare function registerVolumeLoader(scheme: string, volumeLoader: Types.VolumeLoaderFn): void;
export declare function getVolumeLoaderSchemes(): string[];
export declare function registerUnknownVolumeLoader(volumeLoader: Types.VolumeLoaderFn): Types.VolumeLoaderFn | undefined;
export {};
