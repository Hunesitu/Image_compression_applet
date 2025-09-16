import { CompressionSettings, CompressionResult } from '../types';
import { FileHandler } from './fileHandler';

export class UIManager {
    private fileHandler: FileHandler;

    constructor() {
        this.fileHandler = new FileHandler();
    }

    public hideAllSections(): void {
        const sections = ['settingsSection', 'previewSection'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
    }

    public showSettingsSection(): void {
        const section = document.getElementById('settingsSection');
        if (section) {
            section.style.display = 'block';
        }
    }

    public showPreviewSection(): void {
        const section = document.getElementById('previewSection');
        if (section) {
            section.style.display = 'block';
        }
    }

    public showProgress(): void {
        const overlay = document.getElementById('progressOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    public hideProgress(): void {
        const overlay = document.getElementById('progressOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    public updateProgress(progress: number, current: number, total: number): void {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${current}/${total}`;
        }
    }

    public getCompressionSettings(): CompressionSettings {
        const qualitySlider = document.getElementById('qualitySlider') as HTMLInputElement;
        const maxWidthInput = document.getElementById('maxWidth') as HTMLInputElement;
        const maxHeightInput = document.getElementById('maxHeight') as HTMLInputElement;

        return {
            quality: parseFloat(qualitySlider?.value || '0.8'),
            maxWidth: parseInt(maxWidthInput?.value || '2000'),
            maxHeight: parseInt(maxHeightInput?.value || '2000')
        };
    }

    public updateFileCount(count: number): void {
        const uploadText = document.querySelector('.upload-text');
        if (uploadText) {
            uploadText.textContent = `已选择 ${count} 个文件`;
        }
    }

    public displayResults(results: CompressionResult[]): void {
        const previewGrid = document.getElementById('previewGrid');
        if (!previewGrid) return;

        // 清空现有内容
        previewGrid.innerHTML = '';

        results.forEach((result, index) => {
            const card = this.createPreviewCard(result, index);
            previewGrid.appendChild(card);
        });
    }

    private createPreviewCard(result: CompressionResult, index: number): HTMLElement {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.innerHTML = `
            <div class="preview-images">
                <div class="image-container">
                    <div class="image-label">原图</div>
                    <img src="${result.originalUrl}" alt="原图" loading="lazy">
                </div>
                <div class="image-container">
                    <div class="image-label">压缩后</div>
                    <img src="${result.compressedUrl}" alt="压缩后" loading="lazy">
                </div>
            </div>
            <div class="file-info">
                <div><strong>文件名:</strong> <span>${result.originalInfo.name}</span></div>
                <div><strong>原始尺寸:</strong> <span>${result.originalInfo.width} × ${result.originalInfo.height}</span></div>
                <div><strong>压缩后尺寸:</strong> <span>${result.compressedInfo.width} × ${result.compressedInfo.height}</span></div>
                <div><strong>原始大小:</strong> <span>${this.fileHandler.formatFileSize(result.originalInfo.size)}</span></div>
                <div><strong>压缩后大小:</strong> <span>${this.fileHandler.formatFileSize(result.compressedInfo.size)}</span></div>
                <div><strong>压缩率:</strong> <span class="compression-ratio">${result.compressionRatio}%</span></div>
            </div>
            <button class="download-single" onclick="downloadSingle(${index})">
                💾 下载此图片
            </button>
        `;

        return card;
    }

    public clearResults(): void {
        const previewGrid = document.getElementById('previewGrid');
        if (previewGrid) {
            previewGrid.innerHTML = '';
        }

        const uploadText = document.querySelector('.upload-text');
        if (uploadText) {
            uploadText.textContent = '拖拽图片到此处或点击选择';
        }
    }

    public showError(message: string): void {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;

        document.body.appendChild(errorDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    public showSuccess(message: string): void {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        successDiv.textContent = message;

        document.body.appendChild(successDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    public addGlobalStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .error-message,
            .success-message {
                animation: slideIn 0.3s ease;
            }

            .image-container img {
                transition: transform 0.3s ease;
            }

            .image-container img:hover {
                transform: scale(1.05);
            }

            .preview-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .preview-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .download-single {
                transition: all 0.3s ease;
            }

            .download-single:hover {
                background: #4f46e5 !important;
                transform: translateY(-2px);
            }

            /* 加载状态样式 */
            .loading {
                position: relative;
                overflow: hidden;
            }

            .loading::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                animation: loading 1.5s infinite;
            }

            @keyframes loading {
                0% {
                    left: -100%;
                }
                100% {
                    left: 100%;
                }
            }

            /* 响应式图片网格 */
            @media (max-width: 600px) {
                .preview-images {
                    grid-template-columns: 1fr !important;
                    gap: 0.5rem !important;
                }

                .image-container img {
                    max-height: 120px !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    public init(): void {
        this.addGlobalStyles();
        this.setupResponsiveDesign();
    }

    private setupResponsiveDesign(): void {
        // 处理移动端视口
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }

        // 添加触摸友好的交互
        document.addEventListener('touchstart', function() {}, { passive: true });
    }
}