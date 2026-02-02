import { envConfigs } from '@/config';
import { AIMediaType } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import styles from '@/shared/styles/index.json';
import {
  findCharacterById,
  updateCharacterById,
} from '@/shared/models/character';
import { createGenerationTask } from '@/shared/models/generation_task';
import { findProjectById } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { getCharacterImagePrompt } from '@/shared/lib/ai-prompts';

interface StyleItem {
  id: number;
  prompt: string;
  name: string;
}

function buildTraitsText(traits: Record<string, any> | null | undefined) {
  if (!traits || typeof traits !== 'object') return '';
  const parts = [
    traits.gender ? `Gender: ${traits.gender}.` : '',
    traits.age ? `Age: ${traits.age}.` : '',
    traits.appearance ? `Appearance: ${traits.appearance}.` : '',
    traits.personality ? `Personality: ${traits.personality}.` : '',
    traits.clothing ? `Clothing: ${traits.clothing}.` : '',
  ];
  return parts.filter(Boolean).join(' ');
}

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { characterId, prompt } = await request.json();
    if (!characterId) {
      return respErr('characterId is required');
    }

    const character = await findCharacterById(characterId);
    if (!character) {
      return respErr('character not found');
    }

    if (character.userId !== user.id) {
      return respErr('no permission');
    }

    const project = await findProjectById(character.projectId);
    if (!project || project.userId !== user.id) {
      return respErr('project not found');
    }

    const style = (styles as StyleItem[]).find(
      (item) => item.id === project.styleId
    );
    if (!style) {
      return respErr('invalid styleId');
    }

    const traitsText = buildTraitsText(character.traits as any);
    const imagePrompt = prompt
      ? String(prompt).trim()
      : getCharacterImagePrompt(character.name, traitsText, style.prompt);

    const aiService = await getAIService();
    const provider = aiService.getProvider('kie');
    if (!provider) {
      return respErr('kie provider not configured');
    }

    const callbackSecret = process.env.KIE_CALLBACK_SECRET;
    const callbackUrl = `${envConfigs.app_url}/api/callback/kie/image${
      callbackSecret ? `?secret=${callbackSecret}` : ''
    }`;

    const result = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: 'nano-banana-pro',
        prompt: imagePrompt,
        options: {
          aspect_ratio: '1:1',
          resolution: '2K',
          output_format: 'png',
        },
        callbackUrl,
      },
    });

    await createGenerationTask({
      id: getUuid(),
      userId: user.id,
      projectId: project.id,
      targetType: 'character',
      targetId: character.id,
      taskId: result.taskId,
      model: 'nano-banana-pro',
      prompt: imagePrompt,
      options: {
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
      },
      status: result.taskStatus,
    });

    await updateCharacterById(character.id, {
      status: 'generating',
      taskId: result.taskId,
      taskError: null,
      imagePrompt,
    });

    return respData({
      taskId: result.taskId,
      status: result.taskStatus,
    });
  } catch (error: any) {
    console.log('regenerate character image failed:', error);
    return respErr(error.message || 'regenerate character image failed');
  }
}
