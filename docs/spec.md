# 日序 · 产品与交互规格

## 路由

- `#/daily`、`#/weekly`、`#/monthly`、`#/recent`：全局时间计划。
- `#/category/{id}/daily|weekly|monthly|recent`：分类清单。
- `#/settings`：设置。
- 首次加载、刷新或非法路由统一重定向到 `#/daily`。

## 数据模型

```text
AppData v1
  categories[]: id, name, hidden, order
  tasks[]: id, scopeType(global|category), categoryId?, period,
           title, date, time?, completed, createdAt, updatedAt
```

- localStorage 主键：`rizu.app.v1`。
- 备份文件包含 `schemaVersion`、`exportedAt` 和完整 `data`。
- 导入仅接受已知版本、结构正确的数据；成功导入前先自动下载当前数据备份。

## 清单规则

- 四个周期是手动归类的独立数据集，日期变化不会自动移动周期。
- 未完成排序：日期升序；同日期先有时间且按时间升序，再排无时间。
- 已完成单独置底，默认折叠；折叠状态不持久化。
- 当 `date < 今天` 且未完成时，日期使用低饱和红色。

## 新增交互

- 顶部默认只显示细线加号，不显示按钮底色和边框。
- 点击后，以加号为圆心出现约 36px 墨滴圆形扩散：220ms、ease-out、透明度 0.14 到 0。
- 40ms 后输入行在原位置横向淡入展开：240ms、ease-out。
- 输入行固定高度，避免下方事项产生垂直跳动。
- 标题占主要宽度，日期必填，时间可选；Enter 保存，Esc 取消。
- `prefers-reduced-motion` 下移除墨滴动画，仅保留短淡入。

## 编辑与删除

- 点击事项正文或编辑图标进入原位编辑。
- 保存时校验标题和日期；失败时显示行内提示并聚焦错误字段。
- 删除必须二次确认；取消不会改变数据。

## 响应式

- 桌面：固定左侧栏，右侧内容宽度克制，保持大片留白。
- 手机：侧栏变为抽屉，顶部汉堡按钮打开完整导航；周期切换仍为顶部文字标签。
- 触控目标至少 40px，输入控件字号不小于 16px，避免移动端自动缩放。

## 视觉令牌

- `--paper: #ffffff`
- `--sidebar: #f5f6f7`
- `--ink: #202327`
- `--ink-2: #30343a`
- `--muted: #747a80`
- `--line: #d9dde0`
- `--danger: #a34a4a`
- 主要圆角 2–4px，阴影仅用于移动抽屉和确认对话框。

## 可访问性

- 使用语义按钮、表单标签、清晰焦点态和 ARIA 状态。
- 不只依赖颜色传达完成状态。
- 尊重系统减少动画设置。

## GitHub Pages 与 PWA

- GitHub Pages 项目路径固定为 `/Dayfold/`；入口、清单、图标和 Service Worker 均从 Vite `BASE_URL` 或相对 scope 推导。
- Manifest 使用相对 `id`、`start_url`、`scope` 和图标路径，确保安装范围不会越过 `/Dayfold/`。
- 构建阶段将哈希后的 JS/CSS 注入 Service Worker 预缓存清单。
- 导航、入口、JS、CSS、Manifest 和图标采用缓存优先；其它同源请求采用网络优先并回退缓存。
- 缓存版本由完整静态构建和 Service Worker 内容共同生成，只清理当前 Dayfold scope 的旧缓存。
- GitHub Actions 仅授予 `contents: read`、`pages: write`、`id-token: write`，官方 Actions 固定到完整提交哈希。
- 验收必须覆盖：联网安装、Service Worker 接管、完全关闭服务器、离线刷新仍渲染每日界面。
