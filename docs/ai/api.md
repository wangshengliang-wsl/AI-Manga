# AI 漫剧项目 API 文档

> 更新日期：2026-02-02

## 项目管理

### 创建项目

- POST `/api/project/create`
- 请求体：

```json
{
  "name": "项目名称",
  "description": "项目描述（可选）",
  "aspectRatio": "16:9",
  "styleId": 1
}
```

- 响应：项目详情（包含 id / status / initStatus 等）

### 项目列表

- GET `/api/project/list?page=1&pageSize=20&status=draft`
- 响应：`{ list, total, page, pageSize }`

### 项目详情

- GET `/api/project/info?projectId=...`
- 响应：完整项目字段

### 更新项目

- POST `/api/project/update`
- 请求体：`{ projectId, name?, description?, aspectRatio?, styleId? }`

### 删除项目

- POST `/api/project/delete`
- 请求体：`{ projectId }`

## 初始化故事

### 一键初始化

- POST `/api/project/init-story`
- 请求体：`{ projectId }`
- 说明：仅允许 status=draft 且 initStatus in (pending, failed)

### 查询初始化状态

- GET `/api/project/init-status?projectId=...`
- 响应：包含 initStatus、coverStatus、characterProgress、角色简表等

## 角色管理

### 角色列表

- GET `/api/character/list?projectId=...`

### 更新角色

- POST `/api/character/update`
- 请求体：`{ characterId, name?, description?, traits? }`

### 重新生成角色图

- POST `/api/character/regenerate-image`
- 请求体：`{ characterId, prompt? }`

## 分镜管理

### 分镜列表

- GET `/api/storyboard/list?projectId=...`

### 生成分镜

- POST `/api/storyboard/generate`
- 请求体：`{ projectId, count? }`

### 生成分镜图

- POST `/api/storyboard/generate-image`
- 请求体：`{ storyboardId }`

### 生成分镜视频

- POST `/api/storyboard/generate-video`
- 请求体：`{ storyboardId }`

### 更新分镜

- POST `/api/storyboard/update`
- 请求体：`{ storyboardId, description?, characterIds?, imagePrompt?, videoPrompt?, sortOrder? }`

### 删除分镜

- POST `/api/storyboard/delete`
- 请求体：`{ storyboardId }`

## Kie 回调

### 图片回调

- POST `/api/callback/kie/image`
- 安全：支持 header/query 中的 `KIE_CALLBACK_SECRET`

### 视频回调

- POST `/api/callback/kie/video`

## 任务轮询

### 轮询任务

- POST `/api/task/poll`
- 安全：支持 header/query 中的 `CRON_SECRET`
- 说明：用于 Vercel Cron 或手动触发
