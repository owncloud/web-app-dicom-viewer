import { ImageVolume } from './../cache/classes/ImageVolume';
import IGeometry from './IGeometry';
import IImage from './IImage';
export interface IImageLoadObject {
    promise: Promise<IImage>;
    cancelFn?: () => void;
    decache?: () => void;
}
export interface IVolumeLoadObject {
    promise: Promise<ImageVolume>;
    cancelFn?: () => void;
    decache?: () => void;
}
export interface IGeometryLoadObject {
    promise: Promise<IGeometry>;
    cancelFn?: () => void;
    decache?: () => void;
}
