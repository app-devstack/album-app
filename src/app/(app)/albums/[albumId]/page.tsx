import AlbumDetailPage from '@/components/pages/AlbumDetailPage';
import { Loading } from '@/components/ui/loading';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { albumId } = await params;
  return (
    <Suspense fallback={<Loading message="アルバムを読み込み中..." />}>
      <AlbumDetailPage albumId={albumId} />
    </Suspense>
  );
}
