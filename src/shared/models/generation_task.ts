import { and, asc, eq, inArray, isNull, lt, or } from 'drizzle-orm';

import { db } from '@/core/db';
import { generationTask } from '@/config/db/schema';

export type GenerationTask = typeof generationTask.$inferSelect;
export type NewGenerationTask = typeof generationTask.$inferInsert;
export type UpdateGenerationTask = Partial<
  Omit<NewGenerationTask, 'id' | 'createdAt' | 'userId'>
>;

export async function createGenerationTask(data: NewGenerationTask) {
  const [result] = await db().insert(generationTask).values(data).returning();
  return result;
}

export async function findGenerationTaskById(id: string) {
  const [result] = await db()
    .select()
    .from(generationTask)
    .where(eq(generationTask.id, id))
    .limit(1);
  return result;
}

export async function findGenerationTaskByTaskId(taskId: string) {
  const [result] = await db()
    .select()
    .from(generationTask)
    .where(eq(generationTask.taskId, taskId))
    .limit(1);
  return result;
}

export async function findGenerationTasksByTargetId(
  targetType: string,
  targetId: string
) {
  const result = await db()
    .select()
    .from(generationTask)
    .where(
      and(
        eq(generationTask.targetType, targetType),
        eq(generationTask.targetId, targetId)
      )
    )
    .orderBy(asc(generationTask.createdAt));
  return result;
}

export async function findPendingGenerationTasks({
  status = ['pending', 'processing'],
  lastPolledBefore,
  pollCountLessThan = 30,
  limit = 50,
}: {
  status?: string[];
  lastPolledBefore?: Date;
  pollCountLessThan?: number;
  limit?: number;
}) {
  const result = await db()
    .select()
    .from(generationTask)
    .where(
      and(
        status.length ? inArray(generationTask.status, status) : undefined,
        pollCountLessThan !== undefined
          ? lt(generationTask.pollCount, pollCountLessThan)
          : undefined,
        lastPolledBefore
          ? or(
              isNull(generationTask.lastPolledAt),
              lt(generationTask.lastPolledAt, lastPolledBefore)
            )
          : undefined
      )
    )
    .orderBy(asc(generationTask.createdAt))
    .limit(limit);

  return result;
}

export async function updateGenerationTaskById(
  id: string,
  data: UpdateGenerationTask
) {
  const [result] = await db()
    .update(generationTask)
    .set(data)
    .where(eq(generationTask.id, id))
    .returning();
  return result;
}
