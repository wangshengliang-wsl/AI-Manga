import { and, asc, count, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { storyboard } from '@/config/db/schema';

export type Storyboard = typeof storyboard.$inferSelect;
export type NewStoryboard = typeof storyboard.$inferInsert;
export type UpdateStoryboard = Partial<Omit<NewStoryboard, 'id' | 'createdAt' | 'userId'>>;

export async function createStoryboard(data: NewStoryboard) {
  const [result] = await db().insert(storyboard).values(data).returning();
  return result;
}

export async function createStoryboards(data: NewStoryboard[]) {
  if (!data.length) return [];
  const result = await db().insert(storyboard).values(data).returning();
  return result;
}

export async function findStoryboardById(id: string) {
  const [result] = await db()
    .select()
    .from(storyboard)
    .where(and(eq(storyboard.id, id), isNull(storyboard.deletedAt)))
    .limit(1);
  return result;
}

export async function findStoryboardsByProjectId(projectId: string) {
  const result = await db()
    .select()
    .from(storyboard)
    .where(and(eq(storyboard.projectId, projectId), isNull(storyboard.deletedAt)))
    .orderBy(asc(storyboard.sortOrder));
  return result;
}

export async function updateStoryboardById(id: string, data: UpdateStoryboard) {
  const [result] = await db()
    .update(storyboard)
    .set(data)
    .where(eq(storyboard.id, id))
    .returning();
  return result;
}

export async function deleteStoryboardById(id: string) {
  const [result] = await db()
    .update(storyboard)
    .set({ deletedAt: new Date() })
    .where(eq(storyboard.id, id))
    .returning();
  return result;
}

export async function countStoryboardsByProjectId(projectId: string) {
  const [result] = await db()
    .select({ count: count() })
    .from(storyboard)
    .where(and(eq(storyboard.projectId, projectId), isNull(storyboard.deletedAt)))
    .limit(1);
  return result?.count || 0;
}
