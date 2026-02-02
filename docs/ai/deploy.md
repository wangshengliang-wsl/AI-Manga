# 部署指南（AI 漫剧）

> 更新日期：2026-02-02

## 1. 配置环境变量
按 `docs/ai/env.md` 中的清单在部署平台配置必要环境变量。

## 2. 数据库迁移
- 新环境：直接执行 `pnpm db:migrate`
- 旧环境：若已有表结构，请先做好基线策略（或导入已有 schema），避免重复创建表

## 3. 回调与轮询
- 确保 `APP_URL` 可公网访问
- Kie 回调地址：`{APP_URL}/api/callback/kie/image` 与 `.../video`
- Vercel Cron 配置已在 `vercel.json` 中设置 `/api/task/poll` 每分钟执行一次
- 为 `/api/task/poll` 设置 `CRON_SECRET`，并在调用时传入 header 或 query

## 4. 存储检查
- 确保 R2 Bucket 已创建
- 配置 `R2_DOMAIN` 以获得公网 URL（推荐）

## 5. 验证流程
1) 创建项目
2) 初始化故事（生成大纲/角色/封面）
3) 生成分镜、分镜图、分镜视频
4) 验证回调与轮询状态同步
