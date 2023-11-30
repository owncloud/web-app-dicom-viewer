import { mat4 } from 'gl-matrix';
declare const spatialRegistrationMetadataProvider: {
    add: (query: string[], payload: mat4) => void;
    get: (type: string, query: string[]) => mat4;
};
export default spatialRegistrationMetadataProvider;
