import { GeometryType } from '../enums';
import { IContourSet } from './IContourSet';
interface IGeometry {
    id: string;
    type: GeometryType;
    data: IContourSet;
    sizeInBytes: number;
}
export default IGeometry;
