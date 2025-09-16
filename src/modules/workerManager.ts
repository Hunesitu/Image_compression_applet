export class WorkerManager {
    private worker: Worker | null = null;
    private isSupported: boolean;

    constructor() {
        this.isSupported = this.checkWorkerSupport();
    }

    private checkWorkerSupport(): boolean {
        return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
    }

    public isWorkerSupported(): boolean {
        return this.isSupported;
    }

    public async compressImageWithWorker(
        imageData: ImageData,
        width: number,
        height: number,
        quality: number,
        format: string
    ): Promise<ArrayBuffer> {
        if (!this.isSupported) {
            throw new Error('Web Worker 或 OffscreenCanvas 不支持');
        }

        return new Promise((resolve, reject) => {
            // Create worker if not exists
            if (!this.worker) {
                this.worker = new Worker(
                    new URL('../workers/imageWorker.ts', import.meta.url),
                    { type: 'module' }
                );
            }

            // Set up one-time message handler
            const handleMessage = (e: MessageEvent) => {
                const { type, data, error } = e.data;

                if (type === 'compressed') {
                    this.worker?.removeEventListener('message', handleMessage);
                    resolve(data);
                } else if (type === 'error') {
                    this.worker?.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                }
            };

            this.worker.addEventListener('message', handleMessage);

            // Send compression task
            this.worker.postMessage({
                type: 'compress',
                data: {
                    imageData,
                    width,
                    height,
                    quality,
                    format
                }
            });
        });
    }

    public terminateWorker(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    // Fallback method for browsers that don't support Workers/OffscreenCanvas
    public async compressImageFallback(
        img: HTMLImageElement,
        width: number,
        height: number,
        quality: number,
        format: string
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('无法创建 Canvas 上下文'));
                return;
            }

            canvas.width = width;
            canvas.height = height;

            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas 转换失败'));
                    }
                },
                format,
                quality
            );
        });
    }

    // Determine if image is large enough to benefit from Worker
    public shouldUseWorker(width: number, height: number): boolean {
        if (!this.isSupported) return false;

        // Use worker for images larger than 1000x1000 pixels
        return width * height > 1000000;
    }
}