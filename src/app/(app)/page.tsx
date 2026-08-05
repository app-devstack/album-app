import GroupSelectPage from '@/components/pages/GroupSelectPage';
import { auth } from '@/lib/auth/auth';
import { getValidatedGroupId } from '@/lib/group/get-current-group-id';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ enableGroupSelect?: string }>;
}) {
  const [session, params] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ]);
  const groupId = session ? await getValidatedGroupId(session.user.id) : null;

  if (groupId && params.enableGroupSelect !== 'true') {
    redirect('/albums');
  }

  return <GroupSelectPage />;
}
