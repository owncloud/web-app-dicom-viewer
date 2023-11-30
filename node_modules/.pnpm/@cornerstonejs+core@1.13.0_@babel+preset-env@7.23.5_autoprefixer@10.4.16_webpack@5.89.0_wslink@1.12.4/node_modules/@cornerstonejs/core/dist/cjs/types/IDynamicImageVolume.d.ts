import { IImageVolume, VolumeScalarData } from '../types';
interface IDynamicImageVolume extends IImageVolume {
    get timePointIndex(): number;
    set timePointIndex(newTimePointIndex: number);
    get numTimePoints(): number;
    getScalarDataArrays(): VolumeScalarData[];
}
export default IDynamicImageVolume;
