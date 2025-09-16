import { ImageCompressor } from './modules/imageCompressor';
import { UIManager } from './modules/uiManager';
import { FileHandler } from './modules/fileHandler';

class App {
    private imageCompressor: ImageCompressor;
    private uiManager: UIManager;
    private fileHandler: FileHandler;

    constructor() {
        this.imageCompressor = new ImageCompressor();
        this.uiManager = new UIManager();
        this.fileHandler = new FileHandler();

        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.uiManager.hideAllSections();
        this.uiManager.init(); // 初始化 UI 管理器
    }

    private setupEventListeners(): void {
        // 文件选择和拖拽事件
        this.fileHandler.onFilesSelected = (files: FileList) => {
            this.handleFilesSelected(files);
        };

        // 压缩按钮事件
        const compressBtn = document.getElementById('compressBtn') as HTMLButtonElement;
        compressBtn?.addEventListener('click', () => {
            this.handleCompress();
        });

        // 清空按钮事件
        const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
        clearBtn?.addEventListener('click', () => {
            this.handleClear();
        });

        // 质量滑块事件
        const qualitySlider = document.getElementById('qualitySlider') as HTMLInputElement;
        const qualityValue = document.getElementById('qualityValue') as HTMLSpanElement;
        qualitySlider?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            qualityValue.textContent = target.value;
        });

        // 批量下载事件
        const downloadAllBtn = document.getElementById('downloadAllBtn') as HTMLButtonElement;
        downloadAllBtn?.addEventListener('click', () => {
            this.handleDownloadAll();
        });
    }

    private handleFilesSelected(files: FileList): void {
        const validFiles = this.fileHandler.validateFiles(files);
        if (validFiles.length === 0) {
            alert('请选择有效的图片文件 (JPEG、PNG、WebP、AVIF)');
            return;
        }

        this.fileHandler.setFiles(validFiles);
        this.uiManager.showSettingsSection();
        this.uiManager.updateFileCount(validFiles.length);
    }

    private async handleCompress(): Promise<void> {
        const files = this.fileHandler.getFiles();
        if (files.length === 0) return;

        const settings = this.uiManager.getCompressionSettings();

        this.uiManager.showProgress();

        try {
            const results = await this.imageCompressor.compressImages(
                files,
                settings,
                (progress: number, current: number, total: number) => {
                    this.uiManager.updateProgress(progress, current, total);
                }
            );

            this.uiManager.hideProgress();

            if (results.length > 0) {
                this.uiManager.showPreviewSection();
                this.uiManager.displayResults(results);
                this.uiManager.showSuccess(`成功压缩 ${results.length} 张图片！`);
            } else {
                this.uiManager.showError('没有图片被成功压缩');
            }

        } catch (error) {
            console.error('压缩失败:', error);
            this.uiManager.showError('压缩过程中出现错误，请重试');
            this.uiManager.hideProgress();
        }
    }

    private handleClear(): void {
        this.fileHandler.clearFiles();
        this.uiManager.hideAllSections();
        this.uiManager.clearResults();
    }

    private async handleDownloadAll(): Promise<void> {
        const results = this.imageCompressor.getLastResults();
        if (results.length === 0) return;

        try {
            await this.fileHandler.downloadAsZip(results);
            this.uiManager.showSuccess('批量下载完成！');
        } catch (error) {
            console.error('下载失败:', error);
            this.uiManager.showError('下载失败，请重试');
        }
    }

    public downloadSingle(index: number): void {
        const results = this.imageCompressor.getLastResults();
        if (index >= 0 && index < results.length) {
            const result = results[index];
            this.fileHandler.downloadSingle(result.compressedBlob, result.originalFile.name);
            this.uiManager.showSuccess('下载完成！');
        }
    }
}

// 全局变量存储应用实例
let appInstance: App;

// 全局函数 - 下载单个文件
(window as any).downloadSingle = (index: number) => {
    if (appInstance) {
        appInstance.downloadSingle(index);
    }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    appInstance = new App();
});

export { App };