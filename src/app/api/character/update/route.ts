import { respData, respErr } from '@/shared/lib/resp';
import {
  findCharacterById,
  updateCharacterById,
  UpdateCharacter,
} from '@/shared/models/character';
import { findProjectById } from '@/shared/models/project';
import { getUserInfo } from '@/shared/models/user';

export async function POST(request: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const { characterId, name, description, traits } = await request.json();
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

    if (character.projectId) {
      const project = await findProjectById(character.projectId);
      if (!project || project.userId !== user.id) {
        return respErr('no permission');
      }
    }

    const update: UpdateCharacter = {
      ...(name ? { name: String(name).trim() } : null),
      ...(description !== undefined
        ? { description: description ? String(description).trim() : null }
        : null),
      ...(traits !== undefined ? { traits } : null),
    };

    if (Object.keys(update).length === 0) {
      return respErr('no valid fields to update');
    }

    const updated = await updateCharacterById(characterId, update);

    return respData(updated);
  } catch (error: any) {
    console.log('update character failed:', error);
    return respErr(error.message || 'update character failed');
  }
}
