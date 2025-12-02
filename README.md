# FocusShield

阻止网页对焦点和全屏状态的入侵检测，提供更加平静的浏览体验。

## 功能特性

- 🛡️ **焦点检测拦截器**：阻止网页检测窗口失焦、鼠标离开等事件
- 🖥️ **全屏检测拦截器**：屏蔽网页对全屏模式状态的检测
- ⚙️ **可配置管理**：使用React构建的现代化配置中心，精确控制拦截器的启用网站
- 🚀 **快速切换**：便捷的弹出框界面，一键为当前网站启用/禁用功能

## 安装说明

### 1. 克隆项目

```bash
git clone <repository-url>
cd FocusShield
```

### 2. 安装依赖

```bash
npm install
```

### 3. 构建项目

```bash
npm run build
```

构建完成后，会在 `dist` 目录生成编译后的文件。

### 4. 加载到Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `FocusShield` 项目根目录

## 使用方法

### 方法一：使用弹出框快速添加

1. 访问需要启用拦截器的网站
2. 点击浏览器工具栏中的 FocusShield 图标
3. 在弹出框中开启所需的拦截器
4. 页面将自动刷新以应用更改

### 方法二：在配置中心管理

1. 右键点击 FocusShield 图标，选择"选项"
2. 或者在弹出框中点击"打开配置中心"
3. 选择要配置的拦截器标签页
4. 输入网址并添加到列表中

### 网址格式说明

- **简单格式**：`example.com` (自动转换为 `*://*.example.com/*`)
- **精确格式**：`https://example.com/*`
- **通配符格式**：`*://example.com/*`

## 开发说明

### 项目结构

```
FocusShield/
├── background.js              # 后台服务工作者，负责动态注入脚本
├── manifest.json              # 扩展配置文件
├── common/                    # 拦截器脚本
│   ├── focus-detection-blocker.js      # 焦点检测拦截器
│   └── forbid-fullscreen-dection.js    # 全屏检测拦截器
├── src/                       # React + TypeScript 源代码
│   ├── options.tsx            # 配置中心页面
│   ├── options.css            # 配置中心样式
│   ├── popup.tsx              # 弹出框页面
│   ├── popup.css              # 弹出框样式
│   ├── config.ts              # 配置管理工具
│   └── types.ts               # TypeScript 类型定义
├── options.html               # 配置中心HTML（源文件）
├── popup.html                 # 弹出框HTML（源文件）
├── dist/                      # 构建输出目录
├── package.json               # NPM配置
├── tsconfig.json              # TypeScript 配置
└── vite.config.ts             # Vite 配置
```

### 开发模式

运行以下命令启动开发模式，文件修改时会自动重新构建：

```bash
npm run dev
```

### 技术栈

- React 18
- TypeScript 5
- Vite 5
- Chrome Extension Manifest V3
- Chrome Storage API
- Chrome Scripting API

## 工作原理

### 动态脚本注入

FocusShield 使用 Manifest V3 的 Chrome Scripting API 实现动态脚本注入：

1. 用户在配置中心或弹出框中添加网站
2. 配置保存到 Chrome Storage
3. 后台服务监听标签页更新事件
4. 根据当前网站URL匹配配置
5. 动态注入对应的拦截器脚本

### 拦截机制

#### 焦点检测拦截器

- 拦截 `window.onblur` 和 `window.onfocus` 属性赋值
- 阻止 `blur`、`focus` 事件监听器的添加
- 拦截 `visibilitychange`、`mouseleave` 等相关事件
- 强制 `document.hasFocus()` 返回 `true`
- 强制 `document.hidden` 返回 `false`
- 强制 `document.visibilityState` 返回 `'visible'`

#### 全屏检测拦截器

- 拦截 `document.fullscreenElement` 返回 `null`
- 阻止 `fullscreenchange` 事件监听器的添加
- 支持所有浏览器前缀（webkit、moz、MS）
- 不影响全屏功能的正常使用

## 注意事项

1. 启用或禁用拦截器后需要刷新页面
2. 某些网站可能使用多种检测方式，如遇问题请反馈
3. 在特殊页面（如 chrome:// 协议）无法注入脚本

## License

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
