import {
    CompressionSettings,
    CompressionResult,
    ProgressCallback,
    ImageInfo,
    CanvasContext2D,
    DEFAULT_QUALITY
} from '../types';
import { WorkerManager } from './workerManager';

export class ImageCompressor {
    private lastResults: CompressionResult[] = [];
    private workerManager: WorkerManager;

    constructor() {
        this.workerManager = new WorkerManager();
    }

    public async compressImages(
        files: File[],
        settings: CompressionSettings,
        onProgress?: ProgressCallback
    ): Promise<CompressionResult[]> {
        const results: CompressionResult[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const result = await this.compressImage(file, settings);
                results.push(result);

                if (onProgress) {
                    const progress = ((i + 1) / files.length) * 100;
                    onProgress(progress, i + 1, files.length);
                }
            } catch (error) {
                console.error(`压缩 ${file.name} 失败:`, error);
            }
        }

        this.lastResults = results;
        return results;
    }

    public async compressImage(
        file: File,
        settings: CompressionSettings
    ): Promise<CompressionResult> {
        // 获取原始图片信息
        const originalInfo = await this.getImageInfo(file);
        const originalUrl = URL.createObjectURL(file);

        // 加载图片
        const img = await this.loadImage(file);

        // 处理 EXIF 旋转
        const correctedImg = await this.correctImageOrientation(img, file);

        // 计算新尺寸
        const newDimensions = this.calculateNewDimensions(
            correctedImg.width,
            correctedImg.height,
            settings.maxWidth,
            settings.maxHeight
        );

        // 创建 Canvas 并压缩
        const compressedBlob = await this.compressWithCanvas(
            correctedImg,
            newDimensions.width,
            newDimensions.height,
            settings.quality,
            this.getOutputFormat(file.type, settings.outputFormat)
        );

        // 获取压缩后信息
        const compressedInfo = await this.getBlobInfo(compressedBlob, originalInfo.name);
        const compressedUrl = URL.createObjectURL(compressedBlob);

        // 计算压缩率
        const compressionRatio = this.calculateCompressionRatio(
            originalInfo.size,
            compressedInfo.size
        );

        return {
            originalFile: file,
            compressedBlob,
            originalInfo,
            compressedInfo,
            compressionRatio,
            originalUrl,
            compressedUrl
        };
    }

    private async getImageInfo(file: File): Promise<ImageInfo> {
        const dimensions = await this.getImageDimensions(file);

        return {
            name: file.name,
            size: file.size,
            type: file.type,
            width: dimensions.width,
            height: dimensions.height,
            lastModified: file.lastModified
        };
    }

    private async getBlobInfo(blob: Blob, originalName: string): Promise<ImageInfo> {
        const dimensions = await this.getBlobDimensions(blob);

        return {
            name: originalName,
            size: blob.size,
            type: blob.type,
            width: dimensions.width,
            height: dimensions.height,
            lastModified: Date.now()
        };
    }

    private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    private getBlobDimensions(blob: Blob): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    }

    private loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    private async correctImageOrientation(
        img: HTMLImageElement,
        file: File
    ): Promise<HTMLImageElement> {
        try {
            const orientation = await this.getImageOrientation(file);

            if (orientation <= 1) {
                return img; // 无需旋转
            }

            return this.rotateImage(img, orientation);
        } catch (error) {
            console.warn('EXIF 数据读取失败，跳过旋转:', error);
            return img;
        }
    }

    private async getImageOrientation(file: File): Promise<number> {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const view = new DataView(e.target?.result as ArrayBuffer);

                if (view.getUint16(0, false) !== 0xFFD8) {
                    resolve(1); // 不是 JPEG 文件
                    return;
                }

                const length = view.byteLength;
                let offset = 2;

                while (offset < length) {
                    if (view.getUint16(offset, false) === 0xFFE1) {
                        const exifOffset = offset + 4;
                        if (view.getUint32(exifOffset, false) === 0x45786966) {
                            const orientation = this.getOrientationFromEXIF(view, exifOffset + 4);
                            resolve(orientation);
                            return;
                        }
                    }
                    offset += 2 + view.getUint16(offset + 2, false);
                }

                resolve(1); // 未找到 EXIF 数据
            };

            reader.onerror = () => resolve(1);
            reader.readAsArrayBuffer(file);
        });
    }

    private getOrientationFromEXIF(view: DataView, offset: number): number {
        try {
            const little = view.getUint16(offset) === 0x4949;
            const ifdOffset = view.getUint32(offset + 4, little);
            const tagCount = view.getUint16(offset + ifdOffset, little);

            for (let i = 0; i < tagCount; i++) {
                const entryOffset = offset + ifdOffset + 2 + (i * 12);
                const tag = view.getUint16(entryOffset, little);

                if (tag === 0x0112) { // Orientation tag
                    return view.getUint16(entryOffset + 8, little);
                }
            }
        } catch (error) {
            console.warn('EXIF orientation 解析失败:', error);
        }

        return 1;
    }

    private rotateImage(img: HTMLImageElement, orientation: number): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d') as CanvasContext2D;

            let { width, height } = img;

            // 根据 orientation 设置 canvas 尺寸和变换
            switch (orientation) {
                case 2:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.scale(-1, 1);
                    ctx.translate(-width, 0);
                    break;
                case 3:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.rotate(Math.PI);
                    ctx.translate(-width, -height);
                    break;
                case 4:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.scale(1, -1);
                    ctx.translate(0, -height);
                    break;
                case 5:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
                default:
                    canvas.width = width;
                    canvas.height = height;
            }

            ctx.drawImage(img, 0, 0);

            // 创建新的 Image 对象
            const rotatedImg = new Image();
            rotatedImg.onload = () => resolve(rotatedImg);
            rotatedImg.src = canvas.toDataURL();
        });
    }

    private calculateNewDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return { width: originalWidth, height: originalHeight };
        }

        const aspectRatio = originalWidth / originalHeight;

        if (originalWidth > originalHeight) {
            const newWidth = Math.min(originalWidth, maxWidth);
            const newHeight = newWidth / aspectRatio;

            if (newHeight > maxHeight) {
                return {
                    width: maxHeight * aspectRatio,
                    height: maxHeight
                };
            }

            return { width: newWidth, height: newHeight };
        } else {
            const newHeight = Math.min(originalHeight, maxHeight);
            const newWidth = newHeight * aspectRatio;

            if (newWidth > maxWidth) {
                return {
                    width: maxWidth,
                    height: maxWidth / aspectRatio
                };
            }

            return { width: newWidth, height: newHeight };
        }
    }

    private async compressWithCanvas(
        img: HTMLImageElement,
        width: number,
        height: number,
        quality: number,
        outputFormat: string
    ): Promise<Blob> {
        // Check if we should use Web Worker for large images
        if (this.workerManager.shouldUseWorker(width, height)) {
            try {
                return await this.compressWithWorker(img, width, height, quality, outputFormat);
            } catch (error) {
                console.warn('Web Worker 压缩失败，回退到主线程:', error);
                // Fallback to main thread
                return await this.workerManager.compressImageFallback(img, width, height, quality, outputFormat);
            }
        } else {
            // Use main thread for smaller images
            return await this.workerManager.compressImageFallback(img, width, height, quality, outputFormat);
        }
    }

    private async compressWithWorker(
        img: HTMLImageElement,
        width: number,
        height: number,
        quality: number,
        outputFormat: string
    ): Promise<Blob> {
        // Create temporary canvas to get ImageData
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
            throw new Error('无法创建临时 Canvas 上下文');
        }

        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.drawImage(img, 0, 0, width, height);

        // Get ImageData for worker
        const imageData = tempCtx.getImageData(0, 0, width, height);

        // Send to worker
        const arrayBuffer = await this.workerManager.compressImageWithWorker(
            imageData,
            width,
            height,
            quality,
            outputFormat
        );

        // Convert ArrayBuffer back to Blob
        return new Blob([arrayBuffer], { type: outputFormat });
    }

    private getOutputFormat(originalFormat: string, settingsFormat?: string): string {
        if (settingsFormat) {
            return settingsFormat;
        }

        // 保持原格式，但 AVIF 转为 JPEG (因为浏览器支持度)
        if (originalFormat === 'image/avif') {
            return 'image/jpeg';
        }

        return originalFormat;
    }

    private calculateCompressionRatio(originalSize: number, compressedSize: number): number {
        return Math.round(((originalSize - compressedSize) / originalSize) * 100);
    }

    public getLastResults(): CompressionResult[] {
        return this.lastResults;
    }

    public clearResults(): void {
        // 清理 URLs
        this.lastResults.forEach(result => {
            URL.revokeObjectURL(result.originalUrl);
            URL.revokeObjectURL(result.compressedUrl);
        });

        this.lastResults = [];

        // 终止 Web Worker
        this.workerManager.terminateWorker();
    }
}