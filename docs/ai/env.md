# 环境变量说明

> 更新日期：2026-02-02

以下变量用于 AI 漫剧功能，建议配置在 `.env.production` 或部署平台的环境变量中。

## AI 与存储
- `OPENROUTER_API_KEY`：OpenRouter API Key
- `KIE_API_KEY`：Kie.AI API Key
- `KIE_CALLBACK_SECRET`：Kie 回调校验密钥（Header/Query）

## R2 存储
- `R2_ACCESS_KEY`：R2 Access Key
- `R2_SECRET_KEY`：R2 Secret Key
- `R2_BUCKET_NAME`：R2 Bucket 名称（默认 ai-animie）
- `R2_ACCOUNT_ID`：Cloudflare Account ID
- `R2_DOMAIN`：R2 公网访问域名（可选，若不设置则使用默认 endpoint）

## 应用与回调
- `APP_URL`：应用域名（回调地址拼接使用）
- `CRON_SECRET`：定时轮询接口密钥（仅 Cron 可触发）

## 参考
- 本地开发可参考 `.env.development`，生产环境建议在部署平台中配置。
