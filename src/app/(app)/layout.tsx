import { Header } from '@/components/layout/header';
import { GroupProvider } from '@/contexts/GroupContext';
import { auth } from '@/lib/auth/auth';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const groupId = cookieStore.get('currentGroupId')?.value ?? '';

  return (
    <GroupProvider initialGroupId={groupId}>
      <div className="min-h-screen bg-background">
        <Header user={session.user} />
        {children}
      </div>
    </GroupProvider>
  );
}
