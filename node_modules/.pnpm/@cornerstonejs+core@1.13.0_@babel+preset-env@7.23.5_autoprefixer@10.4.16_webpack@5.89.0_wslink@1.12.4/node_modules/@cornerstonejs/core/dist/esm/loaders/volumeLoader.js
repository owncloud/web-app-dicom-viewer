import '@kitware/vtk.js/Rendering/Profiles/Volume';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import cloneDeep from 'lodash.clonedeep';
import { ImageVolume } from '../cache/classes/ImageVolume';
import cache from '../cache/cache';
import Events from '../enums/Events';
import eventTarget from '../eventTarget';
import triggerEvent from '../utilities/triggerEvent';
import { uuidv4 } from '../utilities';
import { getConfiguration } from '../init';
function addScalarDataToImageData(imageData, scalarData, dataArrayAttrs) {
    const scalarArray = vtkDataArray.newInstance({
        name: `Pixels`,
        values: scalarData,
        ...dataArrayAttrs,
    });
    imageData.getPointData().setScalars(scalarArray);
}
function addScalarDataArraysToImageData(imageData, scalarDataArrays, dataArrayAttrs) {
    scalarDataArrays.forEach((scalarData, i) => {
        const vtkScalarArray = vtkDataArray.newInstance({
            name: `timePoint-${i}`,
            values: scalarData,
            ...dataArrayAttrs,
        });
        imageData.getPointData().addArray(vtkScalarArray);
    });
    imageData.getPointData().setActiveScalars('timePoint-0');
}
function createInternalVTKRepresentation(volume) {
    const { dimensions, metadata, spacing, direction, origin } = volume;
    const { PhotometricInterpretation } = metadata;
    let numComponents = 1;
    if (PhotometricInterpretation === 'RGB') {
        numComponents = 3;
    }
    const imageData = vtkImageData.newInstance();
    const dataArrayAttrs = { numberOfComponents: numComponents };
    imageData.setDimensions(dimensions);
    imageData.setSpacing(spacing);
    imageData.setDirection(direction);
    imageData.setOrigin(origin);
    if (volume.isDynamicVolume()) {
        const scalarDataArrays = (volume).getScalarDataArrays();
        addScalarDataArraysToImageData(imageData, scalarDataArrays, dataArrayAttrs);
    }
    else {
        const scalarData = volume.getScalarData();
        addScalarDataToImageData(imageData, scalarData, dataArrayAttrs);
    }
    return imageData;
}
const volumeLoaders = {};
let unknownVolumeLoader;
function loadVolumeFromVolumeLoader(volumeId, options) {
    const colonIndex = volumeId.indexOf(':');
    const scheme = volumeId.substring(0, colonIndex);
    const loader = volumeLoaders[scheme];
    if (loader === undefined || loader === null) {
        if (unknownVolumeLoader !== undefined) {
            return unknownVolumeLoader(volumeId, options);
        }
        throw new Error('loadVolumeFromVolumeLoader: no volume loader for volumeId');
    }
    const volumeLoadObject = loader(volumeId, options);
    volumeLoadObject.promise.then(function (volume) {
        triggerEvent(eventTarget, Events.VOLUME_LOADED, { volume });
    }, function (error) {
        const errorObject = {
            volumeId,
            error,
        };
        triggerEvent(eventTarget, Events.VOLUME_LOADED_FAILED, errorObject);
    });
    return volumeLoadObject;
}
export function loadVolume(volumeId, options = { imageIds: [] }) {
    if (volumeId === undefined) {
        throw new Error('loadVolume: parameter volumeId must not be undefined');
    }
    let volumeLoadObject = cache.getVolumeLoadObject(volumeId);
    if (volumeLoadObject !== undefined) {
        return volumeLoadObject.promise;
    }
    volumeLoadObject = loadVolumeFromVolumeLoader(volumeId, options);
    return volumeLoadObject.promise.then((volume) => {
        volume.imageData = createInternalVTKRepresentation(volume);
        return volume;
    });
}
export async function createAndCacheVolume(volumeId, options) {
    if (volumeId === undefined) {
        throw new Error('createAndCacheVolume: parameter volumeId must not be undefined');
    }
    let volumeLoadObject = cache.getVolumeLoadObject(volumeId);
    if (volumeLoadObject !== undefined) {
        return volumeLoadObject.promise;
    }
    volumeLoadObject = loadVolumeFromVolumeLoader(volumeId, options);
    volumeLoadObject.promise.then((volume) => {
        volume.imageData = createInternalVTKRepresentation(volume);
    });
    cache.putVolumeLoadObject(volumeId, volumeLoadObject).catch((err) => {
        throw err;
    });
    return volumeLoadObject.promise;
}
export async function createAndCacheDerivedVolume(referencedVolumeId, options) {
    const referencedVolume = cache.getVolume(referencedVolumeId);
    if (!referencedVolume) {
        throw new Error(`Cannot created derived volume: Referenced volume with id ${referencedVolumeId} does not exist.`);
    }
    let { volumeId } = options;
    const { targetBuffer } = options;
    if (volumeId === undefined) {
        volumeId = uuidv4();
    }
    const { metadata, dimensions, spacing, origin, direction } = referencedVolume;
    const scalarData = referencedVolume.getScalarData();
    const scalarLength = scalarData.length;
    let numBytes, TypedArray;
    const { useNorm16Texture } = getConfiguration().rendering;
    if (targetBuffer) {
        if (targetBuffer.type === 'Float32Array') {
            numBytes = scalarLength * 4;
            TypedArray = Float32Array;
        }
        else if (targetBuffer.type === 'Uint8Array') {
            numBytes = scalarLength;
            TypedArray = Uint8Array;
        }
        else if (useNorm16Texture && targetBuffer.type === 'Uint16Array') {
            numBytes = scalarLength * 2;
            TypedArray = Uint16Array;
        }
        else if (useNorm16Texture && targetBuffer.type === 'Int16Array') {
            numBytes = scalarLength * 2;
            TypedArray = Uint16Array;
        }
        else {
            throw new Error('TargetBuffer should be Float32Array or Uint8Array');
        }
    }
    else {
        numBytes = scalarLength * 4;
        TypedArray = Float32Array;
    }
    const isCacheable = cache.isCacheable(numBytes);
    if (!isCacheable) {
        throw new Error(Events.CACHE_SIZE_EXCEEDED);
    }
    let volumeScalarData;
    if (targetBuffer?.sharedArrayBuffer) {
        const buffer = new SharedArrayBuffer(numBytes);
        volumeScalarData = new TypedArray(buffer);
    }
    else {
        volumeScalarData = new TypedArray(scalarLength);
    }
    const scalarArray = vtkDataArray.newInstance({
        name: 'Pixels',
        numberOfComponents: 1,
        values: volumeScalarData,
    });
    const derivedImageData = vtkImageData.newInstance();
    derivedImageData.setDimensions(dimensions);
    derivedImageData.setSpacing(spacing);
    derivedImageData.setDirection(direction);
    derivedImageData.setOrigin(origin);
    derivedImageData.getPointData().setScalars(scalarArray);
    const derivedVolume = new ImageVolume({
        volumeId,
        metadata: cloneDeep(metadata),
        dimensions: [dimensions[0], dimensions[1], dimensions[2]],
        spacing,
        origin,
        direction,
        imageData: derivedImageData,
        scalarData: volumeScalarData,
        sizeInBytes: numBytes,
        referencedVolumeId,
    });
    const volumeLoadObject = {
        promise: Promise.resolve(derivedVolume),
    };
    await cache.putVolumeLoadObject(volumeId, volumeLoadObject);
    return derivedVolume;
}
export function createLocalVolume(options, volumeId, preventCache = false) {
    const { scalarData, metadata, dimensions, spacing, origin, direction } = options;
    if (!scalarData ||
        !(scalarData instanceof Uint8Array ||
            scalarData instanceof Float32Array ||
            scalarData instanceof Uint16Array ||
            scalarData instanceof Int16Array)) {
        throw new Error('To use createLocalVolume you should pass scalarData of type Uint8Array, Uint16Array, Int16Array or Float32Array');
    }
    if (volumeId === undefined) {
        volumeId = uuidv4();
    }
    const cachedVolume = cache.getVolume(volumeId);
    if (cachedVolume) {
        return cachedVolume;
    }
    const scalarLength = dimensions[0] * dimensions[1] * dimensions[2];
    const numBytes = scalarData ? scalarData.buffer.byteLength : scalarLength * 4;
    const isCacheable = cache.isCacheable(numBytes);
    if (!isCacheable) {
        throw new Error(Events.CACHE_SIZE_EXCEEDED);
    }
    const scalarArray = vtkDataArray.newInstance({
        name: 'Pixels',
        numberOfComponents: 1,
        values: scalarData,
    });
    const imageData = vtkImageData.newInstance();
    imageData.setDimensions(dimensions);
    imageData.setSpacing(spacing);
    imageData.setDirection(direction);
    imageData.setOrigin(origin);
    imageData.getPointData().setScalars(scalarArray);
    const derivedVolume = new ImageVolume({
        volumeId,
        metadata: cloneDeep(metadata),
        dimensions: [dimensions[0], dimensions[1], dimensions[2]],
        spacing,
        origin,
        direction,
        imageData: imageData,
        scalarData,
        sizeInBytes: numBytes,
    });
    if (preventCache) {
        return derivedVolume;
    }
    const volumeLoadObject = {
        promise: Promise.resolve(derivedVolume),
    };
    cache.putVolumeLoadObject(volumeId, volumeLoadObject);
    return derivedVolume;
}
export function registerVolumeLoader(scheme, volumeLoader) {
    volumeLoaders[scheme] = volumeLoader;
}
export function getVolumeLoaderSchemes() {
    return Object.keys(volumeLoaders);
}
export function registerUnknownVolumeLoader(volumeLoader) {
    const oldVolumeLoader = unknownVolumeLoader;
    unknownVolumeLoader = volumeLoader;
    return oldVolumeLoader;
}
//# sourceMappingURL=volumeLoader.js.map