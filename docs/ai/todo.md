# AI 漫剧项目开发任务清单

> 基于 [plan.md](./plan.md) 制定的详细执行步骤  
> 更新时间：2026-02-02

---

## 阶段一：数据库与基础设施

### 1.1 数据库 Schema 定义

- [x] 在 `src/config/db/schema.postgres.ts` 中新增 `project` 表定义
  - [x] 添加所有字段：id, userId, name, description, coverImageUrl, aspectRatio, styleId, storyOutline, status, initStatus, initError, createdAt, updatedAt, deletedAt
  - [x] 设置默认值：status='draft'，initStatus='pending'
  - [x] 添加索引：idx_project_user_status, idx_project_created_at
  - [x] 添加外键关联：userId → user.id

- [x] 在 `src/config/db/schema.postgres.ts` 中新增 `character` 表定义
  - [x] 添加所有字段：id, projectId, userId, name, description, imageUrl, imagePrompt, traits(jsonb), status, taskId, taskError, sortOrder, createdAt, updatedAt, deletedAt
  - [x] status 增加 `timeout`
  - [x] 添加索引：idx_character_project, idx_character_user, idx_character_task
  - [x] 添加外键关联：projectId → project.id, userId → user.id

- [x] 在 `src/config/db/schema.postgres.ts` 中新增 `storyboard` 表定义
  - [x] 添加所有字段：id, projectId, userId, sortOrder, description, characterIds(jsonb, 默认[]), imageUrl, imagePrompt, imageStatus, imageTaskId, imageError, videoUrl, videoPrompt, videoStatus, videoTaskId, videoError, createdAt, updatedAt, deletedAt
  - [x] imageStatus / videoStatus 增加 `timeout`
  - [x] 添加索引：idx_storyboard_project, idx_storyboard_user, idx_storyboard_image_task, idx_storyboard_video_task
  - [x] 添加外键关联：projectId → project.id, userId → user.id

- [x] 在 `src/config/db/schema.postgres.ts` 中新增 `generation_task` 表定义
  - [x] 添加所有字段：id, userId, projectId, targetType, targetId, taskId, model, prompt, options(jsonb), status, resultUrl, storedUrl, errorCode, errorMessage, pollCount(not null), lastPolledAt, callbackReceivedAt, callbackData(jsonb), createdAt, updatedAt
  - [x] status 增加 `timeout`，taskId 设为 unique
  - [x] 添加索引：idx_generation_task_status, uniq_generation_task_task_id, idx_generation_task_target, idx_generation_task_project
  - [x] 添加外键关联：userId → user.id, projectId → project.id

- [x] 在 `src/config/db/schema.ts` 中导出新增的表
- [x] 确保引入 `jsonb` / `uniqueIndex` 等字段类型

### 1.2 数据库迁移

- [x] 运行 `pnpm db:generate` 生成迁移文件
- [x] 检查生成的迁移 SQL 是否正确
- [x] 运行 `pnpm db:migrate` 执行迁移
- [x] 验证数据库表结构是否正确创建

### 1.3 Model 层实现

#### 1.3.1 Project Model

- [x] 创建 `src/shared/models/project.ts`
  - [x] 定义 `Project` 类型接口
  - [x] 定义 `NewProject` 类型（创建用）
  - [x] 定义 `UpdateProject` 类型（更新用）
  - [x] 实现 `createProject(data: NewProject)` 函数
  - [x] 实现 `findProjectById(id: string)` 函数
  - [x] 实现 `findProjectsByUserId(userId: string, options?)` 函数
  - [x] 实现 `updateProjectById(id: string, data: UpdateProject)` 函数
  - [x] 实现 `deleteProjectById(id: string)` 函数（软删除）
  - [x] 实现 `countProjectsByUserId(userId: string)` 函数
  - [x] 默认查询应过滤 `deletedAt IS NULL`（可通过参数显式包含已删除）

#### 1.3.2 Character Model

- [x] 创建 `src/shared/models/character.ts`
  - [x] 定义 `Character` 类型接口
  - [x] 定义 `NewCharacter` 类型
  - [x] 定义 `UpdateCharacter` 类型
  - [x] 实现 `createCharacter(data: NewCharacter)` 函数
  - [x] 实现 `createCharacters(data: NewCharacter[])` 函数（批量创建）
  - [x] 实现 `findCharacterById(id: string)` 函数
  - [x] 实现 `findCharactersByProjectId(projectId: string)` 函数
  - [x] 实现 `findCharactersByIds(ids: string[])` 函数
  - [x] 实现 `updateCharacterById(id: string, data: UpdateCharacter)` 函数
  - [x] 实现 `deleteCharacterById(id: string)` 函数
  - [x] 默认查询应过滤 `deletedAt IS NULL`

#### 1.3.3 Storyboard Model

- [x] 创建 `src/shared/models/storyboard.ts`
  - [x] 定义 `Storyboard` 类型接口
  - [x] 定义 `NewStoryboard` 类型
  - [x] 定义 `UpdateStoryboard` 类型
  - [x] 实现 `createStoryboard(data: NewStoryboard)` 函数
  - [x] 实现 `createStoryboards(data: NewStoryboard[])` 函数（批量创建）
  - [x] 实现 `findStoryboardById(id: string)` 函数
  - [x] 实现 `findStoryboardsByProjectId(projectId: string)` 函数
  - [x] 实现 `updateStoryboardById(id: string, data: UpdateStoryboard)` 函数
  - [x] 实现 `deleteStoryboardById(id: string)` 函数
  - [x] 实现 `countStoryboardsByProjectId(projectId: string)` 函数
  - [x] 默认查询应过滤 `deletedAt IS NULL`

#### 1.3.4 Generation Task Model

- [x] 创建 `src/shared/models/generation_task.ts`
  - [x] 定义 `GenerationTask` 类型接口
  - [x] 定义 `NewGenerationTask` 类型
  - [x] 定义 `UpdateGenerationTask` 类型
  - [x] 实现 `createGenerationTask(data: NewGenerationTask)` 函数
  - [x] 实现 `findGenerationTaskById(id: string)` 函数
  - [x] 实现 `findGenerationTaskByTaskId(taskId: string)` 函数
  - [x] 实现 `findPendingGenerationTasks(options)` 函数（用于轮询）
  - [x] 实现 `findGenerationTasksByTargetId(targetType: string, targetId: string)` 函数
  - [x] 实现 `updateGenerationTaskById(id: string, data: UpdateGenerationTask)` 函数

---

## 阶段二：项目管理 API

### 2.1 创建项目 API

- [x] 创建 `src/app/api/project/create/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态 (`getUserInfo()`)
  - [x] 验证请求参数：name（必填）, aspectRatio（必填）, styleId（必填，1-16）
  - [x] 验证 styleId 有效性（检查 `src/shared/styles/index.json`）
  - [x] 生成项目 ID (`getUuid()`)
  - [x] 创建项目记录（设置默认值：status='draft'）
  - [x] 返回项目信息

### 2.2 获取项目列表 API

- [x] 创建 `src/app/api/project/list/route.ts`
  - [x] 实现 GET 请求处理
  - [x] 验证用户登录状态
  - [x] 解析查询参数：page, pageSize, status
  - [x] 查询用户的项目列表（按 createdAt 降序）
  - [x] 过滤已删除的项目（deletedAt IS NULL）
  - [x] 返回分页数据：list, total, page, pageSize

### 2.3 获取项目详情 API

- [x] 创建 `src/app/api/project/info/route.ts`
  - [x] 实现 GET 请求处理
  - [x] 验证用户登录状态
  - [x] 解析查询参数：projectId
  - [x] 查询项目详情
  - [x] 验证项目所有权（userId 匹配）
  - [x] 过滤已删除的项目（deletedAt IS NULL）
  - [x] 返回项目完整信息

### 2.4 更新项目 API

- [x] 创建 `src/app/api/project/update/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证请求参数：projectId（必填）
  - [x] 验证项目存在且属于当前用户
  - [x] 验证项目未被删除（deletedAt IS NULL）
  - [x] 验证可更新字段：name, description, aspectRatio, styleId
  - [x] 更新项目记录
  - [x] 返回更新后的项目信息

### 2.5 删除项目 API

- [x] 创建 `src/app/api/project/delete/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证项目存在且属于当前用户
  - [x] 如果已删除直接返回成功（幂等）
  - [x] 执行软删除（设置 deletedAt）
  - [x] 返回成功响应

---

## 阶段三：角色管理 API

### 3.1 获取角色列表 API

- [x] 创建 `src/app/api/character/list/route.ts`
  - [x] 实现 GET 请求处理
  - [x] 验证用户登录状态
  - [x] 解析查询参数：projectId
  - [x] 验证项目存在且属于当前用户
  - [x] 查询项目的所有角色（按 sortOrder 排序）
  - [x] 返回角色列表

### 3.2 更新角色 API

- [x] 创建 `src/app/api/character/update/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证角色存在且属于当前用户
  - [x] 验证可更新字段：name, description, traits
  - [x] 更新角色记录
  - [x] 返回更新后的角色信息

### 3.3 重新生成角色图片 API

- [x] 创建 `src/app/api/character/regenerate-image/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证角色存在且属于当前用户
  - [x] 获取项目的风格信息
  - [x] 构建角色图片提示词（融合风格）
  - [x] 调用 Kie.AI nano-banana-pro 生成图片
  - [x] 创建 generation_task 记录
  - [x] 更新角色状态为 'generating'，同步更新 character.taskId
  - [x] 返回任务信息

---

## 阶段四：分镜管理 API

### 4.1 获取分镜列表 API

- [x] 创建 `src/app/api/storyboard/list/route.ts`
  - [x] 实现 GET 请求处理
  - [x] 验证用户登录状态
  - [x] 解析查询参数：projectId
  - [x] 验证项目存在且属于当前用户
  - [x] 查询项目的所有分镜（按 sortOrder 排序）
  - [x] 返回分镜列表

### 4.2 更新分镜 API

- [x] 创建 `src/app/api/storyboard/update/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证分镜存在且属于当前用户
  - [x] 验证可更新字段：description, characterIds, imagePrompt, videoPrompt, sortOrder
  - [x] 更新分镜记录
  - [x] 返回更新后的分镜信息

### 4.3 删除分镜 API

- [x] 创建 `src/app/api/storyboard/delete/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证分镜存在且属于当前用户
  - [x] 执行软删除
  - [x] 返回成功响应

---

## 阶段五：AI 集成 - OpenRouter

### 5.1 AI 提示词模板

- [x] 创建 `src/shared/lib/ai-prompts.ts`
  - [x] 实现 `getStoryOutlinePrompt(projectName, projectDescription)` 函数
  - [x] 实现 `getCharacterExtractionPrompt(storyOutline, styleName, stylePrompt)` 函数
  - [x] 实现 `getStoryboardGenerationPrompt(projectName, storyOutline, characters, styleName, stylePrompt, count)` 函数
  - [x] 实现 `getCoverImagePrompt(projectName, styleName, stylePrompt, aspectRatio)` 函数
  - [x] 实现 `getCharacterImagePrompt(characterName, characterTraits, stylePrompt)` 函数

### 5.2 OpenRouter 服务封装

- [x] 创建 `src/shared/services/openrouter.ts`
  - [x] 实现 `callOpenRouter(systemPrompt, userPrompt, options?)` 函数
  - [x] 配置模型：google/gemini-3-flash-preview
  - [x] 处理流式响应
  - [x] 尝试启用 JSON 模式/response_format（若 OpenRouter 支持）
  - [x] 实现 JSON 解析（剥离代码块、容错解析，用于角色提取和分镜生成）
  - [x] 实现错误处理和重试逻辑

### 5.3 故事初始化 API

- [x] 创建 `src/app/api/project/init-story/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证项目存在且属于当前用户
  - [x] 使用条件更新确保幂等（仅当 status='draft' 且 initStatus in ('pending','failed') 才进入）
  - [x] 更新项目状态：status='initializing', initStatus='generating_outline'，清空 initError
  - [x] **Step 1: 生成故事大纲**
    - [x] 调用 OpenRouter 生成故事大纲
    - [x] 保存到 project.storyOutline
    - [x] 更新 initStatus='generating_characters'
  - [x] **Step 2: 提取角色信息**
    - [x] 调用 OpenRouter 提取角色 JSON
    - [x] 解析 JSON，批量创建 character 记录
    - [x] 更新 initStatus='generating_cover'
  - [x] **Step 3: 发起图片生成任务**
    - [x] 构建封面图提示词
    - [x] 调用 Kie.AI 生成封面图，创建 generation_task
    - [x] 为每个角色构建图片提示词
    - [x] 将实际使用的角色提示词写入 character.imagePrompt
    - [x] 调用 Kie.AI 生成角色图，创建 generation_task
  - [x] 返回初始化已开始的响应

### 5.4 查询初始化状态 API

- [x] 创建 `src/app/api/project/init-status/route.ts`
  - [x] 实现 GET 请求处理
  - [x] 验证用户登录状态
  - [x] 查询项目的初始化状态
  - [x] 查询项目的角色列表及其生成状态
  - [x] 计算整体进度（已完成角色数 / 总角色数）
  - [x] 返回 coverStatus + characterProgress（含 failed/timeout 统计）

### 5.5 分镜 AI 生成 API

- [x] 创建 `src/app/api/storyboard/generate/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证项目已初始化完成（status='ready'）
  - [x] 获取项目信息、角色列表、风格信息
  - [x] 调用 OpenRouter 生成分镜 JSON
  - [x] 解析并校验 JSON（过滤无效角色 ID、重排 sortOrder、缺失提示词则报错）
  - [x] 写入最终 imagePrompt / videoPrompt
  - [x] 返回生成的分镜列表

---

## 阶段六：AI 集成 - Kie.AI 图片/视频生成

### 6.1 Kie.AI 服务增强

- [x] 检查现有 `src/extensions/ai/kie.ts` 实现
- [x] 确保 `generateImage` 支持 `image_input` 参数（角色参考图）
- [x] 确保 `generateVideo` 支持图片转视频功能
- [x] 验证 `callBackUrl` 参数正确传递
- [x] 使用 `sora-2-image-to-video`：`image_urls`（仅 1 张）、`aspect_ratio`（portrait|landscape）、`n_frames`（'10'|'15'）
- [x] 统一由回调/轮询上传到 R2，避免 `customStorage` 重复保存

### 6.2 生成分镜图片 API

- [x] 创建 `src/app/api/storyboard/generate-image/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证分镜存在且属于当前用户
  - [x] 若已有 imageTaskId 且任务未完成，直接返回该任务
  - [x] 验证分镜图片状态不是 'generating'
  - [x] 获取分镜的 imagePrompt
  - [x] 获取关联角色的图片 URL 列表
  - [x] 若角色图为空，返回错误提示需先生成角色图（或记录降级策略）
  - [x] 获取项目的 aspectRatio
  - [x] 调用 Kie.AI nano-banana-pro
    - [x] 设置 prompt
    - [x] 设置 image_input（角色参考图）
    - [x] 设置 aspect_ratio
    - [x] 设置 callBackUrl
  - [x] 创建 generation_task 记录
  - [x] 更新分镜：imageStatus='generating', imageTaskId
  - [x] 返回任务信息

### 6.3 生成分镜视频 API

- [x] 创建 `src/app/api/storyboard/generate-video/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 验证用户登录状态
  - [x] 验证分镜存在且属于当前用户
  - [x] 验证分镜图片已生成（imageStatus='ready'）
  - [x] 若已有 videoTaskId 且任务未完成，直接返回该任务
  - [x] 验证分镜视频状态不是 'generating'
  - [x] 获取分镜的 imageUrl 和 videoPrompt
  - [x] 获取项目的 aspectRatio
  - [x] 确保 imageUrl 为公网可访问，格式 jpg/png/webp，大小 ≤10MB（不满足则提示重新生成/转存）
  - [x] 调用 Kie.AI sora-2-image-to-video
    - [x] 设置 prompt（videoPrompt）
    - [x] 设置 image_urls（[imageUrl]）
    - [x] 设置 aspect_ratio（portrait|landscape，按项目画幅映射）
    - [x] 设置 n_frames（'10'|'15'）
    - [x] 设置 callBackUrl
  - [x] 创建 generation_task 记录
  - [x] 更新分镜：videoStatus='generating', videoTaskId
  - [x] 返回任务信息

---

## 阶段七：回调与轮询机制

### 7.1 Kie.AI 图片回调 API

- [x] 创建 `src/app/api/callback/kie/image/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 校验回调密钥（Header 或 Query）
  - [x] 解析回调数据（与 Query Task API 响应结构相同）
  - [x] 根据 taskId 查找 generation_task 记录
  - [x] 验证任务状态不是 'success/failed/timeout'（防止重复处理）
  - [x] 若 state=fail，更新 generation_task 与目标记录状态
  - [x] 解析 resultJson 获取图片 URL
  - [x] 下载图片并上传到 R2
    - [x] cover → `covers/{projectId}/{nanoid}.png`
    - [x] character → `characters/{projectId}/{characterId}_{nanoid}.png`
    - [x] storyboard*image → `storyboards/{projectId}/images/{storyboardId}*{nanoid}.png`
  - [x] 更新 generation_task：status, resultUrl, storedUrl, callbackReceivedAt, callbackData
  - [x] 根据 targetType 更新目标记录：
    - [x] cover → 更新 project.coverImageUrl
    - [x] character → 更新 character.imageUrl, status='ready'
    - [x] storyboard_image → 更新 storyboard.imageUrl, imageStatus='ready'
  - [x] 如果是项目初始化的一部分，检查并更新项目初始化状态
  - [x] 返回成功响应

### 7.2 Kie.AI 视频回调 API

- [x] 创建 `src/app/api/callback/kie/video/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 校验回调密钥（Header 或 Query）
  - [x] 解析回调数据
  - [x] 根据 taskId 查找 generation_task 记录
  - [x] 验证任务状态
  - [x] 若 state=fail，更新 generation_task 与 storyboard.videoStatus
  - [x] 解析 resultJson 获取视频 URL
  - [x] 下载视频并上传到 R2
    - [x] 设置存储路径：`storyboards/{projectId}/videos/{storyboardId}_{nanoid}.mp4`
  - [x] 更新 generation_task
  - [x] 更新 storyboard.videoUrl, videoStatus='ready'
  - [x] 返回成功响应

### 7.3 回调处理工具函数

- [x] 创建 `src/shared/services/callback-handler.ts`
  - [x] 实现 `handleTaskSuccess(task, result)` 函数
  - [x] 实现 `handleTaskTimeout(task)` 函数（更新目标记录状态为 timeout）
  - [x] 实现 `downloadAndUploadToR2(url, options)` 函数
  - [x] 实现 `checkAndUpdateProjectInitStatus(projectId)` 函数
  - [x] 实现 `mapKieStatus(kieStatus)` 函数

### 7.4 任务轮询 API

- [x] 创建 `src/app/api/task/poll/route.ts`
  - [x] 实现 POST 请求处理
  - [x] 查询 pending/processing 状态的任务
    - [x] 条件：lastPolledAt 早于 50 秒前
    - [x] 条件：pollCount < 30
  - [x] 遍历任务，查询 Kie.AI 状态
    - [x] 调用 `provider.query({ taskId, mediaType })`（mediaType 根据 targetType 判断）
  - [x] 更新任务状态：pollCount++, lastPolledAt
  - [x] 如果成功，调用 `handleTaskSuccess()`
  - [x] 如果失败，更新 errorCode, errorMessage
  - [x] pollCount 达上限仍未成功 → 标记任务为 timeout，更新目标记录
  - [x] 返回处理结果统计

### 7.5 Vercel Cron 配置

- [x] 在 `vercel.json` 中添加 Cron Job 配置
  ```json
  {
    "crons": [
      {
        "path": "/api/task/poll",
        "schedule": "*/1 * * * *"
      }
    ]
  }
  ```
- [x] 为 `/api/task/poll` 增加 `CRON_SECRET` 校验（仅 Cron 可触发）
- [x] 验证 Cron Job 正常触发

---

## 阶段八：前端集成

### 8.1 API 客户端封装

- [x] 创建 `src/shared/api/project.ts`
  - [x] 实现 `createProject(data)` 函数
  - [x] 实现 `getProjectList(params?)` 函数
  - [x] 实现 `getProjectInfo(projectId)` 函数
  - [x] 实现 `updateProject(data)` 函数
  - [x] 实现 `deleteProject(projectId)` 函数
  - [x] 实现 `initStory(projectId)` 函数
  - [x] 实现 `getInitStatus(projectId)` 函数

- [x] 创建 `src/shared/api/character.ts`
  - [x] 实现 `getCharacterList(projectId)` 函数
  - [x] 实现 `updateCharacter(data)` 函数
  - [x] 实现 `regenerateCharacterImage(characterId)` 函数

- [x] 创建 `src/shared/api/storyboard.ts`
  - [x] 实现 `getStoryboardList(projectId)` 函数
  - [x] 实现 `generateStoryboards(projectId, count?)` 函数
  - [x] 实现 `generateStoryboardImage(storyboardId)` 函数
  - [x] 实现 `generateStoryboardVideo(storyboardId)` 函数
  - [x] 实现 `updateStoryboard(data)` 函数
  - [x] 实现 `deleteStoryboard(storyboardId)` 函数

### 8.2 项目列表页重构

- [x] 修改 `src/app/[locale]/(landing)/projects/page.tsx`
  - [x] 移除 mock 数据引用
  - [x] 添加 `useEffect` 调用 `getProjectList()`
  - [x] 添加 loading 状态和骨架屏
  - [x] 修改 `handleProjectCreated` 调用真实 API
  - [x] 刷新列表或添加到列表

- [x] 修改 `src/shared/blocks/project/create-project-dialog.tsx`
  - [x] 调用 `createProject()` API
  - [x] 成功后跳转到项目详情页

- [x] 修改 `src/shared/blocks/project/project-card.tsx`
  - [x] 适配真实数据结构
  - [x] 显示封面图（支持空状态）
  - [x] 显示项目状态标签

### 8.3 故事设定页重构

- [x] 修改 `src/shared/blocks/project/project-detail-page.tsx`
  - [x] 移除 mock 数据引用
  - [x] 添加 `useEffect` 调用 `getProjectInfo()`
  - [x] 添加 loading 状态和骨架屏
  - [x] 实现条件渲染：无数据 vs 有数据

- [x] 修改 `src/shared/blocks/project/story-settings.tsx`
  - [x] 添加"一键初始化故事"按钮（当 storyOutline 为空且未在初始化时显示）
  - [x] 实现点击调用 `initStory()` API
  - [x] 实现初始化进度显示
    - [x] 轮询 `getInitStatus()` 获取状态
    - [x] 显示当前阶段：生成大纲、提取角色、生成图片
    - [x] 显示角色图片生成进度（2/5）
    - [x] 显示 coverStatus / timeout 状态
  - [x] 初始化完成后刷新数据
  - [x] 实现封面图卡片、故事大纲卡片、角色列表卡片
  - [x] 角色卡片支持重新生成图片

### 8.4 分镜页重构

- [x] 修改 `src/shared/blocks/project/storyboard-settings.tsx`
  - [x] 移除 mock 数据引用
  - [x] 添加 `useEffect` 调用 `getStoryboardList()`
  - [x] 添加 loading 状态和骨架屏
  - [x] 实现条件渲染：无分镜 vs 有分镜

- [x] 添加"一键生成分镜"按钮
  - [x] 点击调用 `generateStoryboards()` API
  - [x] 成功后刷新分镜列表

- [x] 修改 `src/shared/blocks/project/storyboard-card.tsx`
  - [x] 适配真实数据结构
  - [x] 实现分镜图区域
    - [x] 无图片：显示占位图 + "生成分镜图"按钮
    - [x] 生成中：显示 loading 动画
    - [x] 超时/失败：显示重试按钮
    - [x] 已生成：显示图片
  - [x] 实现分镜视频区域
    - [x] 无图片时：禁用状态
    - [x] 有图片无视频：显示"生成视频"按钮
    - [x] 生成中：显示 loading 动画
    - [x] 超时/失败：显示重试按钮
    - [x] 已生成：显示视频播放器
  - [x] 生成按钮调用对应 API
  - [x] 添加轮询逻辑查询生成状态

### 8.5 骨架屏组件

- [x] 创建 `src/shared/components/skeleton/project-card-skeleton.tsx`
- [x] 创建 `src/shared/components/skeleton/story-settings-skeleton.tsx`
- [x] 创建 `src/shared/components/skeleton/storyboard-card-skeleton.tsx`

### 8.6 状态轮询 Hook

- [x] 创建 `src/shared/hooks/use-poll-status.ts`
  - [x] 实现通用的状态轮询 Hook
  - [x] 支持设置轮询间隔
  - [x] 支持设置停止条件
  - [x] 支持错误处理

---

## 阶段九：测试与调试

### 9.1 API 接口测试

- [x] 测试项目创建 API
- [x] 测试项目列表 API
- [x] 测试项目详情 API
- [x] 测试项目更新 API
- [x] 测试项目删除 API
- [x] 测试角色列表 API
- [x] 测试角色更新 API
- [x] 测试分镜列表 API
- [x] 测试分镜更新 API
- [x] 测试分镜删除 API

### 9.2 AI 生成流程测试

- [x] 测试故事大纲生成（OpenRouter）
- [x] 测试角色提取（OpenRouter）
- [x] 测试封面图生成（Kie.AI）
- [x] 测试角色图生成（Kie.AI）
- [x] 测试分镜 AI 生成（OpenRouter）
- [x] 测试分镜图生成（Kie.AI + 角色参考图）
- [x] 测试分镜视频生成（Kie.AI sora-2-image-to-video）

### 9.3 回调与轮询测试

- [x] 测试 Kie.AI 图片回调
- [x] 测试 Kie.AI 视频回调
- [x] 测试轮询机制
- [x] 测试回调和轮询的去重处理
- [x] 测试超时处理
- [x] 测试 timeout 状态对目标记录的同步

### 9.4 R2 存储测试

- [x] 测试图片上传到 R2
- [x] 测试视频上传到 R2
- [x] 验证存储路径正确
- [x] 验证 URL 可访问

### 9.5 错误处理测试

- [x] 测试 OpenRouter 调用失败处理
- [x] 测试 Kie.AI 任务失败处理
- [x] 测试 R2 上传失败处理
- [x] 测试轮询超时处理
- [x] 测试前端错误状态显示

### 9.6 端到端测试

- [x] 完整流程测试：创建项目 → 初始化故事 → 生成分镜 → 生成图片 → 生成视频
- [x] 测试页面刷新后的状态恢复
- [x] 测试并发生成多个任务
- [x] 测试用户权限隔离

---

## 阶段十：优化与完善

### 10.1 性能优化

- [x] 优化数据库查询（添加必要索引）
- [x] 优化图片加载（使用 Next.js Image 组件）
- [x] 优化列表渲染（虚拟滚动，如有大量数据）
- [x] 添加 API 响应缓存（如适用）

### 10.2 用户体验优化

- [x] 添加 Toast 提示（成功/失败/进行中）
- [x] 优化加载动画
- [x] 添加操作确认弹窗（删除等危险操作）
- [x] 优化移动端适配

### 10.3 错误提示优化

- [x] 统一错误提示文案
- [x] 添加重试按钮
- [x] 显示详细错误信息（开发模式）

### 10.4 代码质量

- [x] 添加 TypeScript 类型定义
- [x] 添加 API 参数校验
- [x] 添加必要的注释
- [x] 代码格式化和 lint 检查（lint 已通过，format:check 仍有大量历史文件未格式化）

### 10.5 文档补充

- [x] 更新 API 文档
- [x] 添加环境变量说明
- [x] 添加部署指南

---

## 环境变量检查清单

- [x] `OPENROUTER_API_KEY` - OpenRouter API 密钥
- [x] `KIE_API_KEY` - Kie.AI API 密钥
- [x] `R2_ACCESS_KEY` - R2 访问密钥
- [x] `R2_SECRET_KEY` - R2 私密密钥
- [x] `R2_BUCKET_NAME` - R2 存储桶名称（ai-animie）
- [x] `R2_ACCOUNT_ID` - Cloudflare 账户 ID
- [x] `R2_DOMAIN` - R2 公开访问域名
- [x] `APP_URL` - 应用 URL（用于回调）
- [x] `KIE_CALLBACK_SECRET` - Kie 回调校验密钥（Header/Query）
- [x] `CRON_SECRET` - 定时任务调用密钥

---

> 任务清单完成于 2026-02-02  
> 预计工作量：8-10 个工作日
