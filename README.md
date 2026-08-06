# 日序

一个灰白极简、只保存在本机浏览器里的个人目标与计划工作台。

## 已实现

- 时间计划：每日、每周、每月、近期。
- 分类：论文、校招、运动、AI、剪辑、摄影、板绘、其它；可自行新增、改名、排序和隐藏。
- 事项新增、编辑、完成、恢复和删除。
- 日期/时间排序、过期提示、已完成折叠。
- JSON 导出与安全导入。
- 手机抽屉导航、桌面侧栏和 PWA 离线打开。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

静态网页位于 `dist/client/`。

GitHub Pages 构建：

```bash
npm run build:pages
```

该命令会按仓库名生成 `/Dayfold/` 路径，并为入口页、脚本、样式和图标生成带版本的离线缓存。

## GitHub Pages 部署

- 仓库：`Holly4566/Dayfold`。
- 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动执行锁定依赖安装、漏洞审计、测试、构建和部署。
- GitHub 仓库中进入 `Settings → Pages`，将 `Source` 设为 `GitHub Actions`。
- 部署地址：`https://holly4566.github.io/Dayfold/`。
- 工作流只拥有读取代码和发布 Pages 所需的最小权限，使用的 GitHub 官方 Actions 固定到完整提交哈希。

## 安装到桌面

- Edge：打开网页后，使用地址栏的“安装此站点为应用”。
- Android Chrome：打开网页后，选择菜单中的“添加到主屏幕”或“安装应用”。

## 数据说明

数据只保存在当前浏览器的 localStorage 中，不会自动同步到其它设备。换设备或清理浏览器数据前，请先在“设置 → 数据备份”中导出 JSON。

源代码与 GitHub Pages 页面是公开的，但浏览器中的事项不会随代码上传。不要在事项中保存密码、身份证号码等高度敏感信息。
