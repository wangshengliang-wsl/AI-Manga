# AI 漫剧项目后端开发方案

> 版本：v1.0  
> 更新时间：2026-02-02  
> 状态：待开发

---

## 一、项目概述

### 1.1 项目背景

本项目是一个 AI 驱动的漫剧创作平台，用户可以通过 AI 辅助完成从故事构思、角色设计到分镜制作的全流程。

### 1.2 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 15 + React 19 |
| 后端框架 | Next.js API Routes |
| 数据库 | PostgreSQL (Drizzle ORM) |
| AI 文本生成 | OpenRouter (google/gemini-3-flash-preview) |
| AI 图片生成 | Kie.AI (nano-banana-pro) |
| AI 视频生成 | Kie.AI (sora-2-image-to-video) |
| 对象存储 | Cloudflare R2 (bucket: ai-animie) |

### 1.3 现有基础设施

项目已实现以下核心能力（可直接复用）：

- **Kie.AI Provider**: `src/extensions/ai/kie.ts`
- **R2 存储服务**: `src/extensions/storage/r2.ts`
- **AI 服务管理**: `src/shared/services/ai.ts`
- **存储服务管理**: `src/shared/services/storage.ts`
- **风格数据**: `src/shared/styles/index.json` (16种风格)

---

## 二、数据库设计

### 2.1 新增数据表

需要在 `src/config/db/schema.postgres.ts` 中新增以下表结构：

#### 2.1.1 项目表 (project)

```typescript
export const project = table(
  'project',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),                          // 项目名称
    description: text('description'),                       // 项目描述
    coverImageUrl: text('cover_image_url'),                // 封面图 URL
    aspectRatio: text('aspect_ratio').notNull().default('16:9'), // 画幅比例: 16:9 | 9:16
    styleId: integer('style_id').notNull().default(1),     // 风格 ID (对应 styles/index.json)
    storyOutline: text('story_outline'),                   // 故事大纲 (AI 生成)
    status: text('status').notNull().default('draft'),     // 状态: draft | initializing | ready | archived
    initStatus: text('init_status').notNull().default('pending'), // 初始化状态: pending | generating_outline | generating_characters | generating_cover | completed | failed
    initError: text('init_error'),                         // 初始化错误信息
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_project_user_status').on(table.userId, table.status),
    index('idx_project_created_at').on(table.createdAt),
  ]
);
```

#### 2.1.2 角色表 (character)

```typescript
export const character = table(
  'character',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),                          // 角色名称
    description: text('description'),                       // 角色描述
    imageUrl: text('image_url'),                           // 角色图片 URL (R2)
    imagePrompt: text('image_prompt'),                     // 角色图片生成提示词
    traits: jsonb('traits'),                               // 角色特征 (JSON)
    status: text('status').notNull().default('pending'),   // 状态: pending | generating | ready | failed | timeout
    taskId: text('task_id'),                               // Kie.AI 任务 ID
    taskError: text('task_error'),                         // 任务错误信息
    sortOrder: integer('sort_order').default(0).notNull(), // 排序顺序
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_character_project').on(table.projectId),
    index('idx_character_user').on(table.userId),
    index('idx_character_task').on(table.taskId),
  ]
);
```

#### 2.1.3 分镜表 (storyboard)

```typescript
export const storyboard = table(
  'storyboard',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(), // 分镜顺序
    description: text('description'),                       // 分镜描述 (包含角色、对话、景别、场景)
    characterIds: jsonb('character_ids'),                  // 关联角色 ID 列表 (JSON Array, 默认 [])
    
    // 分镜图相关
    imageUrl: text('image_url'),                           // 分镜图 URL (R2)
    imagePrompt: text('image_prompt'),                     // 分镜图生成提示词
    imageStatus: text('image_status').default('pending'),  // 图片状态: pending | generating | ready | failed | timeout
    imageTaskId: text('image_task_id'),                    // 图片生成任务 ID
    imageError: text('image_error'),                       // 图片生成错误信息
    
    // 分镜视频相关
    videoUrl: text('video_url'),                           // 分镜视频 URL (R2)
    videoPrompt: text('video_prompt'),                     // 运镜视频提示词
    videoStatus: text('video_status').default('pending'),  // 视频状态: pending | generating | ready | failed | timeout
    videoTaskId: text('video_task_id'),                    // 视频生成任务 ID
    videoError: text('video_error'),                       // 视频生成错误信息
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_storyboard_project').on(table.projectId, table.sortOrder),
    index('idx_storyboard_user').on(table.userId),
    index('idx_storyboard_image_task').on(table.imageTaskId),
    index('idx_storyboard_video_task').on(table.videoTaskId),
  ]
);
```

#### 2.1.4 生成任务表 (generation_task)

用于追踪所有 Kie.AI 生成任务的状态，支持回调和轮询双机制。

```typescript
export const generationTask = table(
  'generation_task',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .references(() => project.id, { onDelete: 'cascade' }),
    
    // 任务关联
    targetType: text('target_type').notNull(),             // 目标类型: cover | character | storyboard_image | storyboard_video
    targetId: text('target_id').notNull(),                 // 目标 ID (character.id 或 storyboard.id 或 project.id)
    
    // Kie.AI 任务信息
    taskId: text('task_id').notNull().unique(),            // Kie.AI 任务 ID
    model: text('model').notNull(),                        // 使用的模型: nano-banana-pro | sora-2-image-to-video
    prompt: text('prompt').notNull(),                      // 生成提示词
    options: jsonb('options'),                             // 其他参数 (JSON)
    
    // 状态追踪
    status: text('status').notNull().default('pending'),   // 状态: pending | processing | success | failed | timeout
    resultUrl: text('result_url'),                         // Kie.AI 返回的原始 URL
    storedUrl: text('stored_url'),                         // 保存到 R2 后的 URL
    errorCode: text('error_code'),                         // 错误代码
    errorMessage: text('error_message'),                   // 错误信息
    
    // 轮询追踪
    pollCount: integer('poll_count').notNull().default(0), // 轮询次数
    lastPolledAt: timestamp('last_polled_at'),             // 最后轮询时间
    
    // 回调追踪
    callbackReceivedAt: timestamp('callback_received_at'), // 回调接收时间
    callbackData: jsonb('callback_data'),                  // 回调原始数据 (JSON)
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_generation_task_status').on(table.status),
    uniqueIndex('uniq_generation_task_task_id').on(table.taskId),
    index('idx_generation_task_target').on(table.targetType, table.targetId),
    index('idx_generation_task_project').on(table.projectId),
  ]
);
```

### 2.2 表关系图

```
┌─────────────────┐
│      user       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐      1:N     ┌─────────────────┐
│     project     │──────────────▶│    character    │
└────────┬────────┘              └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   storyboard    │──────────────▶ characterIds (JSON Array)
└─────────────────┘

┌─────────────────┐
│ generation_task │ ◀──── 关联 project/character/storyboard
└─────────────────┘
```

---

## 三、API 接口设计

### 3.1 项目管理 API

#### 3.1.1 创建项目

- **路径**: `POST /api/project/create`
- **描述**: 创建新项目，设置基本信息
- **请求体**:

```typescript
interface CreateProjectRequest {
  name: string;           // 项目名称 (必填)
  description?: string;   // 项目描述
  aspectRatio: '16:9' | '9:16';  // 画幅比例 (必填)
  styleId: number;        // 风格 ID (必填, 1-16)
}
```

- **响应**:

```typescript
interface CreateProjectResponse {
  code: number;
  data: {
    id: string;
    name: string;
    description: string | null;
    coverImageUrl: string | null;  // 默认 null
    aspectRatio: string;
    styleId: number;
    storyOutline: string | null;   // 默认 null
    status: 'draft';
    createdAt: string;
    updatedAt: string;
  };
}
```

- **业务逻辑**:
  1. 验证用户登录状态
  2. 验证 styleId 有效性 (1-16)
  3. 创建项目记录，设置默认值
  4. 返回项目信息

#### 3.1.2 获取项目列表

- **路径**: `GET /api/project/list`
- **描述**: 获取当前用户的所有项目
- **查询参数**:

```typescript
interface ListProjectsQuery {
  page?: number;      // 页码，默认 1
  pageSize?: number;  // 每页数量，默认 20
  status?: string;    // 状态过滤
}
```

- **响应**:

```typescript
interface ListProjectsResponse {
  code: number;
  data: {
    list: Project[];
    total: number;
    page: number;
    pageSize: number;
  };
}
```

#### 3.1.3 获取项目详情

- **路径**: `GET /api/project/info`
- **描述**: 获取项目基本信息
- **查询参数**: `projectId: string`
- **响应**: 项目完整信息，包含所有字段

#### 3.1.4 更新项目

- **路径**: `POST /api/project/update`
- **描述**: 更新项目基本信息
- **请求体**:

```typescript
interface UpdateProjectRequest {
  projectId: string;
  name?: string;
  description?: string;
  aspectRatio?: '16:9' | '9:16';
  styleId?: number;
}
```

#### 3.1.5 删除项目

- **路径**: `POST /api/project/delete`
- **描述**: 软删除项目
- **请求体**: `{ projectId: string }`

---

### 3.2 故事初始化 API

#### 3.2.1 一键初始化故事

- **路径**: `POST /api/project/init-story`
- **描述**: AI 生成故事大纲、角色和封面图
- **请求体**: `{ projectId: string }`
- **响应**: `{ code: number, data: { message: string } }`

**补充要求**:
- 使用条件更新/事务，只有 `status='draft'` 且 `initStatus in ('pending','failed')` 才允许进入初始化；否则直接返回当前状态，避免重复初始化与并发创建任务
- 进入流程前清空 `initError`，并记录本次初始化开始时间（可选字段）

**后端处理流程**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    一键初始化故事流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 更新项目状态                                                  │
│     └── status: 'initializing'                                  │
│     └── initStatus: 'generating_outline'                        │
│                                                                 │
│  2. 调用 OpenRouter 生成故事大纲                                   │
│     ├── 模型: google/gemini-3-flash-preview                     │
│     ├── 输入: 项目名称 + 项目描述                                  │
│     ├── 输出: 完整故事大纲 (包含人物姓名)                           │
│     └── 保存: project.storyOutline                              │
│                                                                 │
│  3. 更新状态: initStatus: 'generating_characters'                │
│                                                                 │
│  4. 调用 OpenRouter 抽取角色信息                                   │
│     ├── 模型: google/gemini-3-flash-preview                     │
│     ├── 输入: 故事大纲 + 风格信息                                  │
│     ├── 输出: 角色列表 JSON                                       │
│     │   └── [{ name, description, traits, imagePrompt }]        │
│     └── 保存: 批量创建 character 记录 (含 imagePrompt)             │
│                                                                 │
│  5. 并行发起图片生成任务                                           │
│     ├── 更新状态: initStatus: 'generating_cover'                 │
│     ├── 记录本次实际使用的封面/角色提示词                          │
│     ├── 创建封面图生成任务 (Kie.AI nano-banana-pro)               │
│     │   └── 创建 generation_task 记录                            │
│     └── 创建所有角色图生成任务 (Kie.AI nano-banana-pro)            │
│         └── 为每个角色创建 generation_task 记录                    │
│                                                                 │
│  6. 等待所有图片生成完成                                           │
│     ├── 方式 1: Kie.AI 回调通知                                   │
│     └── 方式 2: 后端轮询查询                                       │
│                                                                 │
│  7. 图片生成完成后                                                 │
│     ├── 下载图片到 R2 (bucket: ai-animie)                        │
│     ├── 更新 project.coverImageUrl                               │
│     ├── 更新 character.imageUrl                                  │
│     └── 更新状态: initStatus: 'completed', status: 'ready'       │
│                                                                 │
│  8. 如有失败/超时                                                 │
│     └── 更新状态: initStatus: 'failed', status: 'draft'          │
│     └── 记录 initError: 错误信息                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 查询初始化状态

- **路径**: `GET /api/project/init-status`
- **描述**: 查询项目初始化进度
- **查询参数**: `projectId: string`
- **响应**:

```typescript
interface InitStatusResponse {
  code: number;
  data: {
    status: string;           // draft | initializing | ready
    initStatus: string;       // pending | generating_outline | generating_characters | generating_cover | completed | failed
    initError: string | null;
    storyOutline: string | null;
    coverImageUrl: string | null;
    coverStatus: string;      // pending | generating | ready | failed | timeout
    characterProgress: {
      total: number;
      ready: number;
      failed: number;
      timeout: number;
    };
    characters: {
      id: string;
      name: string;
      status: string;
      imageUrl: string | null;
    }[];
  };
}
```

---

### 3.3 角色管理 API

#### 3.3.1 获取项目角色列表

- **路径**: `GET /api/character/list`
- **描述**: 获取项目的所有角色
- **查询参数**: `projectId: string`
- **响应**:

```typescript
interface ListCharactersResponse {
  code: number;
  data: Character[];
}
```

#### 3.3.2 更新角色信息

- **路径**: `POST /api/character/update`
- **描述**: 更新角色信息
- **请求体**:

```typescript
interface UpdateCharacterRequest {
  characterId: string;
  name?: string;
  description?: string;
  traits?: object;
}
```

#### 3.3.3 重新生成角色图片

- **路径**: `POST /api/character/regenerate-image`
- **描述**: 重新生成角色图片
- **请求体**: `{ characterId: string, prompt?: string }`

---

### 3.4 分镜管理 API

#### 3.4.1 获取项目分镜列表

- **路径**: `GET /api/storyboard/list`
- **描述**: 获取项目的所有分镜
- **查询参数**: `projectId: string`
- **响应**:

```typescript
interface ListStoryboardsResponse {
  code: number;
  data: Storyboard[];
}
```

#### 3.4.2 一键生成分镜

- **路径**: `POST /api/storyboard/generate`
- **描述**: AI 生成分镜列表
- **请求体**:

```typescript
interface GenerateStoryboardRequest {
  projectId: string;
  count?: number;  // 生成数量，默认 5
}
```

**后端处理流程**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    一键生成分镜流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 获取项目信息                                                  │
│     ├── 项目名称、故事大纲                                        │
│     ├── 所有角色信息 (含图片 URL)                                 │
│     └── 风格信息                                                 │
│                                                                 │
│  2. 调用 OpenRouter 生成分镜                                      │
│     ├── 模型: google/gemini-3-flash-preview                     │
│     ├── 输入: 项目信息 + 角色列表 + 风格                          │
│     ├── 输出: 分镜列表 JSON (详见下方数据结构)                     │
│     └── 保存: 批量创建 storyboard 记录                            │
│                                                                 │
│  3. 返回分镜列表                                                  │
│     └── 此时分镜只有文本和提示词，无图片/视频                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**校验与清洗**:
- 仅允许使用提供的角色 ID，过滤无效/重复 ID
- sortOrder 统一重排为 1..N，避免重复/跳号
- 若 imagePrompt / videoPrompt 缺失则返回错误（提示重试），避免入库脏数据
- 将“最终用于生成”的提示词写回 storyboard.imagePrompt / videoPrompt

**AI 输出的分镜 JSON 结构**:

```typescript
interface AIStoryboardOutput {
  storyboards: {
    sortOrder: number;
    description: string;        // 分镜描述 (包含角色、对话、景别、场景)
    characterIds: string[];     // 出现的角色 ID 列表
    imagePrompt: string;        // 分镜图提示词 (含角色描述 + 场景 + 风格)
    videoPrompt: string;        // 运镜视频提示词
  }[];
}
```

#### 3.4.3 生成分镜图片

- **路径**: `POST /api/storyboard/generate-image`
- **描述**: 为指定分镜生成图片
- **请求体**: `{ storyboardId: string }`

**补充要求**:
- 若已有 `imageTaskId` 且对应任务仍在 `pending/processing`，直接返回该任务，避免重复创建
- 若关联角色全部缺少 `imageUrl`，返回错误提示需先生成角色图；若部分缺失，仅传入已有角色图并记录告警

**后端处理流程**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    生成分镜图片流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 获取分镜信息                                                  │
│     ├── 分镜提示词 (imagePrompt)                                 │
│     └── 关联角色的图片 URL 列表                                   │
│                                                                 │
│  2. 调用 Kie.AI nano-banana-pro                                 │
│     ├── prompt: 分镜提示词                                       │
│     ├── image_input: 角色图片 URL 数组 (确保角色一致性)            │
│     ├── aspect_ratio: 项目画幅比例                               │
│     ├── callBackUrl: 回调地址                                    │
│     └── 创建 generation_task 记录                                │
│                                                                 │
│  3. 更新分镜状态                                                  │
│     └── imageStatus: 'generating'                               │
│                                                                 │
│  4. 等待生成完成 (回调或轮询)                                      │
│                                                                 │
│  5. 生成完成后                                                    │
│     ├── 下载图片到 R2                                            │
│     ├── 更新 storyboard.imageUrl                                 │
│     └── 更新 storyboard.imageStatus: 'ready'                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.4.4 生成分镜视频

- **路径**: `POST /api/storyboard/generate-video`
- **描述**: 为指定分镜生成视频
- **请求体**: `{ storyboardId: string }`
- **前提条件**: 分镜必须已有图片 (imageStatus === 'ready')

**补充要求**:
- 若已有 `videoTaskId` 且对应任务仍在 `pending/processing`，直接返回该任务，避免重复创建
- `image_urls` 需为公网可访问 URL（建议使用 R2 公网域名），且格式/大小满足 Kie 要求（jpg/png/webp，≤10MB）

**后端处理流程**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    生成分镜视频流程                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 验证前提条件                                                  │
│     └── 分镜图片已生成 (imageStatus === 'ready')                 │
│                                                                 │
│  2. 获取分镜信息                                                  │
│     ├── 分镜图片 URL (imageUrl)                                  │
│     └── 运镜提示词 (videoPrompt)                                 │
│                                                                 │
│  3. 调用 Kie.AI sora-2-image-to-video (图片转视频)                │
│     ├── prompt: 运镜提示词                                       │
│     ├── image_urls: [分镜图片 URL] (仅 1 张)                       │
│     ├── aspect_ratio: portrait | landscape (由项目画幅映射)       │
│     ├── n_frames: '10' | '15'                                   │
│     ├── remove_watermark: true/false (可选)                      │
│     ├── callBackUrl: 回调地址                                    │
│     └── 创建 generation_task 记录                                │
│                                                                 │
│  4. 更新分镜状态                                                  │
│     └── videoStatus: 'generating'                               │
│                                                                 │
│  5. 等待生成完成 (回调或轮询)                                      │
│                                                                 │
│  6. 生成完成后                                                    │
│     ├── 下载视频到 R2                                            │
│     ├── 更新 storyboard.videoUrl                                 │
│     └── 更新 storyboard.videoStatus: 'ready'                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.4.5 更新分镜

- **路径**: `POST /api/storyboard/update`
- **描述**: 更新分镜信息
- **请求体**:

```typescript
interface UpdateStoryboardRequest {
  storyboardId: string;
  description?: string;
  characterIds?: string[];
  imagePrompt?: string;
  videoPrompt?: string;
  sortOrder?: number;
}
```

#### 3.4.6 删除分镜

- **路径**: `POST /api/storyboard/delete`
- **描述**: 删除分镜
- **请求体**: `{ storyboardId: string }`

---

### 3.5 Kie.AI 回调 API

#### 3.5.1 图片生成回调

- **路径**: `POST /api/callback/kie/image`
- **描述**: 接收 Kie.AI 图片生成完成的回调
- **请求体**: Kie.AI 回调数据 (与 Query Task API 响应结构相同)

**安全与幂等**:
- 校验回调密钥（Header 或 Query），未通过则拒绝
- 若任务已是 `success/failed/timeout`，直接返回，避免重复处理

**处理逻辑**:

```typescript
async function handleKieImageCallback(data: KieCallbackData) {
  // 1. 根据 taskId 查找 generation_task 记录
  const task = await findGenerationTaskByTaskId(data.taskId);
  if (!task) return;
  if (['success', 'failed', 'timeout'].includes(task.status)) return;
  if (data.state === 'fail') {
    await updateGenerationTask(task.id, {
      status: 'failed',
      errorCode: data.failCode,
      errorMessage: data.failMsg,
      callbackReceivedAt: new Date(),
      callbackData: data
    });
    return;
  }
  
  // 2. 解析结果
  const resultUrls = JSON.parse(data.resultJson).resultUrls;
  
  // 3. 下载图片到 R2
  const r2Key =
    task.targetType === 'cover'
      ? `covers/${task.projectId}/${nanoid()}.png`
      : task.targetType === 'character'
        ? `characters/${task.projectId}/${task.targetId}_${nanoid()}.png`
        : `storyboards/${task.projectId}/images/${task.targetId}_${nanoid()}.png`;
  const r2Url = await downloadAndUploadToR2(resultUrls[0], {
    bucket: 'ai-animie',
    key: r2Key
  });
  
  // 4. 更新 generation_task
  await updateGenerationTask(task.id, {
    status: 'success',
    resultUrl: resultUrls[0],
    storedUrl: r2Url,
    callbackReceivedAt: new Date(),
    callbackData: data
  });
  
  // 5. 更新目标记录 (project/character/storyboard)
  if (task.targetType === 'cover') {
    await updateProject(task.targetId, { coverImageUrl: r2Url });
  } else if (task.targetType === 'character') {
    await updateCharacter(task.targetId, { imageUrl: r2Url, status: 'ready' });
  } else if (task.targetType === 'storyboard_image') {
    await updateStoryboard(task.targetId, { imageUrl: r2Url, imageStatus: 'ready' });
  }
  
  // 6. 检查项目初始化是否完成
  await checkAndUpdateProjectInitStatus(task.projectId);
}
```

#### 3.5.2 视频生成回调

- **路径**: `POST /api/callback/kie/video`
- **描述**: 接收 Kie.AI 视频生成完成的回调
- **处理逻辑**: 与图片回调类似，处理失败状态并更新 storyboard.videoUrl（存储路径：`storyboards/{projectId}/videos/`）

---

### 3.6 任务轮询 API

#### 3.6.1 轮询生成任务

- **路径**: `POST /api/task/poll`
- **描述**: 后端定时任务调用，轮询 pending 状态的生成任务
- **触发方式**: 
  - Vercel Cron Job (每 1 分钟)
  - 或前端主动调用
  - 建议对 Cron 调用增加 `CRON_SECRET` 校验，避免被外部滥用

**处理逻辑**:

```typescript
async function pollPendingTasks() {
  // 1. 查找所有 pending 状态的任务
  const pendingTasks = await findPendingGenerationTasks({
    status: ['pending', 'processing'],
    lastPolledBefore: new Date(Date.now() - 50000), // 50秒前
    pollCountLessThan: 30 // 最多轮询 30 次 (约 30 分钟)
  });
  
  // 2. 逐个查询 Kie.AI 任务状态
  for (const task of pendingTasks) {
    const aiService = await getAIService();
    const provider = aiService.getProvider('kie');
    
    const result = await provider.query({
      taskId: task.taskId,
      mediaType:
        task.targetType === 'storyboard_video' ? 'video' : 'image'
    });
    
    // 3. 更新任务状态
    await updateGenerationTask(task.id, {
      status: mapKieStatus(result.taskStatus),
      pollCount: task.pollCount + 1,
      lastPolledAt: new Date()
    });
    
    // 4. 如果成功，执行后续处理 (与回调逻辑相同)
    if (result.taskStatus === 'success') {
      await handleTaskSuccess(task, result);
    }
    if (task.pollCount + 1 >= 30 && result.taskStatus !== 'success') {
      await handleTaskTimeout(task);
    }
  }
}
```

---

## 四、AI 提示词设计

### 4.1 故事大纲生成提示词

```
你是一位专业的故事编剧，擅长创作引人入胜的漫画/动画故事。

请根据以下信息，创作一个完整的故事大纲：

项目名称：{projectName}
项目描述：{projectDescription}

要求：
1. 故事大纲应该包含完整的起承转合
2. 必须明确所有出现的角色及其姓名
3. 故事应该有清晰的主题和情感基调
4. 适合改编为漫画/动画分镜
5. 字数控制在 500-1000 字

请直接输出故事大纲，不需要其他格式。
```

### 4.2 角色提取提示词

```
你是一位专业的角色设计师，擅长从故事中提取角色信息并设计视觉形象。

故事大纲：
{storyOutline}

风格信息：
风格名称：{styleName}
风格描述：{stylePrompt}

请从故事大纲中提取所有角色，并为每个角色生成详细信息。

输出必须是严格 JSON，不要包含任何解释、Markdown 或代码块。

输出格式 (JSON):
{
  "characters": [
    {
      "name": "角色姓名",
      "description": "角色描述（性格、背景、在故事中的作用）",
      "traits": {
        "gender": "性别",
        "age": "年龄描述",
        "appearance": "外貌特征",
        "personality": "性格特点",
        "clothing": "服装描述"
      },
      "imagePrompt": "角色图片生成提示词（英文，包含风格描述）"
    }
  ]
}

角色图片提示词要求：
1. 必须使用英文
2. 必须包含以下风格描述：{stylePrompt}
3. 背景为纯白色 (white background)
4. 单人半身像或全身像
5. 详细描述角色的外貌、服装、表情
6. 不要包含任何场景元素
```

### 4.3 分镜生成提示词

```
你是一位专业的分镜师，擅长将故事转化为视觉分镜。

项目信息：
项目名称：{projectName}
故事大纲：{storyOutline}

角色列表：
{characters.map(c => `- ${c.name} (ID: ${c.id}): ${c.description}`).join('\n')}

风格信息：
风格名称：{styleName}
风格描述：{stylePrompt}

请根据故事大纲，创作 {count} 个连续的分镜。

输出必须是严格 JSON，不要包含任何解释、Markdown 或代码块。

输出格式 (JSON):
{
  "storyboards": [
    {
      "sortOrder": 1,
      "description": "分镜描述（包含：场景描述、角色动作、对话内容、景别说明如特写/中景/远景）",
      "characterIds": ["出现在此分镜中的角色ID数组"],
      "imagePrompt": "分镜图生成提示词（英文，详见下方要求）",
      "videoPrompt": "运镜视频提示词（英文，描述画面如何动起来）"
    }
  ]
}

分镜图提示词 (imagePrompt) 要求：
1. 必须使用英文
2. 必须包含以下风格描述：{stylePrompt}
3. 详细描述场景、角色位置、表情、动作
4. 说明景别（close-up / medium shot / wide shot）
5. 描述光线和氛围

运镜视频提示词 (videoPrompt) 要求：
1. 必须使用英文
2. 描述摄像机运动（pan / tilt / zoom / track）
3. 描述画面中的动态元素（角色动作、环境变化）
4. 时长约 3-5 秒的运动描述
5. 示例：
   - "Camera slowly pans from left to right, following the character walking"
   - "Zoom in on character's face as they express surprise"
   - "Static shot with cherry blossom petals gently falling"

补充要求：
1. `characterIds` 只能使用上方提供的角色 ID，不允许编造新 ID
```

### 4.4 封面图生成提示词模板

```
{styleName} style anime cover illustration.
{stylePrompt}
Scene description: A dramatic cover image for "{projectName}" featuring the main characters.
High quality, detailed, professional anime cover art.
Aspect ratio: {aspectRatio}
```

### 4.5 角色图生成提示词模板

```
{stylePrompt}
Character portrait of {characterName}.
{characterTraits}
White background, clean portrait, no scene elements.
High quality character design, detailed features.
Aspect ratio: 1:1
```

---

## 五、前端交互设计

### 5.1 项目列表页 (/projects)

```
┌─────────────────────────────────────────────────────────────────┐
│  页面加载                                                        │
│  └── 调用 GET /api/project/list                                 │
│      └── 显示骨架屏 → 渲染项目卡片                               │
│                                                                 │
│  新增项目                                                        │
│  └── 打开创建对话框                                              │
│      └── 填写: 名称、描述、画幅、风格                             │
│      └── 调用 POST /api/project/create                          │
│      └── 成功后跳转到项目详情页                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 故事设定页 (/project/:id/story-setting)

```
┌─────────────────────────────────────────────────────────────────┐
│  页面加载                                                        │
│  └── 调用 GET /api/project/info                                 │
│      └── 显示骨架屏                                              │
│                                                                 │
│  情况 1: storyOutline 为空                                       │
│  └── 显示"一键初始化故事"按钮                                     │
│      └── 若 status='initializing'，直接显示初始化进度             │
│      └── 点击后调用 POST /api/project/init-story                 │
│      └── 显示初始化进度                                          │
│          └── 轮询 GET /api/project/init-status                  │
│          └── 显示各阶段状态:                                     │
│              - 生成故事大纲中...                                  │
│              - 提取角色中...                                     │
│              - 生成封面图中...                                   │
│              - 生成角色图中... (显示进度 2/5)                     │
│      └── 完成后刷新页面数据                                      │
│                                                                 │
│  情况 2: storyOutline 有数据                                     │
│  └── 渲染各卡片模块:                                             │
│      - 封面图卡片 (可编辑)                                       │
│      - 故事大纲卡片 (可编辑)                                     │
│      - 角色列表卡片 (可编辑、可重新生成图片)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 分镜页 (/project/:id/storyboard)

```
┌─────────────────────────────────────────────────────────────────┐
│  页面加载                                                        │
│  └── 调用 GET /api/storyboard/list                              │
│      └── 显示骨架屏                                              │
│                                                                 │
│  情况 1: 无分镜数据                                              │
│  └── 显示"一键生成分镜"按钮                                       │
│      └── 点击后调用 POST /api/storyboard/generate               │
│      └── 成功后刷新分镜列表                                      │
│                                                                 │
│  情况 2: 有分镜数据                                              │
│  └── 渲染分镜卡片列表:                                           │
│      ┌─────────────────────────────────────────────────────┐   │
│      │  分镜卡片                                            │   │
│      │  ├── 分镜描述 (可编辑)                               │   │
│      │  ├── 角色标签 (自动匹配)                             │   │
│      │  ├── 分镜图区域                                      │   │
│      │  │   ├── 无图片: 显示占位图 + "生成分镜图"按钮       │   │
│      │  │   │   └── 点击调用 POST /api/storyboard/generate-image│ │
│      │  │   ├── 生成中: 显示 loading + 进度                 │   │
│      │  │   └── 已生成: 显示图片                            │   │
│      │  ├── 分镜视频区域                                    │   │
│      │  │   ├── 无图片时: 灰色禁用状态                      │   │
│      │  │   ├── 有图片无视频: 显示"生成视频"按钮            │   │
│      │  │   │   └── 点击调用 POST /api/storyboard/generate-video│ │
│      │  │   ├── 生成中: 显示 loading + 进度                 │   │
│      │  │   └── 已生成: 显示视频播放器                      │   │
│      │  └── 提示词预览 (可展开编辑)                         │   │
│      └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、关键实现细节

### 6.1 Kie.AI 调用封装

复用现有 `src/extensions/ai/kie.ts`，确保：

1. **设置回调 URL**: 在所有生成请求中设置 `callBackUrl`
2. **保存到 R2**: 由回调/轮询统一下载并上传到 R2（便于自定义路径）；避免 `customStorage` 与手动上传重复
3. **任务追踪**: 每次生成都创建 `generation_task` 记录
4. **参数一致性**: `sora-2-image-to-video` 使用 `image_urls` 且仅支持 1 张图；`aspect_ratio` 取值为 `portrait|landscape`，需由项目画幅 `9:16/16:9` 映射；`n_frames` 仅支持 `'10'|'15'`

### 6.2 R2 存储路径规划

```
ai-animie/
├── covers/
│   └── {projectId}/
│       └── {timestamp}_{nanoid}.png
├── characters/
│   └── {projectId}/
│       └── {characterId}_{nanoid}.png
├── storyboards/
│   └── {projectId}/
│       ├── images/
│       │   └── {storyboardId}_{nanoid}.png
│       └── videos/
│           └── {storyboardId}_{nanoid}.mp4
```

### 6.3 回调与轮询双机制

为确保可靠性，同时实现：

1. **回调机制**:
   - 设置回调 URL: `{APP_URL}/api/callback/kie/{type}`
   - 回调成功后立即处理结果

2. **轮询机制**:
   - Vercel Cron 每 1 分钟执行一次
   - 查询 `pending` 或 `processing` 状态的任务
   - 最多轮询 30 次 (约 30 分钟超时)

3. **去重处理**:
   - 使用 `status` 字段防止重复处理
   - 回调和轮询都先检查当前状态

### 6.4 风格融合逻辑

角色和分镜图生成时，必须融合用户选择的风格：

```typescript
import styles from '@/shared/styles/index.json';

function getStylePrompt(styleId: number): string {
  const style = styles.find(s => s.id === styleId);
  if (!style) throw new Error('Invalid style ID');
  return style.prompt;
}

function buildCharacterImagePrompt(character: Character, styleId: number): string {
  const stylePrompt = getStylePrompt(styleId);
  return `${stylePrompt}
Character portrait of ${character.name}.
${character.traits.appearance}
${character.traits.clothing}
White background, clean portrait, no scene elements.
High quality character design, detailed features.
Aspect ratio: 1:1`;
}

function buildStoryboardImagePrompt(
  storyboard: Storyboard, 
  characters: Character[],
  styleId: number
): string {
  const stylePrompt = getStylePrompt(styleId);
  const characterDescriptions = characters
    .filter(c => storyboard.characterIds.includes(c.id))
    .map(c => `${c.name}: ${c.traits.appearance}`)
    .join('; ');
  
  return `${stylePrompt}
Scene: ${storyboard.description}
Characters: ${characterDescriptions}
High quality anime illustration.`;
}
```

### 6.5 角色一致性保证

生成分镜图时，传入角色参考图确保角色一致性：

```typescript
async function generateStoryboardImage(storyboard: Storyboard, project: Project) {
  const characters = await getCharactersByIds(storyboard.characterIds);
  const characterImageUrls = characters
    .filter(c => c.imageUrl)
    .map(c => c.imageUrl!);
  
  const aiService = await getAIService();
  const provider = aiService.getProvider('kie');
  
  const result = await provider.generateImage({
    params: {
      model: 'nano-banana-pro',
      prompt: storyboard.imagePrompt,
      options: {
        image_input: characterImageUrls,  // 传入角色参考图
        aspect_ratio: project.aspectRatio,
        resolution: '2K',
        output_format: 'png'
      },
      callbackUrl: `${process.env.APP_URL}/api/callback/kie/image`
    }
  });
  
  return result;
}
```

---

## 七、错误处理

### 7.1 AI 生成失败处理

| 场景 | 处理方式 |
|------|----------|
| OpenRouter 调用失败 | 记录错误，更新 `initError`，允许重试 |
| Kie.AI 任务失败 | 更新 generation_task 为 `failed`，并同步更新目标记录状态 |
| R2 上传失败 | 保留原始 URL，记录错误日志 |
| 轮询超时 (30min) | 标记任务为 `timeout`，并将目标记录状态置为 `timeout` |

### 7.2 状态恢复

用户刷新页面时，根据各记录的状态正确渲染：

- `pending`/`generating`: 显示生成中状态，继续轮询
- `failed`: 显示失败状态，提供重试按钮
- `timeout`: 显示超时状态，提供重试按钮
- `ready`: 显示最终结果

---

## 八、文件结构规划

```
src/
├── app/
│   └── api/
│       ├── project/
│       │   ├── create/route.ts
│       │   ├── list/route.ts
│       │   ├── info/route.ts
│       │   ├── update/route.ts
│       │   ├── delete/route.ts
│       │   ├── init-story/route.ts
│       │   └── init-status/route.ts
│       ├── character/
│       │   ├── list/route.ts
│       │   ├── update/route.ts
│       │   └── regenerate-image/route.ts
│       ├── storyboard/
│       │   ├── list/route.ts
│       │   ├── generate/route.ts
│       │   ├── generate-image/route.ts
│       │   ├── generate-video/route.ts
│       │   ├── update/route.ts
│       │   └── delete/route.ts
│       ├── callback/
│       │   └── kie/
│       │       ├── image/route.ts
│       │       └── video/route.ts
│       └── task/
│           └── poll/route.ts
├── config/
│   └── db/
│       └── schema.postgres.ts  (新增表定义)
├── shared/
│   ├── models/
│   │   ├── project.ts
│   │   ├── character.ts
│   │   ├── storyboard.ts
│   │   └── generation_task.ts
│   ├── services/
│   │   └── project.ts  (业务逻辑封装)
│   └── lib/
│       └── ai-prompts.ts  (AI 提示词模板)
```

---

## 九、开发任务清单

### 阶段一：数据库与基础 API

- [ ] 在 schema.postgres.ts 中新增表定义
- [ ] 运行数据库迁移
- [ ] 实现 Model 层 CRUD 函数
- [ ] 实现项目 CRUD API
- [ ] 实现角色 CRUD API
- [ ] 实现分镜 CRUD API

### 阶段二：AI 集成

- [ ] 实现故事大纲生成 (OpenRouter)
- [ ] 实现角色提取 (OpenRouter)
- [ ] 实现封面图生成 (Kie.AI)
- [ ] 实现角色图生成 (Kie.AI)
- [ ] 实现分镜 AI 生成 (OpenRouter)
- [ ] 实现分镜图生成 (Kie.AI)
- [ ] 实现分镜视频生成 (Kie.AI sora-2-image-to-video)

### 阶段三：任务管理

- [ ] 实现 generation_task 管理
- [ ] 实现 Kie.AI 回调接口
- [ ] 实现任务轮询机制
- [ ] 实现 R2 存储集成
- [ ] 配置 Vercel Cron Job

### 阶段四：前端集成

- [ ] 重构项目列表页 (接入真实 API)
- [ ] 重构故事设定页 (接入真实 API)
- [ ] 重构分镜页 (接入真实 API)
- [ ] 实现加载骨架屏
- [ ] 实现生成进度显示

### 阶段五：测试与优化

- [ ] API 接口测试
- [ ] AI 生成流程测试
- [ ] 回调机制测试
- [ ] 错误处理测试
- [ ] 性能优化

---

## 十、注意事项

1. **积分消耗**: 当前方案未涉及积分消耗，可复用现有 `credit` 模块
2. **并发控制**: 大量并发生成时需考虑 Kie.AI 的 rate limit
3. **成本控制**: OpenRouter 和 Kie.AI 都有使用成本，需监控
4. **数据备份**: R2 存储的图片/视频是核心资产，需确保可靠性
5. **隐私安全**: 用户创作内容需做好权限控制

---

> 文档完成于 2026-02-02，如有疑问请及时沟通。
