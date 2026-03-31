'use client';
import GroupSettingsPage from '@/components/pages/GroupSettingsPage';
import { use } from 'react';

interface PageProps {
  params: Promise<{ groupId: string }>;
}
export default function Page({ params }: PageProps) {
  const { groupId } = use(params);

  return <GroupSettingsPage groupId={groupId} />;
}
