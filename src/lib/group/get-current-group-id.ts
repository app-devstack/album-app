import db from '@/db';
import { groupMembers } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * クッキーの currentGroupId を検証し、現在のユーザーが実際に所属する場合のみ返す。
 * @description 別アカウントへの切り替えなどで古い値が残っていた場合は null を返す。
 */
export async function getValidatedGroupId(
  userId: string
): Promise<string | null> {
  const cookieStore = await cookies();
  const groupId = cookieStore.get('currentGroupId')?.value;
  if (!groupId) return null;

  const member = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });

  return member ? groupId : null;
}
