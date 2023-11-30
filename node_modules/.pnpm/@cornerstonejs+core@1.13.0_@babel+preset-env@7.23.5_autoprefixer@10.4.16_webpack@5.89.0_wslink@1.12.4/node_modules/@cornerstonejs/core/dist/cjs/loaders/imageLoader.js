"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterAllImageLoaders = exports.registerUnknownImageLoader = exports.registerImageLoader = exports.cancelLoadAll = exports.cancelLoadImages = exports.cancelLoadImage = exports.loadAndCacheImages = exports.loadAndCacheImage = exports.loadImage = void 0;
const cache_1 = __importDefault(require("../cache/cache"));
const Events_1 = __importDefault(require("../enums/Events"));
const eventTarget_1 = __importDefault(require("../eventTarget"));
const utilities_1 = require("../utilities");
const imageLoadPoolManager_1 = __importDefault(require("../requestPool/imageLoadPoolManager"));
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
        (0, utilities_1.triggerEvent)(eventTarget_1.default, Events_1.default.IMAGE_LOADED, { image });
    }, function (error) {
        const errorObject = {
            imageId,
            error,
        };
        (0, utilities_1.triggerEvent)(eventTarget_1.default, Events_1.default.IMAGE_LOAD_FAILED, errorObject);
    });
    return imageLoadObject;
}
function loadImageFromCacheOrVolume(imageId, options) {
    let imageLoadObject = cache_1.default.getImageLoadObject(imageId);
    if (imageLoadObject !== undefined) {
        return imageLoadObject;
    }
    const cachedVolumeInfo = cache_1.default.getVolumeContainingImageId(imageId);
    if (cachedVolumeInfo && cachedVolumeInfo.volume.loadStatus.loaded) {
        const { volume, imageIdIndex } = cachedVolumeInfo;
        imageLoadObject = volume.convertToCornerstoneImage(imageId, imageIdIndex);
        return imageLoadObject;
    }
    const cachedImage = cache_1.default.getCachedImageBasedOnImageURI(imageId);
    if (cachedImage) {
        imageLoadObject = cachedImage.imageLoadObject;
        return imageLoadObject;
    }
    imageLoadObject = loadImageFromImageLoader(imageId, options);
    return imageLoadObject;
}
function loadImage(imageId, options = { priority: 0, requestType: 'prefetch' }) {
    if (imageId === undefined) {
        throw new Error('loadImage: parameter imageId must not be undefined');
    }
    return loadImageFromCacheOrVolume(imageId, options).promise;
}
exports.loadImage = loadImage;
function loadAndCacheImage(imageId, options = { priority: 0, requestType: 'prefetch' }) {
    if (imageId === undefined) {
        throw new Error('loadAndCacheImage: parameter imageId must not be undefined');
    }
    const imageLoadObject = loadImageFromCacheOrVolume(imageId, options);
    if (!cache_1.default.getImageLoadObject(imageId)) {
        cache_1.default.putImageLoadObject(imageId, imageLoadObject).catch((err) => {
            console.warn(err);
        });
    }
    return imageLoadObject.promise;
}
exports.loadAndCacheImage = loadAndCacheImage;
function loadAndCacheImages(imageIds, options = { priority: 0, requestType: 'prefetch' }) {
    if (!imageIds || imageIds.length === 0) {
        throw new Error('loadAndCacheImages: parameter imageIds must be list of image Ids');
    }
    const allPromises = imageIds.map((imageId) => {
        return loadAndCacheImage(imageId, options);
    });
    return allPromises;
}
exports.loadAndCacheImages = loadAndCacheImages;
function cancelLoadImage(imageId) {
    const filterFunction = ({ additionalDetails }) => {
        if (additionalDetails.imageId) {
            return additionalDetails.imageId !== imageId;
        }
        return true;
    };
    imageLoadPoolManager_1.default.filterRequests(filterFunction);
    const imageLoadObject = cache_1.default.getImageLoadObject(imageId);
    if (imageLoadObject) {
        imageLoadObject.cancelFn();
    }
}
exports.cancelLoadImage = cancelLoadImage;
function cancelLoadImages(imageIds) {
    imageIds.forEach((imageId) => cancelLoadImage(imageId));
}
exports.cancelLoadImages = cancelLoadImages;
function cancelLoadAll() {
    const requestPool = imageLoadPoolManager_1.default.getRequestPool();
    Object.keys(requestPool).forEach((type) => {
        const requests = requestPool[type];
        Object.keys(requests).forEach((priority) => {
            const requestDetails = requests[priority].pop();
            const { imageId, volumeId } = requestDetails.additionalDetails;
            let loadObject;
            if (imageId) {
                loadObject = cache_1.default.getImageLoadObject(imageId);
            }
            else if (volumeId) {
                loadObject = cache_1.default.getVolumeLoadObject(volumeId);
            }
            if (loadObject) {
                loadObject.cancel();
            }
        });
        imageLoadPoolManager_1.default.clearRequestStack(type);
    });
}
exports.cancelLoadAll = cancelLoadAll;
function registerImageLoader(scheme, imageLoader) {
    imageLoaders[scheme] = imageLoader;
}
exports.registerImageLoader = registerImageLoader;
function registerUnknownImageLoader(imageLoader) {
    const oldImageLoader = unknownImageLoader;
    unknownImageLoader = imageLoader;
    return oldImageLoader;
}
exports.registerUnknownImageLoader = registerUnknownImageLoader;
function unregisterAllImageLoaders() {
    Object.keys(imageLoaders).forEach((imageLoader) => delete imageLoaders[imageLoader]);
    unknownImageLoader = undefined;
}
exports.unregisterAllImageLoaders = unregisterAllImageLoaders;
//# sourceMappingURL=imageLoader.js.map