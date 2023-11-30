import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import { GeometryType } from '../enums';
import { IGeometry, PublicContourSetData } from '../types';
declare type GeometryOptions = {
    type: GeometryType;
    geometryData: PublicContourSetData;
};
declare function createAndCacheGeometry(geometryId: string, options: GeometryOptions): Promise<IGeometry>;
export { createAndCacheGeometry };
