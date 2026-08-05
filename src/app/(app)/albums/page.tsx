import AlbumsPage from '@/components/pages/AlbumsPage';
import { auth } from '@/lib/auth/auth';
import { getValidatedGroupId } from '@/lib/group/get-current-group-id';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Albums() {
  const session = await auth.api.getSession({ headers: await headers() });
  const groupId = session ? await getValidatedGroupId(session.user.id) : null;

  if (!groupId) {
    redirect('/');
  }

  return <AlbumsPage />;
}
