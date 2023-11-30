import { ColormapPublic } from './Colormap';
import { ViewportProperties } from './ViewportProperties';
declare type VolumeViewportProperties = ViewportProperties & {
    colormap?: ColormapPublic;
    preset?: string;
};
export default VolumeViewportProperties;
