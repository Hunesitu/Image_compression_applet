// Web Worker for image compression
// This runs in a separate thread to avoid blocking the main UI

interface WorkerMessage {
    type: 'compress';
    data: {
        imageData: ImageData;
        width: number;
        height: number;
        quality: number;
        format: string;
    };
}

interface WorkerResponse {
    type: 'compressed' | 'error';
    data?: ArrayBuffer;
    error?: string;
}

self.onmessage = function(e: MessageEvent<WorkerMessage>) {
    const { type, data } = e.data;

    if (type === 'compress') {
        try {
            compressImage(data).then(result => {
                const response: WorkerResponse = {
                    type: 'compressed',
                    data: result
                };
                self.postMessage(response);
            }).catch(error => {
                const response: WorkerResponse = {
                    type: 'error',
                    error: error.message
                };
                self.postMessage(response);
            });
        } catch (error) {
            const response: WorkerResponse = {
                type: 'error',
                error: (error as Error).message
            };
            self.postMessage(response);
        }
    }
};

async function compressImage(data: {
    imageData: ImageData;
    width: number;
    height: number;
    quality: number;
    format: string;
}): Promise<ArrayBuffer> {
    const { imageData, width, height, quality, format } = data;

    // Create OffscreenCanvas in Worker
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
    }

    // Put image data on canvas
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob
    const blob = await canvas.convertToBlob({
        type: format,
        quality: quality
    });

    // Convert blob to array buffer
    return await blob.arrayBuffer();
}

export {};