import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { character } from '@/config/db/schema';

export type Character = typeof character.$inferSelect;
export type NewCharacter = typeof character.$inferInsert;
export type UpdateCharacter = Partial<
  Omit<NewCharacter, 'id' | 'createdAt' | 'userId'>
>;

export async function createCharacter(data: NewCharacter) {
  const [result] = await db().insert(character).values(data).returning();
  return result;
}

export async function createCharacters(data: NewCharacter[]) {
  if (!data.length) return [];
  const result = await db().insert(character).values(data).returning();
  return result;
}

export async function findCharacterById(id: string) {
  const [result] = await db()
    .select()
    .from(character)
    .where(and(eq(character.id, id), isNull(character.deletedAt)))
    .limit(1);
  return result;
}

export async function findCharactersByProjectId(projectId: string) {
  const result = await db()
    .select()
    .from(character)
    .where(and(eq(character.projectId, projectId), isNull(character.deletedAt)))
    .orderBy(asc(character.sortOrder));
  return result;
}

export async function findCharactersByIds(ids: string[]) {
  if (!ids.length) return [];
  const result = await db()
    .select()
    .from(character)
    .where(and(inArray(character.id, ids), isNull(character.deletedAt)));
  return result;
}

export async function updateCharacterById(id: string, data: UpdateCharacter) {
  const [result] = await db()
    .update(character)
    .set(data)
    .where(eq(character.id, id))
    .returning();
  return result;
}

export async function deleteCharacterById(id: string) {
  const [result] = await db()
    .update(character)
    .set({ deletedAt: new Date() })
    .where(eq(character.id, id))
    .returning();
  return result;
}
