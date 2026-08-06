# 日序 · 开发任务清单

## 文档

- [x] brief
- [x] MVP
- [x] 产品与交互规格
- [x] 开发任务清单

## 脚手架

- [x] 初始化 Product Design Web 原型模板
- [x] 安装依赖与图标库
- [x] 配置 PWA 文件

## 实现

- [x] 页面布局、桌面侧栏、手机抽屉
- [x] Hash 路由与默认每日规则
- [x] 时间计划与分类周期切换
- [x] 事项 CRUD、排序、完成折叠、过期状态
- [x] 裸加号与墨滴展开输入交互
- [x] 分类新增、重命名、排序、隐藏
- [x] JSON 导出、校验导入与安全备份
- [x] 本地持久化与错误恢复

## 验证

- [x] 构建通过
- [x] 功能测试通过
- [x] 桌面视觉 QA 通过
- [x] 手机视觉 QA 通过
- [x] PWA/离线验证通过
- [x] `design-qa.md` 最终结果为 passed
- [x] Git 提交

## GitHub Pages 与安全加固

- [x] Vite 与 PostCSS 更新到已修复版本
- [x] 本地开发服务器限制为 `127.0.0.1`
- [x] `/Dayfold/` 子路径、Manifest 与 Service Worker scope 适配
- [x] GitHub Actions 最小权限与固定提交版本
- [x] 构建阶段生成带版本的完整 PWA 预缓存
- [x] 导航及核心资源缓存优先，忽略无关 `Vary` 请求头
- [x] npm 漏洞审计为 0
- [x] 关闭服务器后的真实离线刷新通过
