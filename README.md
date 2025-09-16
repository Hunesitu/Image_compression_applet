# 图片压缩工具 🖼️

一个纯前端的图片压缩工具，支持多种格式的图片压缩、批量处理、预览对比和一键下载。

## ✨ 特性

- 🔒 **纯前端处理** - 数据不上传，保护隐私
- 📁 **多格式支持** - JPEG、PNG、WebP、AVIF
- 🎛️ **灵活配置** - 质量调节、尺寸限制
- 🖱️ **拖拽上传** - 支持拖拽和点击选择
- 👀 **预览对比** - 压缩前后效果对比
- 📊 **详细统计** - 压缩率、文件大小对比
- 📦 **批量下载** - 单张下载或打包ZIP
- 🔄 **EXIF处理** - 自动处理图片旋转
- ⚡ **性能优化** - Web Worker处理大图
- 📱 **响应式设计** - 适配移动端

## 🚀 快速开始

### 在线使用

直接在 StackBlitz 中打开：
[![在 StackBlitz 中打开](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/your-username/image-compressor)

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/your-username/image-compressor.git
cd image-compressor
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 🎯 使用方法

1. **选择图片** - 拖拽图片到上传区域或点击选择
2. **调整设置** - 设置压缩质量和最大尺寸
3. **开始压缩** - 点击压缩按钮开始处理
4. **预览对比** - 查看压缩前后的效果
5. **下载结果** - 单张下载或批量打包

## 🛠️ 技术栈

- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Canvas API** - 图片处理和压缩
- **Web Workers** - 大图片非阻塞处理
- **JSZip** - ZIP 文件生成
- **原生 ES Modules** - 现代模块系统

## 🔧 压缩算法

- **质量压缩** - 调整图片质量参数
- **尺寸缩放** - 等比例缩放到指定尺寸
- **格式转换** - 支持格式间转换
- **EXIF 处理** - 自动修正图片旋转

## 📱 浏览器支持

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- 移动端浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [项目主页](https://github.com/your-username/image-compressor)
- [在线演示](https://stackblitz.com/github/your-username/image-compressor)
- [技术文档](./docs/)

---

💡 **提示**: 本工具完全在浏览器中运行，不会上传任何数据到服务器，确保您的图片隐私安全。