import { AIMediaType } from '@/extensions/ai';
import { respData, respErr } from '@/shared/lib/resp';
import { updateCharacterById } from '@/shared/models/character';
import {
  findPendingGenerationTasks,
  updateGenerationTaskById,
} from '@/shared/models/generation_task';
import { updateStoryboardById } from '@/shared/models/storyboard';
import { getAIService } from '@/shared/services/ai';
import {
  checkAndUpdateProjectInitStatus,
  handleTaskSuccess,
  handleTaskTimeout,
  mapKieStatus,
} from '@/shared/services/callback-handler';

function verifySecret(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const headerSecret =
    request.headers.get('x-cron-secret') || request.headers.get('x-cron');
  const querySecret = new URL(request.url).searchParams.get('secret');
  return secret === headerSecret || secret === querySecret;
}

export async function POST(request: Request) {
  try {
    if (!verifySecret(request)) {
      return respErr('unauthorized');
    }

    const now = new Date();
    const lastPolledBefore = new Date(now.getTime() - 50 * 1000);

    const pendingTasks = await findPendingGenerationTasks({
      status: ['pending', 'processing'],
      lastPolledBefore,
      pollCountLessThan: 30,
      limit: 50,
    });

    if (!pendingTasks.length) {
      return respData({ handled: 0 });
    }

    const aiService = await getAIService();
    const provider = aiService.getProvider('kie') as any;
    if (!provider?.query) {
      return respErr('kie provider not configured');
    }
    if (provider?.configs) {
      provider.configs.customStorage = false;
    }

    let handled = 0;

    for (const task of pendingTasks) {
      const mediaType =
        task.targetType === 'storyboard_video'
          ? AIMediaType.VIDEO
          : AIMediaType.IMAGE;

      const result = await provider.query({
        taskId: task.taskId,
        mediaType,
      });

      const mappedStatus = mapKieStatus(result.taskStatus as any);

      await updateGenerationTaskById(task.id, {
        status: mappedStatus,
        pollCount: (task.pollCount || 0) + 1,
        lastPolledAt: new Date(),
        errorCode: result.taskInfo?.errorCode,
        errorMessage: result.taskInfo?.errorMessage,
      });

      if (mappedStatus === 'success') {
        await handleTaskSuccess(task, result);
      } else if (mappedStatus === 'failed') {
        await updateGenerationTaskById(task.id, {
          status: 'failed',
          errorCode: result.taskInfo?.errorCode,
          errorMessage: result.taskInfo?.errorMessage,
        });
        if (task.targetType === 'character') {
          await updateCharacterById(task.targetId, {
            status: 'failed',
            taskError: result.taskInfo?.errorMessage || 'failed',
          });
        } else if (task.targetType === 'storyboard_image') {
          await updateStoryboardById(task.targetId, {
            imageStatus: 'failed',
            imageError: result.taskInfo?.errorMessage || 'failed',
          });
        } else if (task.targetType === 'storyboard_video') {
          await updateStoryboardById(task.targetId, {
            videoStatus: 'failed',
            videoError: result.taskInfo?.errorMessage || 'failed',
          });
        }
        if (task.projectId) {
          await checkAndUpdateProjectInitStatus(task.projectId);
        }
      }

      if ((task.pollCount || 0) + 1 >= 30 && mappedStatus !== 'success') {
        await handleTaskTimeout(task);
      }

      handled += 1;
    }

    return respData({ handled });
  } catch (error: any) {
    console.log('poll tasks failed:', error);
    return respErr(error.message || 'poll tasks failed');
  }
}
