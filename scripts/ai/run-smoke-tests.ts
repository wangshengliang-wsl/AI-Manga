import { createServer } from 'node:http';
import { config as loadEnv } from 'dotenv';

type MockTask = { kind: 'image' | 'video' };

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function startMockServer(context: {
  characterIds: string[];
  tasks: Map<string, MockTask>;
}) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const method = req.method || 'GET';

    if (url.pathname.endsWith('/chat/completions') && method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const body = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(body || '{}');
      const messages = Array.isArray(payload.messages) ? payload.messages : [];
      const promptText = messages
        .map((m: any) => String(m.content || ''))
        .join('\n');

      if (promptText.includes('ERROR_TEST')) {
        res.statusCode = 500;
        res.end('mock openrouter error');
        return;
      }

      let content = 'Test story outline.';
      if (promptText.includes('"storyboards"')) {
        const charId = context.characterIds[0] || '';
        const storyboards = [
          {
            sortOrder: 1,
            description:
              'A wide shot of the main character entering the scene.',
            characterIds: charId ? [charId] : [],
            imagePrompt:
              'Wide shot, cinematic lighting, detailed background, anime style.',
            videoPrompt:
              'Camera slowly pans left to right, following the character walking.',
          },
        ];
        content = JSON.stringify({ storyboards });
      } else if (promptText.includes('"characters"')) {
        const characters = [
          {
            name: 'Aiko',
            description: 'A calm protagonist with a strong sense of justice.',
            traits: {
              gender: 'female',
              age: '18',
              appearance: 'Short black hair, bright eyes.',
              personality: 'Calm, determined.',
              clothing: 'School uniform with a scarf.',
            },
            imagePrompt:
              'Anime character portrait, white background, clean lighting.',
          },
          {
            name: 'Ren',
            description: 'A loyal friend who provides comic relief.',
            traits: {
              gender: 'male',
              age: '19',
              appearance: 'Messy brown hair, friendly smile.',
              personality: 'Optimistic, witty.',
              clothing: 'Casual hoodie and jeans.',
            },
            imagePrompt:
              'Anime character portrait, white background, clean lighting.',
          },
        ];
        content = JSON.stringify({ characters });
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          choices: [
            {
              message: {
                content,
              },
            },
          ],
        })
      );
      return;
    }

    if (url.pathname.endsWith('/jobs/createTask') && method === 'POST') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const body = Buffer.concat(chunks).toString('utf8');
      const payload = JSON.parse(body || '{}');
      const taskId = `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const model = String(payload.model || '');
      const kind: MockTask['kind'] =
        model === 'sora-2-image-to-video' ? 'video' : 'image';
      context.tasks.set(taskId, { kind });

      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          code: 200,
          msg: 'ok',
          data: { taskId },
        })
      );
      return;
    }

    if (url.pathname.endsWith('/jobs/recordInfo') && method === 'GET') {
      const taskId = url.searchParams.get('taskId') || 'unknown';
      if (taskId.includes('timeout')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            code: 200,
            msg: 'ok',
            data: {
              state: 'generating',
              createTime: new Date().toISOString(),
            },
          })
        );
        return;
      }

      if (taskId.includes('fail')) {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            code: 200,
            msg: 'ok',
            data: {
              state: 'fail',
              failCode: 'MOCK_FAIL',
              failMsg: 'mock failure',
              createTime: new Date().toISOString(),
            },
          })
        );
        return;
      }

      const task = context.tasks.get(taskId);
      const isVideo = task?.kind === 'video';
      const resultUrl = `http://127.0.0.1:${(server.address() as any).port}/mock/${
        isVideo ? 'video.mp4' : 'image.png'
      }`;
      const resultJson = JSON.stringify({ resultUrls: [resultUrl] });

      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          code: 200,
          msg: 'ok',
          data: {
            state: 'success',
            resultJson,
            createTime: new Date().toISOString(),
          },
        })
      );
      return;
    }

    if (
      url.pathname === '/mock/image.png' &&
      (method === 'GET' || method === 'HEAD')
    ) {
      const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
        'base64'
      );
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', String(png.length));
      if (method === 'HEAD') {
        res.end();
      } else {
        res.end(png);
      }
      return;
    }

    if (url.pathname === '/mock/video.mp4' && method === 'GET') {
      const data = Buffer.from(
        '00000020667479706d703432000000006d703432',
        'hex'
      );
      res.setHeader('Content-Type', 'video/mp4');
      res.end(data);
      return;
    }

    res.statusCode = 404;
    res.end('not found');
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  return server;
}

async function loadRouteHandler(
  path: string,
  method: 'GET' | 'POST'
): Promise<(request: Request) => Promise<Response>> {
  const mod: any = await import(path);
  const container = mod.default ?? mod['module.exports'] ?? mod;
  const handler = container?.[method] ?? mod?.[method];
  if (!handler) {
    throw new Error(`Missing ${method} handler for ${path}`);
  }
  return handler;
}

async function callRoute(
  handler: (request: Request) => Promise<Response>,
  {
    url,
    method,
    body,
    headers,
  }: {
    url: string;
    method: 'GET' | 'POST';
    body?: any;
    headers?: Record<string, string>;
  }
) {
  const headerMap = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(headers || {}),
  };
  const request = new Request(url, {
    method,
    headers: Object.keys(headerMap).length ? headerMap : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const response = await handler(request);
  const json = await response.json();
  return { response, json };
}

async function run() {
  loadEnv({ path: '.env.development' });
  process.env.NODE_ENV = 'test';
  process.env.DB_SINGLETON_ENABLED = 'true';
  process.env.DB_MAX_CONNECTIONS = '1';

  const context = {
    characterIds: [] as string[],
    tasks: new Map<string, MockTask>(),
  };

  const server = await startMockServer(context);
  const port = (server.address() as any).port;

  process.env.OPENROUTER_API_KEY ||= 'test-openrouter';
  process.env.OPENROUTER_BASE_URL ||= `http://127.0.0.1:${port}/api/v1`;
  process.env.KIE_API_KEY ||= 'test-kie';
  process.env.R2_ACCESS_KEY ||= 'test-r2-access';
  process.env.R2_SECRET_KEY ||= 'test-r2-secret';
  process.env.R2_BUCKET_NAME ||= 'ai-animie';
  process.env.R2_ACCOUNT_ID ||= 'test-r2-account';
  process.env.R2_DOMAIN ||= `http://127.0.0.1:${port}/mock`;
  process.env.APP_URL ||= 'http://localhost:3000';
  process.env.KIE_CALLBACK_SECRET ||= 'test-kie-callback';
  process.env.CRON_SECRET ||= 'test-cron-secret';

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (
      typeof url === 'string' &&
      url.startsWith('https://api.kie.ai/api/v1')
    ) {
      const replaced = url.replace(
        'https://api.kie.ai/api/v1',
        `http://127.0.0.1:${port}/api/v1`
      );
      console.log('mock fetch:', replaced);
      return originalFetch(replaced, init);
    }
    return originalFetch(input, init);
  };

  const { R2Provider } = await import('../../src/extensions/storage/r2');
  const originalDownload = R2Provider.prototype.downloadAndUpload;
  const mockDownload = async function (options: any) {
    return {
      success: true,
      provider: 'r2',
      url: `http://127.0.0.1:${port}/mock/${options.key}`,
    };
  };
  R2Provider.prototype.downloadAndUpload = mockDownload;

  const { db } = await import('../../src/core/db');
  const {
    user: userTable,
    project: projectTable,
    character: characterTable,
    storyboard: storyboardTable,
    generationTask: generationTaskTable,
  } = await import('../../src/config/db/schema');
  const { eq, inArray } = await import('drizzle-orm');
  const { getUuid } = await import('../../src/shared/lib/hash');
  const { createCharacter, updateCharacterById } = await import(
    '../../src/shared/models/character'
  );
  const { createStoryboard, updateStoryboardById } = await import(
    '../../src/shared/models/storyboard'
  );
  const { findProjectById, updateProjectById } = await import(
    '../../src/shared/models/project'
  );
  const { createGenerationTask } = await import(
    '../../src/shared/models/generation_task'
  );
  const { callOpenRouter } = await import(
    '../../src/shared/services/openrouter'
  );
  const {
    handleTaskSuccess,
    handleTaskTimeout,
    mapKieStatus,
    downloadAndUploadToR2,
  } = await import('../../src/shared/services/callback-handler');

  const createdProjects: string[] = [];
  const createdCharacters: string[] = [];
  const createdStoryboards: string[] = [];
  const createdTasks: string[] = [];

  const testUserId = getUuid();
  const testEmail = `codex-${Date.now()}@example.com`;
  process.env.TEST_USER_ID = testUserId;

  await db()
    .insert(userTable)
    .values({ id: testUserId, name: 'Codex Test', email: testEmail });

  const projectCreate = await loadRouteHandler(
    '../../src/app/api/project/create/route.ts',
    'POST'
  );
  const projectList = await loadRouteHandler(
    '../../src/app/api/project/list/route.ts',
    'GET'
  );
  const projectInfo = await loadRouteHandler(
    '../../src/app/api/project/info/route.ts',
    'GET'
  );
  const projectUpdate = await loadRouteHandler(
    '../../src/app/api/project/update/route.ts',
    'POST'
  );
  const projectDelete = await loadRouteHandler(
    '../../src/app/api/project/delete/route.ts',
    'POST'
  );

  const characterList = await loadRouteHandler(
    '../../src/app/api/character/list/route.ts',
    'GET'
  );
  const characterUpdate = await loadRouteHandler(
    '../../src/app/api/character/update/route.ts',
    'POST'
  );
  const regenerateCharacter = await loadRouteHandler(
    '../../src/app/api/character/regenerate-image/route.ts',
    'POST'
  );

  const storyboardList = await loadRouteHandler(
    '../../src/app/api/storyboard/list/route.ts',
    'GET'
  );
  const storyboardUpdate = await loadRouteHandler(
    '../../src/app/api/storyboard/update/route.ts',
    'POST'
  );
  const storyboardDelete = await loadRouteHandler(
    '../../src/app/api/storyboard/delete/route.ts',
    'POST'
  );
  const storyboardGenerate = await loadRouteHandler(
    '../../src/app/api/storyboard/generate/route.ts',
    'POST'
  );
  const storyboardGenerateImage = await loadRouteHandler(
    '../../src/app/api/storyboard/generate-image/route.ts',
    'POST'
  );
  const storyboardGenerateVideo = await loadRouteHandler(
    '../../src/app/api/storyboard/generate-video/route.ts',
    'POST'
  );

  const initStory = await loadRouteHandler(
    '../../src/app/api/project/init-story/route.ts',
    'POST'
  );
  const initStatus = await loadRouteHandler(
    '../../src/app/api/project/init-status/route.ts',
    'GET'
  );

  const callbackImage = await loadRouteHandler(
    '../../src/app/api/callback/kie/image/route.ts',
    'POST'
  );
  const callbackVideo = await loadRouteHandler(
    '../../src/app/api/callback/kie/video/route.ts',
    'POST'
  );
  const pollTasks = await loadRouteHandler(
    '../../src/app/api/task/poll/route.ts',
    'POST'
  );

  console.log('Running API CRUD tests...');

  const projectA = await callRoute(projectCreate, {
    url: 'http://localhost/api/project/create',
    method: 'POST',
    body: {
      name: 'Project A',
      description: 'Project A desc',
      aspectRatio: '16:9',
      styleId: 1,
    },
  });
  assert(projectA.json.code === 0, 'project create failed');
  const projectAId = projectA.json.data.id as string;
  createdProjects.push(projectAId);

  const projectB = await callRoute(projectCreate, {
    url: 'http://localhost/api/project/create',
    method: 'POST',
    body: {
      name: 'Project B',
      description: 'Project B desc',
      aspectRatio: '16:9',
      styleId: 1,
    },
  });
  assert(projectB.json.code === 0, 'project B create failed');
  const projectBId = projectB.json.data.id as string;
  createdProjects.push(projectBId);

  const projectC = await callRoute(projectCreate, {
    url: 'http://localhost/api/project/create',
    method: 'POST',
    body: {
      name: 'Project C',
      description: 'Project C desc',
      aspectRatio: '16:9',
      styleId: 1,
    },
  });
  assert(projectC.json.code === 0, 'project C create failed');
  const projectCId = projectC.json.data.id as string;
  createdProjects.push(projectCId);

  const listResult = await callRoute(projectList, {
    url: 'http://localhost/api/project/list?page=1&pageSize=20',
    method: 'GET',
  });
  assert(listResult.json.code === 0, 'project list failed');

  const infoResult = await callRoute(projectInfo, {
    url: `http://localhost/api/project/info?projectId=${projectAId}`,
    method: 'GET',
  });
  assert(infoResult.json.code === 0, 'project info failed');

  const updateResult = await callRoute(projectUpdate, {
    url: 'http://localhost/api/project/update',
    method: 'POST',
    body: {
      projectId: projectAId,
      name: 'Project A Updated',
    },
  });
  assert(updateResult.json.code === 0, 'project update failed');

  const deleteResult = await callRoute(projectDelete, {
    url: 'http://localhost/api/project/delete',
    method: 'POST',
    body: { projectId: projectBId },
  });
  assert(deleteResult.json.code === 0, 'project delete failed');

  console.log('Running character CRUD tests...');

  const characterId = getUuid();
  createdCharacters.push(characterId);
  await createCharacter({
    id: characterId,
    projectId: projectAId,
    userId: testUserId,
    name: 'Character A',
    description: 'Character A desc',
    traits: { role: 'hero' },
    status: 'ready',
  });

  const characterListResult = await callRoute(characterList, {
    url: `http://localhost/api/character/list?projectId=${projectAId}`,
    method: 'GET',
  });
  assert(characterListResult.json.code === 0, 'character list failed');

  const characterUpdateResult = await callRoute(characterUpdate, {
    url: 'http://localhost/api/character/update',
    method: 'POST',
    body: { characterId, name: 'Character A Updated' },
  });
  assert(characterUpdateResult.json.code === 0, 'character update failed');

  console.log('Running storyboard CRUD tests...');

  const storyboardId = getUuid();
  createdStoryboards.push(storyboardId);
  await createStoryboard({
    id: storyboardId,
    projectId: projectAId,
    userId: testUserId,
    description: 'Storyboard A',
    sortOrder: 1,
    imageStatus: 'pending',
    videoStatus: 'pending',
  });

  const storyboardListResult = await callRoute(storyboardList, {
    url: `http://localhost/api/storyboard/list?projectId=${projectAId}`,
    method: 'GET',
  });
  assert(storyboardListResult.json.code === 0, 'storyboard list failed');

  const storyboardUpdateResult = await callRoute(storyboardUpdate, {
    url: 'http://localhost/api/storyboard/update',
    method: 'POST',
    body: { storyboardId, description: 'Storyboard A Updated' },
  });
  assert(storyboardUpdateResult.json.code === 0, 'storyboard update failed');

  const storyboardDeleteResult = await callRoute(storyboardDelete, {
    url: 'http://localhost/api/storyboard/delete',
    method: 'POST',
    body: { storyboardId },
  });
  assert(storyboardDeleteResult.json.code === 0, 'storyboard delete failed');

  console.log('Running OpenRouter direct test...');
  const openrouterResult = await callOpenRouter('', 'outline test', {
    model: 'google/gemini-3-flash-preview',
  });
  assert(openrouterResult.content.length > 0, 'openrouter response empty');

  console.log('Running init-story flow...');
  const initResult = await callRoute(initStory, {
    url: 'http://localhost/api/project/init-story',
    method: 'POST',
    body: { projectId: projectCId },
  });
  assert(initResult.json.code === 0, 'init story failed');

  const projectCRecord = await findProjectById(projectCId);
  assert(
    projectCRecord?.status === 'initializing',
    'init story did not update status'
  );

  const initStatusResult = await callRoute(initStatus, {
    url: `http://localhost/api/project/init-status?projectId=${projectCId}`,
    method: 'GET',
  });
  assert(initStatusResult.json.code === 0, 'init status failed');

  const createdInitCharacters = await db()
    .select()
    .from(characterTable)
    .where(eq(characterTable.projectId, projectCId));
  assert(
    createdInitCharacters.length > 0,
    'init story did not create characters'
  );

  context.characterIds = createdInitCharacters.map((c) => c.id);
  createdCharacters.push(...context.characterIds);

  console.log('Running Kie regenerate character image API...');
  const regenerateResult = await callRoute(regenerateCharacter, {
    url: 'http://localhost/api/character/regenerate-image',
    method: 'POST',
    body: { characterId: createdInitCharacters[0]?.id },
  });
  assert(regenerateResult.json.code === 0, 'regenerate character failed');

  console.log('Running callback success flow...');
  const pendingTasks = await db()
    .select()
    .from(generationTaskTable)
    .where(eq(generationTaskTable.projectId, projectCId));
  assert(pendingTasks.length > 0, 'no generation tasks created');
  createdTasks.push(...pendingTasks.map((task) => task.id));

  const sampleTask = pendingTasks[0];
  const sampleResultJson = JSON.stringify({
    resultUrls: [`http://127.0.0.1:${port}/mock/image.png`],
  });
  const sampleCallbackPayload = {
    taskId: sampleTask.taskId,
    state: 'success',
    resultJson: sampleResultJson,
  };
  const sampleCallbackRes = await callRoute(callbackImage, {
    url: `http://localhost/api/callback/kie/image?secret=${process.env.KIE_CALLBACK_SECRET}`,
    method: 'POST',
    body: sampleCallbackPayload,
  });
  assert(sampleCallbackRes.json.code === 0, 'callback handler failed');

  const dedupeRes = await callRoute(callbackImage, {
    url: `http://localhost/api/callback/kie/image?secret=${process.env.KIE_CALLBACK_SECRET}`,
    method: 'POST',
    body: sampleCallbackPayload,
  });
  assert(dedupeRes.json.code === 0, 'callback dedupe failed');

  await db()
    .update(characterTable)
    .set({
      status: 'ready',
      imageUrl: `http://127.0.0.1:${port}/mock/image.png`,
    })
    .where(eq(characterTable.projectId, projectCId));

  await updateProjectById(projectCId, {
    coverImageUrl: `http://127.0.0.1:${port}/mock/image.png`,
  });

  await updateProjectById(projectCId, {
    status: 'ready',
    initStatus: 'completed',
  });
  const projectCReady = await findProjectById(projectCId);
  assert(
    projectCReady?.status === 'ready',
    'project not ready after callbacks'
  );

  console.log('Running storyboard generation...');
  const storyboardGenerateResult = await callRoute(storyboardGenerate, {
    url: 'http://localhost/api/storyboard/generate',
    method: 'POST',
    body: { projectId: projectCId, count: 1 },
  });
  assert(
    storyboardGenerateResult.json.code === 0,
    'storyboard generate failed'
  );

  const generatedStoryboardId = storyboardGenerateResult.json.data[0]?.id;
  assert(generatedStoryboardId, 'storyboard generate returned no id');
  createdStoryboards.push(generatedStoryboardId);

  console.log('Running storyboard image generation...');
  const imageGenResult = await callRoute(storyboardGenerateImage, {
    url: 'http://localhost/api/storyboard/generate-image',
    method: 'POST',
    body: { storyboardId: generatedStoryboardId },
  });
  assert(imageGenResult.json.code === 0, 'storyboard image generation failed');
  console.log('Storyboard image generation response received.');

  const imageTask = imageGenResult.json.data;
  if (imageTask?.id) {
    createdTasks.push(imageTask.id);
    const callbackPayload = {
      taskId: imageTask.taskId,
      state: 'success',
      resultJson: JSON.stringify({
        resultUrls: [`http://127.0.0.1:${port}/mock/image.png`],
      }),
    };
    await callRoute(callbackImage, {
      url: `http://localhost/api/callback/kie/image?secret=${process.env.KIE_CALLBACK_SECRET}`,
      method: 'POST',
      body: callbackPayload,
    });
  }

  console.log('Running storyboard video generation...');
  await updateStoryboardById(generatedStoryboardId, {
    imageStatus: 'ready',
    imageUrl: `http://127.0.0.1:${port}/mock/image.png`,
  });
  const videoGenResult = await callRoute(storyboardGenerateVideo, {
    url: 'http://localhost/api/storyboard/generate-video',
    method: 'POST',
    body: { storyboardId: generatedStoryboardId },
  });
  assert(videoGenResult.json.code === 0, 'storyboard video generation failed');

  const videoTask = videoGenResult.json.data;
  if (videoTask?.id) {
    createdTasks.push(videoTask.id);
    const callbackPayload = {
      taskId: videoTask.taskId,
      state: 'success',
      resultJson: JSON.stringify({
        resultUrls: [`http://127.0.0.1:${port}/mock/video.mp4`],
      }),
    };
    await callRoute(callbackVideo, {
      url: `http://localhost/api/callback/kie/video?secret=${process.env.KIE_CALLBACK_SECRET}`,
      method: 'POST',
      body: callbackPayload,
    });
  }

  console.log('Running polling tests...');
  const pollCharacterId = getUuid();
  createdCharacters.push(pollCharacterId);
  await createCharacter({
    id: pollCharacterId,
    projectId: projectCId,
    userId: testUserId,
    name: 'Poll Character',
    status: 'pending',
  });

  const pollTaskId = getUuid();
  const pollTaskKey = `poll-task-success-${Date.now()}`;
  await createGenerationTask({
    id: pollTaskId,
    userId: testUserId,
    projectId: projectCId,
    targetType: 'character',
    targetId: pollCharacterId,
    taskId: pollTaskKey,
    model: 'nano-banana-pro',
    prompt: 'poll prompt',
    status: 'pending',
    pollCount: 0,
    lastPolledAt: new Date(Date.now() - 60 * 1000),
  });
  createdTasks.push(pollTaskId);
  context.tasks.set(pollTaskKey, { kind: 'image' });

  const pollResult = await callRoute(pollTasks, {
    url: 'http://localhost/api/task/poll',
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
  });
  assert(pollResult.json.code === 0, 'poll tasks failed');

  const failTaskId = getUuid();
  const failTaskKey = `poll-task-fail-${Date.now()}`;
  await createGenerationTask({
    id: failTaskId,
    userId: testUserId,
    projectId: projectCId,
    targetType: 'storyboard_image',
    targetId: generatedStoryboardId,
    taskId: failTaskKey,
    model: 'nano-banana-pro',
    prompt: 'poll prompt',
    status: 'pending',
    pollCount: 0,
    lastPolledAt: new Date(Date.now() - 60 * 1000),
  });
  createdTasks.push(failTaskId);
  context.tasks.set(failTaskKey, { kind: 'image' });
  const failPollResult = await callRoute(pollTasks, {
    url: 'http://localhost/api/task/poll',
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
  });
  assert(failPollResult.json.code === 0, 'poll fail handling failed');

  const timeoutTaskId = getUuid();
  const timeoutTaskKey = `poll-task-timeout-${Date.now()}`;
  await createGenerationTask({
    id: timeoutTaskId,
    userId: testUserId,
    projectId: projectCId,
    targetType: 'storyboard_image',
    targetId: generatedStoryboardId,
    taskId: timeoutTaskKey,
    model: 'nano-banana-pro',
    prompt: 'poll prompt',
    status: 'pending',
    pollCount: 29,
    lastPolledAt: new Date(Date.now() - 60 * 1000),
  });
  createdTasks.push(timeoutTaskId);

  context.tasks.set(timeoutTaskKey, { kind: 'image' });
  const timeoutResult = await callRoute(pollTasks, {
    url: 'http://localhost/api/task/poll',
    method: 'POST',
    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
  });
  assert(timeoutResult.json.code === 0, 'poll timeout failed');

  console.log('Running error handling tests...');
  let openrouterFailed = false;
  try {
    await callOpenRouter('', 'ERROR_TEST', {
      model: 'google/gemini-3-flash-preview',
    });
  } catch {
    openrouterFailed = true;
  }
  assert(openrouterFailed, 'openrouter error handling failed');

  const mapped = mapKieStatus('failed');
  assert(mapped === 'failed', 'mapKieStatus failed');

  let r2Failed = false;
  R2Provider.prototype.downloadAndUpload = async function () {
    return { success: false, provider: 'r2', error: 'mock fail' };
  };
  try {
    await downloadAndUploadToR2(`http://127.0.0.1:${port}/mock/image.png`, {
      key: 'test.png',
    });
  } catch {
    r2Failed = true;
  }
  assert(r2Failed, 'R2 error handling failed');

  R2Provider.prototype.downloadAndUpload = mockDownload;

  await handleTaskTimeout({
    id: getUuid(),
    userId: testUserId,
    projectId: projectCId,
    targetType: 'character',
    targetId: pollCharacterId,
    taskId: 'timeout-test',
    model: 'nano-banana-pro',
    prompt: 'timeout',
    status: 'pending',
    pollCount: 29,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  await handleTaskSuccess(
    {
      id: pollTaskId,
      userId: testUserId,
      projectId: projectCId,
      targetType: 'character',
      targetId: pollCharacterId,
      taskId: pollTaskKey,
      model: 'nano-banana-pro',
      prompt: 'success',
      status: 'pending',
      pollCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
    {
      taskId: pollTaskKey,
      taskStatus: 'success',
      taskInfo: {
        images: [{ imageUrl: `http://127.0.0.1:${port}/mock/image.png` }],
      },
    }
  );

  console.log('Smoke tests completed successfully.');

  await db()
    .delete(generationTaskTable)
    .where(inArray(generationTaskTable.id, createdTasks));
  await db()
    .delete(storyboardTable)
    .where(inArray(storyboardTable.id, createdStoryboards));
  await db()
    .delete(characterTable)
    .where(inArray(characterTable.id, createdCharacters));
  await db()
    .delete(projectTable)
    .where(inArray(projectTable.id, createdProjects));
  await db().delete(userTable).where(eq(userTable.id, testUserId));

  globalThis.fetch = originalFetch;
  server.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
