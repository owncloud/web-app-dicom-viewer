import cache from '../cache/cache';
import Events from '../enums/Events';
import eventTarget from '../eventTarget';
import { triggerEvent } from '../utilities';
import imageLoadPoolManager from '../requestPool/imageLoadPoolManager';
const imageLoaders = {};
let unknownImageLoader;
function loadImageFromImageLoader(imageId, options) {
    const colonIndex = imageId.indexOf(':');
    const scheme = imageId.substring(0, colonIndex);
    const loader = imageLoaders[scheme];
    if (loader === undefined || loader === null) {
        if (unknownImageLoader !== undefined) {
            return unknownImageLoader(imageId);
        }
        throw new Error('loadImageFromImageLoader: no image loader for imageId');
    }
    const imageLoadObject = loader(imageId, options);
    imageLoadObject.promise.then(function (image) {
        triggerEvent(eventTarget, Events.IMAGE_LOADED, { image });
    }, function (error) {
        const errorObject = {
            imageId,
            error,
        };
        triggerEvent(eventTarget, Events.IMAGE_LOAD_FAILED, errorObject);
    });
    return imageLoadObject;
}
function loadImageFromCacheOrVolume(imageId, options) {
    let imageLoadObject = cache.getImageLoadObject(imageId);
    if (imageLoadObject !== undefined) {
        return imageLoadObject;
    }
    const cachedVolumeInfo = cache.getVolumeContainingImageId(imageId);
    if (cachedVolumeInfo && cachedVolumeInfo.volume.loadStatus.loaded) {
        const { volume, imageIdIndex } = cachedVolumeInfo;
        imageLoadObject = volume.convertToCornerstoneImage(imageId, imageIdIndex);
        return imageLoadObject;
    }
    const cachedImage = cache.getCachedImageBasedOnImageURI(imageId);
    if (cachedImage) {
        imageLoadObject = cachedImage.imageLoadObject;
        return imageLoadObject;
    }
    imageLoadObject = loadImageFromImageLoader(imageId, options);
    return imageLoadObject;
}
export function loadImage(imageId, options = { priority: 0, requestType: 'prefetch' }) {
    if (imageId === undefined) {
        throw new Error('loadImage: parameter imageId must not be undefined');
    }
    return loadImageFromCacheOrVolume(imageId, options).promise;
}
export function loadAndCacheImage(imageId, options = { priority: 0, requestType: 'prefetch' }) {
    if (imageId === undefined) {
        throw new Error('loadAndCacheImage: parameter imageId must not be undefined');
    }
    const imageLoadObject = loadImageFromCacheOrVolume(imageId, options);
    if (!cache.getImageLoadObject(imageId)) {
        cache.putImageLoadObject(imageId, imageLoadObject).catch((err) => {
            console.warn(err);
        });
    }
    return imageLoadObject.promise;
}
export function loadAndCacheImages(imageIds, options = { priority: 0, requestType: 'prefetch' }) {
    if (!imageIds || imageIds.length === 0) {
        throw new Error('loadAndCacheImages: parameter imageIds must be list of image Ids');
    }
    const allPromises = imageIds.map((imageId) => {
        return loadAndCacheImage(imageId, options);
    });
    return allPromises;
}
export function cancelLoadImage(imageId) {
    const filterFunction = ({ additionalDetails }) => {
        if (additionalDetails.imageId) {
            return additionalDetails.imageId !== imageId;
        }
        return true;
    };
    imageLoadPoolManager.filterRequests(filterFunction);
    const imageLoadObject = cache.getImageLoadObject(imageId);
    if (imageLoadObject) {
        imageLoadObject.cancelFn();
    }
}
export function cancelLoadImages(imageIds) {
    imageIds.forEach((imageId) => cancelLoadImage(imageId));
}
export function cancelLoadAll() {
    const requestPool = imageLoadPoolManager.getRequestPool();
    Object.keys(requestPool).forEach((type) => {
        const requests = requestPool[type];
        Object.keys(requests).forEach((priority) => {
            const requestDetails = requests[priority].pop();
            const { imageId, volumeId } = requestDetails.additionalDetails;
            let loadObject;
            if (imageId) {
                loadObject = cache.getImageLoadObject(imageId);
            }
            else if (volumeId) {
                loadObject = cache.getVolumeLoadObject(volumeId);
            }
            if (loadObject) {
                loadObject.cancel();
            }
        });
        imageLoadPoolManager.clearRequestStack(type);
    });
}
export function registerImageLoader(scheme, imageLoader) {
    imageLoaders[scheme] = imageLoader;
}
export function registerUnknownImageLoader(imageLoader) {
    const oldImageLoader = unknownImageLoader;
    unknownImageLoader = imageLoader;
    return oldImageLoader;
}
export function unregisterAllImageLoaders() {
    Object.keys(imageLoaders).forEach((imageLoader) => delete imageLoaders[imageLoader]);
    unknownImageLoader = undefined;
}
//# sourceMappingURL=imageLoader.js.map