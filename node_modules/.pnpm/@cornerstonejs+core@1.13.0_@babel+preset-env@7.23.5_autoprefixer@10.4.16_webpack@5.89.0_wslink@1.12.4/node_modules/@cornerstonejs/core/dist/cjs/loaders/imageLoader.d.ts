import { IImage, ImageLoaderFn } from '../types';
export interface ImageLoaderOptions {
    priority: number;
    requestType: string;
    additionalDetails?: Record<string, unknown>;
}
export declare function loadImage(imageId: string, options?: ImageLoaderOptions): Promise<IImage>;
export declare function loadAndCacheImage(imageId: string, options?: ImageLoaderOptions): Promise<IImage>;
export declare function loadAndCacheImages(imageIds: Array<string>, options?: ImageLoaderOptions): Promise<IImage>[];
export declare function cancelLoadImage(imageId: string): void;
export declare function cancelLoadImages(imageIds: Array<string>): void;
export declare function cancelLoadAll(): void;
export declare function registerImageLoader(scheme: string, imageLoader: ImageLoaderFn): void;
export declare function registerUnknownImageLoader(imageLoader: ImageLoaderFn): ImageLoaderFn;
export declare function unregisterAllImageLoaders(): void;
