import JSZip from 'jszip';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE, CompressionResult } from '../types';

export class FileHandler {
    private files: File[] = [];
    public onFilesSelected?: (files: FileList) => void;

    constructor() {
        this.setupDropZone();
        this.setupFileInput();
    }

    private setupDropZone(): void {
        const uploadArea = document.getElementById('uploadArea');
        const selectBtn = document.getElementById('selectBtn');

        if (!uploadArea || !selectBtn) return;

        // 拖拽事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer?.files;
            if (files && this.onFilesSelected) {
                this.onFilesSelected(files);
            }
        });

        // 点击选择文件
        selectBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            fileInput?.click();
        });

        uploadArea.addEventListener('click', () => {
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            fileInput?.click();
        });
    }

    private setupFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;

        fileInput?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const files = target.files;

            if (files && this.onFilesSelected) {
                this.onFilesSelected(files);
            }
        });
    }

    public validateFiles(files: FileList): File[] {
        const validFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 检查文件类型
            if (!SUPPORTED_FORMATS.includes(file.type as any)) {
                console.warn(`不支持的文件格式: ${file.type}`);
                continue;
            }

            // 检查文件大小
            if (file.size > MAX_FILE_SIZE) {
                console.warn(`文件过大: ${file.name} (${this.formatFileSize(file.size)})`);
                continue;
            }

            validFiles.push(file);
        }

        return validFiles;
    }

    public setFiles(files: File[]): void {
        this.files = files;
    }

    public getFiles(): File[] {
        return this.files;
    }

    public clearFiles(): void {
        this.files = [];

        // 清空文件输入
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    public async downloadAsZip(results: CompressionResult[]): Promise<void> {
        if (results.length === 0) return;

        const zip = new JSZip();
        const folder = zip.folder('compressed-images');

        if (!folder) {
            throw new Error('创建ZIP文件夹失败');
        }

        // 添加压缩后的图片到ZIP
        for (const result of results) {
            const fileName = this.generateCompressedFileName(result.originalFile.name);
            folder.file(fileName, result.compressedBlob);
        }

        try {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(zipBlob, 'compressed-images.zip');
        } catch (error) {
            console.error('生成ZIP文件失败:', error);
            throw error;
        }
    }

    public downloadSingle(blob: Blob, originalName: string): void {
        const fileName = this.generateCompressedFileName(originalName);
        this.downloadBlob(blob, fileName);
    }

    private downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    private generateCompressedFileName(originalName: string): string {
        const lastDotIndex = originalName.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return `${originalName}_compressed`;
        }

        const nameWithoutExt = originalName.substring(0, lastDotIndex);
        const ext = originalName.substring(lastDotIndex);
        return `${nameWithoutExt}_compressed${ext}`;
    }

    public formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    public getImageInfo(file: File): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
}