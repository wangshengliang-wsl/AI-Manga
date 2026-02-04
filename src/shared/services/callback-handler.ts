import { nanoid } from 'nanoid';

import { AITaskStatus } from '@/extensions/ai';
import {
  findCharactersByProjectId,
  updateCharacterById,
} from '@/shared/models/character';
import {
  findGenerationTasksByTargetId,
  GenerationTask,
  updateGenerationTaskById,
} from '@/shared/models/generation_task';
import { findProjectById, updateProjectById } from '@/shared/models/project';
import { updateStoryboardById } from '@/shared/models/storyboard';
import { getStorageService } from '@/shared/services/storage';

function extractResultUrls(data: any): string[] {
  if (!data) return [];

  if (Array.isArray(data.resultUrls)) {
    return data.resultUrls.filter(Boolean);
  }

  if (data.resultJson) {
    try {
      const parsed =
        typeof data.resultJson === 'string'
          ? JSON.parse(data.resultJson)
          : data.resultJson;
      if (Array.isArray(parsed?.resultUrls)) {
        return parsed.resultUrls.filter(Boolean);
      }
    } catch {
      // ignore parse errors
    }
  }

  if (data.taskResult) {
    return extractResultUrls(data.taskResult);
  }

  if (data.taskInfo?.images) {
    return data.taskInfo.images.map((img: any) => img.imageUrl).filter(Boolean);
  }

  if (data.taskInfo?.videos) {
    return data.taskInfo.videos.map((vid: any) => vid.videoUrl).filter(Boolean);
  }

  return [];
}

export function mapKieStatus(status: string) {
  switch (status) {
    case AITaskStatus.PENDING:
    case 'waiting':
    case 'queuing':
    case 'pending':
      return 'pending';
    case AITaskStatus.PROCESSING:
    case 'generating':
    case 'processing':
      return 'processing';
    case AITaskStatus.SUCCESS:
    case 'success':
      return 'success';
    case AITaskStatus.FAILED:
    case 'fail':
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

export async function downloadAndUploadToR2(
  url: string,
  {
    bucket = process.env.R2_BUCKET_NAME || 'ai-animie',
    key,
    contentType,
  }: { bucket?: string; key: string; contentType?: string }
) {
  const storage = await getStorageService();
  const result = await storage.downloadAndUpload({
    url,
    key,
    bucket,
    contentType,
    disposition: 'inline',
  });

  if (!result.success) {
    throw new Error(result.error || 'upload to R2 failed');
  }

  return result.url || result.location || '';
}

export async function handleTaskSuccess(task: GenerationTask, result: any) {
  const resultUrls = extractResultUrls(result);
  if (!resultUrls.length) {
    throw new Error('no result urls');
  }

  const primaryUrl = resultUrls[0];
  let key = '';
  let contentType = 'image/png';

  if (task.targetType === 'cover') {
    key = `covers/${task.projectId}/${Date.now()}_${nanoid()}.png`;
  } else if (task.targetType === 'character') {
    key = `characters/${task.projectId}/${task.targetId}_${nanoid()}.png`;
  } else if (task.targetType === 'storyboard_image') {
    key = `storyboards/${task.projectId}/images/${task.targetId}_${nanoid()}.png`;
  } else if (task.targetType === 'storyboard_video') {
    key = `storyboards/${task.projectId}/videos/${task.targetId}_${nanoid()}.mp4`;
    contentType = 'video/mp4';
  }

  const storedUrl = await downloadAndUploadToR2(primaryUrl, {
    bucket: process.env.R2_BUCKET_NAME || 'ai-animie',
    key,
    contentType,
  });

  await updateGenerationTaskById(task.id, {
    status: 'success',
    resultUrl: primaryUrl,
    storedUrl,
    callbackReceivedAt: new Date(),
    callbackData: result,
  });

  if (task.targetType === 'cover') {
    await updateProjectById(task.targetId, { coverImageUrl: storedUrl });
  } else if (task.targetType === 'character') {
    await updateCharacterById(task.targetId, {
      imageUrl: storedUrl,
      status: 'ready',
      taskError: null,
    });
  } else if (task.targetType === 'storyboard_image') {
    await updateStoryboardById(task.targetId, {
      imageUrl: storedUrl,
      imageStatus: 'ready',
      imageError: null,
    });
  } else if (task.targetType === 'storyboard_video') {
    await updateStoryboardById(task.targetId, {
      videoUrl: storedUrl,
      videoStatus: 'ready',
      videoError: null,
    });
  }

  if (task.projectId) {
    await checkAndUpdateProjectInitStatus(task.projectId);
  }

  return storedUrl;
}

export async function handleTaskTimeout(task: GenerationTask) {
  await updateGenerationTaskById(task.id, {
    status: 'timeout',
    errorMessage: 'timeout',
  });

  if (task.targetType === 'character') {
    await updateCharacterById(task.targetId, {
      status: 'timeout',
      taskError: 'timeout',
    });
  } else if (task.targetType === 'storyboard_image') {
    await updateStoryboardById(task.targetId, {
      imageStatus: 'timeout',
      imageError: 'timeout',
    });
  } else if (task.targetType === 'storyboard_video') {
    await updateStoryboardById(task.targetId, {
      videoStatus: 'timeout',
      videoError: 'timeout',
    });
  }

  if (task.projectId) {
    await checkAndUpdateProjectInitStatus(task.projectId);
  }
}

export async function checkAndUpdateProjectInitStatus(projectId: string) {
  const project = await findProjectById(projectId, { includeDeleted: true });
  if (!project) return;
  if (project.status !== 'initializing') return;

  const [characters, coverTasks] = await Promise.all([
    findCharactersByProjectId(projectId),
    findGenerationTasksByTargetId('cover', projectId),
  ]);

  const latestCoverTask = coverTasks.length
    ? coverTasks[coverTasks.length - 1]
    : null;

  const coverFailed =
    latestCoverTask && ['failed', 'timeout'].includes(latestCoverTask.status);
  const coverReady =
    !!project.coverImageUrl || latestCoverTask?.status === 'success';

  const hasFailure = characters.some((c) =>
    ['failed', 'timeout'].includes(c.status)
  );
  const allReady =
    characters.length > 0 && characters.every((c) => c.status === 'ready');

  if (coverFailed || hasFailure) {
    await updateProjectById(projectId, {
      status: 'draft',
      initStatus: 'failed',
      initError: 'image generation failed',
    });
    return;
  }

  if (coverReady && allReady) {
    await updateProjectById(projectId, {
      status: 'ready',
      initStatus: 'completed',
      initError: null,
    });
  }
}
