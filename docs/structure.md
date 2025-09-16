# 项目结构说明

```
image-compressor/
├── index.html              # 主页面
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── README.md               # 项目说明
├── src/                    # 源代码目录
│   ├── main.ts             # 应用入口
│   ├── types/              # 类型定义
│   │   └── index.ts
│   ├── modules/            # 功能模块
│   │   ├── imageCompressor.ts    # 图片压缩核心
│   │   ├── fileHandler.ts        # 文件处理
│   │   ├── uiManager.ts          # UI管理
│   │   └── workerManager.ts      # Web Worker管理
│   ├── workers/            # Web Worker
│   │   └── imageWorker.ts        # 图片压缩Worker
│   └── styles/             # 样式文件
│       └── main.css
└── dist/                   # 构建输出 (自动生成)
```

## 核心模块说明

### ImageCompressor (图片压缩核心)
- 负责图片压缩算法实现
- 支持多种图片格式
- EXIF数据处理和图片旋转
- 集成Web Worker优化

### FileHandler (文件处理)
- 文件选择和拖拽上传
- 文件验证和格式检查
- ZIP打包和下载功能
- 文件信息获取

### UIManager (界面管理)
- 用户界面状态管理
- 进度显示和用户反馈
- 预览组件渲染
- 响应式设计支持

### WorkerManager (Worker管理)
- Web Worker生命周期管理
- 大图片异步处理
- 浏览器兼容性检测
- 主线程备用方案

## 技术特点

1. **模块化设计** - 职责分离，易于维护
2. **类型安全** - TypeScript确保代码质量
3. **性能优化** - Web Worker防止UI阻塞
4. **兼容性** - 渐进增强，向下兼容
5. **用户体验** - 实时预览，进度反馈