export interface CompressionSettings {
    quality: number;
    maxWidth: number;
    maxHeight: number;
    outputFormat?: string;
}

export interface ImageInfo {
    name: string;
    size: number;
    type: string;
    width: number;
    height: number;
    lastModified: number;
}

export interface CompressionResult {
    originalFile: File;
    compressedBlob: Blob;
    originalInfo: ImageInfo;
    compressedInfo: ImageInfo;
    compressionRatio: number;
    originalUrl: string;
    compressedUrl: string;
}

export interface ProgressCallback {
    (progress: number, current: number, total: number): void;
}

export interface EXIFData {
    orientation?: number;
    [key: string]: any;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface CanvasContext2D extends CanvasRenderingContext2D {
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: 'low' | 'medium' | 'high';
}

export type SupportedImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export const SUPPORTED_FORMATS: SupportedImageFormat[] = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const DEFAULT_QUALITY = 0.8;
export const DEFAULT_MAX_WIDTH = 2000;
export const DEFAULT_MAX_HEIGHT = 2000;