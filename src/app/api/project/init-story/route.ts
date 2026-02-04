import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { project as projectTable } from '@/config/db/schema';
import { AIMediaType } from '@/extensions/ai';
import {
  getCharacterExtractionPrompt,
  getCharacterImagePrompt,
  getCoverImagePrompt,
  getStoryOutlinePrompt,
} from '@/shared/lib/ai-prompts';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import {
  createCharacters,
  updateCharacterById,
} from '@/shared/models/character';
import { createGenerationTask } from '@/shared/models/generation_task';
import { findProjectById, updateProjectById } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { callOpenRouter } from '@/shared/services/openrouter';
import styles from '@/shared/styles/index.json';

interface StyleItem {
  id: number;
  name: string;
  prompt: string;
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
  let targetProjectId: string | null = null;
  try {
    const { projectId } = await request.json();
    targetProjectId = projectId;
    if (!projectId) {
      return respErr('projectId is required');
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const project = await findProjectById(projectId);
    if (!project) {
      return respErr('project not found');
    }

    if (project.userId !== user.id) {
      return respErr('no permission');
    }

    if (
      project.status !== 'draft' ||
      !['pending', 'failed'].includes(project.initStatus || '')
    ) {
      return respData({
        message: 'project already initializing or ready',
        status: project.status,
        initStatus: project.initStatus,
      });
    }

    const [lockedProject] = await db()
      .update(projectTable)
      .set({
        status: 'initializing',
        initStatus: 'generating_outline',
        initError: null,
      })
      .where(
        and(
          eq(projectTable.id, projectId),
          eq(projectTable.userId, user.id),
          eq(projectTable.status, 'draft'),
          inArray(projectTable.initStatus, ['pending', 'failed'])
        )
      )
      .returning();

    if (!lockedProject) {
      return respData({
        message: 'project already initializing',
        status: project.status,
        initStatus: project.initStatus,
      });
    }

    const style = (styles as StyleItem[]).find(
      (item) => item.id === project.styleId
    );
    if (!style) {
      throw new Error('invalid styleId');
    }

    const outlinePrompt = getStoryOutlinePrompt(
      project.name,
      project.description || ''
    );
    const outlineResult = await callOpenRouter('', outlinePrompt, {
      model: 'google/gemini-3-flash-preview',
    });
    const storyOutline = outlineResult.content?.trim();
    if (!storyOutline) {
      throw new Error('story outline empty');
    }

    await updateProjectById(projectId, {
      storyOutline,
      initStatus: 'generating_characters',
    });

    const characterPrompt = getCharacterExtractionPrompt(
      storyOutline,
      style.name,
      style.prompt
    );
    const characterResult = await callOpenRouter('', characterPrompt, {
      model: 'google/gemini-3-flash-preview',
      responseFormat: 'json_object',
      parseJson: true,
    });

    const characterData = characterResult.parsedJson || {};
    const extractedCharacters = Array.isArray(characterData.characters)
      ? characterData.characters
      : [];

    if (!extractedCharacters.length) {
      throw new Error('no characters extracted');
    }

    const preparedCharacters = extractedCharacters
      .filter((character: any) => String(character?.name || '').trim())
      .map((character: any, index: number) => {
        const traits =
          character.traits && typeof character.traits === 'object'
            ? character.traits
            : null;
        const traitsText = buildTraitsText(traits || undefined);
        const name = String(character.name || '').trim();
        const imagePrompt = character.imagePrompt
          ? String(character.imagePrompt).trim()
          : getCharacterImagePrompt(name, traitsText, style.prompt);

        return {
          id: getUuid(),
          projectId,
          userId: user.id,
          name,
          description: character.description
            ? String(character.description).trim()
            : null,
          traits: traits || null,
          imagePrompt,
          status: 'pending',
          sortOrder: index + 1,
        };
      });

    if (!preparedCharacters.length) {
      throw new Error('no valid characters extracted');
    }

    const createdCharacters = await createCharacters(preparedCharacters);

    await updateProjectById(projectId, {
      initStatus: 'generating_cover',
    });

    const aiService = await getAIService();
    const provider = aiService.getProvider('kie');
    if (!provider) {
      throw new Error('kie provider not configured');
    }

    const callbackSecret = process.env.KIE_CALLBACK_SECRET;
    const callbackUrl = `${envConfigs.app_url}/api/callback/kie/image${
      callbackSecret ? `?secret=${callbackSecret}` : ''
    }`;

    const coverPrompt = getCoverImagePrompt(
      project.name,
      style.name,
      style.prompt,
      project.aspectRatio
    );

    const coverResult = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: 'nano-banana-pro',
        prompt: coverPrompt,
        options: {
          aspect_ratio: project.aspectRatio,
          resolution: '2K',
          output_format: 'png',
        },
        callbackUrl,
      },
    });

    await createGenerationTask({
      id: getUuid(),
      userId: user.id,
      projectId,
      targetType: 'cover',
      targetId: projectId,
      taskId: coverResult.taskId,
      model: 'nano-banana-pro',
      prompt: coverPrompt,
      options: {
        aspect_ratio: project.aspectRatio,
        resolution: '2K',
        output_format: 'png',
      },
      status: coverResult.taskStatus,
    });

    await Promise.all(
      createdCharacters.map(async (character, index) => {
        const imagePrompt = preparedCharacters[index]?.imagePrompt || '';
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
          projectId,
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
        });
      })
    );

    return respData({ message: 'init started' });
  } catch (error: any) {
    console.log('init story failed:', error);
    if (targetProjectId) {
      await updateProjectById(targetProjectId, {
        status: 'draft',
        initStatus: 'failed',
        initError: error.message || 'init failed',
      });
    }
    return respErr(error.message || 'init story failed');
  }
}
