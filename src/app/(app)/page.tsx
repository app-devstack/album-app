import GroupSelectPage from '@/components/pages/GroupSelectPage';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const groupId = cookieStore.get('currentGroupId')?.value;

  if (groupId) {
    redirect('/albums');
  }

  return <GroupSelectPage />;
}
