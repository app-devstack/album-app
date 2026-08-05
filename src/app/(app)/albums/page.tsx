import AlbumsPage from '@/components/pages/AlbumsPage';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Albums() {
  const cookieStore = await cookies();
  const groupId = cookieStore.get('currentGroupId')?.value;

  if (!groupId) {
    redirect('/');
  }

  return <AlbumsPage />;
}
