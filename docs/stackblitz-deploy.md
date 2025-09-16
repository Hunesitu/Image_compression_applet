# StackBlitz 部署说明

## 方法1: 直接链接 (推荐)

在 StackBlitz 中打开项目：

```
https://stackblitz.com/github/your-username/image-compressor
```

将 `your-username` 替换为您的 GitHub 用户名。

## 方法2: 手动上传

1. 访问 [StackBlitz.com](https://stackblitz.com)
2. 点击 "Create" > "Import from GitHub"
3. 输入仓库地址或上传项目文件
4. 等待自动安装依赖并启动

## 方法3: Fork 这个项目

1. Fork 这个 GitHub 仓库
2. 在 StackBlitz 中打开你 Fork 的仓库
3. 开始自定义和修改

## 预览链接格式

StackBlitz 部署后的预览链接格式：
```
https://stackblitz.com/edit/image-compressor-[random-id]
```

## 环境要求

- 现代浏览器 (Chrome 88+, Firefox 78+, Safari 14+)
- 支持 ES2020+ 语法
- 支持 Web Workers 和 OffscreenCanvas (可选)

## 注意事项

1. **依赖安装**: StackBlitz 会自动安装 `jszip` 依赖
2. **构建配置**: 使用 Vite 作为构建工具，无需额外配置
3. **类型检查**: TypeScript 配置已优化，支持现代浏览器特性
4. **Web Workers**: 在 StackBlitz 中完全支持，提供最佳性能

## 本地开发转 StackBlitz

如果您在本地开发，可以这样迁移到 StackBlitz：

1. 确保所有文件都已提交到 Git
2. 推送到 GitHub 仓库
3. 使用 GitHub 链接在 StackBlitz 中打开
4. 或者直接复制文件内容到新的 StackBlitz 项目

## 测试建议

在 StackBlitz 中测试以下功能：

- [ ] 文件拖拽上传
- [ ] 图片压缩处理
- [ ] 预览对比显示
- [ ] 单张图片下载
- [ ] 批量ZIP下载
- [ ] 移动端响应式
- [ ] 不同图片格式支持

---

🎉 **完成后**: 您就拥有了一个完全可用的在线图片压缩工具！