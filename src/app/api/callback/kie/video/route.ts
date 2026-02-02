import { respOk, respErr } from '@/shared/lib/resp';
import {
  findGenerationTaskByTaskId,
  updateGenerationTaskById,
} from '@/shared/models/generation_task';
import { updateStoryboardById } from '@/shared/models/storyboard';
import { handleTaskSuccess } from '@/shared/services/callback-handler';

function verifySecret(request: Request) {
  const secret = process.env.KIE_CALLBACK_SECRET;
  if (!secret) return true;
  const headerSecret =
    request.headers.get('x-kie-callback-secret') ||
    request.headers.get('x-callback-secret');
  const querySecret = new URL(request.url).searchParams.get('secret');
  return secret === headerSecret || secret === querySecret;
}

export async function POST(request: Request) {
  try {
    if (!verifySecret(request)) {
      return respErr('unauthorized');
    }

    const data = await request.json();
    const taskId = data.taskId || data.task_id;
    if (!taskId) {
      return respErr('taskId is required');
    }

    const task = await findGenerationTaskByTaskId(taskId);
    if (!task) {
      return respOk();
    }

    if (['success', 'failed', 'timeout'].includes(task.status)) {
      return respOk();
    }

    if (data.state === 'fail') {
      await updateGenerationTaskById(task.id, {
        status: 'failed',
        errorCode: data.failCode,
        errorMessage: data.failMsg,
        callbackReceivedAt: new Date(),
        callbackData: data,
      });

      await updateStoryboardById(task.targetId, {
        videoStatus: 'failed',
        videoError: data.failMsg || 'failed',
      });

      return respOk();
    }

    await handleTaskSuccess(task, data);

    return respOk();
  } catch (error: any) {
    console.log('kie video callback failed:', error);
    return respErr(error.message || 'callback failed');
  }
}
