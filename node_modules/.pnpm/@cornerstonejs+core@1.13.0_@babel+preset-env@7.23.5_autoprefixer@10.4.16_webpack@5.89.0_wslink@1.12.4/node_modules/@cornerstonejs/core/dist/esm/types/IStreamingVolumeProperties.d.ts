interface IStreamingVolumeProperties {
    imageIds: Array<string>;
    loadStatus: {
        loaded: boolean;
        loading: boolean;
        cancelled: boolean;
        cachedFrames: Array<boolean>;
        callbacks: Array<() => void>;
    };
}
export default IStreamingVolumeProperties;
