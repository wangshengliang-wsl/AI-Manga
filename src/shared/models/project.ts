import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { project } from '@/config/db/schema';

export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type UpdateProject = Partial<Omit<NewProject, 'id' | 'createdAt' | 'userId'>>;

export async function createProject(data: NewProject) {
  const [result] = await db().insert(project).values(data).returning();
  return result;
}

export async function findProjectById(
  id: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
) {
  const [result] = await db()
    .select()
    .from(project)
    .where(
      and(eq(project.id, id), includeDeleted ? undefined : isNull(project.deletedAt))
    )
    .limit(1);

  return result;
}

export async function findProjectsByUserId(
  userId: string,
  {
    page = 1,
    pageSize = 20,
    status,
    includeDeleted = false,
  }: {
    page?: number;
    pageSize?: number;
    status?: string;
    includeDeleted?: boolean;
  } = {}
) {
  const result = await db()
    .select()
    .from(project)
    .where(
      and(
        eq(project.userId, userId),
        status ? eq(project.status, status) : undefined,
        includeDeleted ? undefined : isNull(project.deletedAt)
      )
    )
    .orderBy(desc(project.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return result;
}

export async function updateProjectById(id: string, data: UpdateProject) {
  const [result] = await db()
    .update(project)
    .set(data)
    .where(eq(project.id, id))
    .returning();

  return result;
}

export async function deleteProjectById(id: string) {
  const [result] = await db()
    .update(project)
    .set({ deletedAt: new Date(), status: 'archived' })
    .where(eq(project.id, id))
    .returning();

  return result;
}

export async function countProjectsByUserId(
  userId: string,
  {
    status,
    includeDeleted = false,
  }: { status?: string; includeDeleted?: boolean } = {}
) {
  const [result] = await db()
    .select({ count: count() })
    .from(project)
    .where(
      and(
        eq(project.userId, userId),
        status ? eq(project.status, status) : undefined,
        includeDeleted ? undefined : isNull(project.deletedAt)
      )
    )
    .limit(1);

  return result?.count || 0;
}
