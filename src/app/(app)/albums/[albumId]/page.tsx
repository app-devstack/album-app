import AlbumDetailPage from '@/components/pages/AlbumDetailPage';

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { albumId } = await params;
  return <AlbumDetailPage albumId={albumId} />;
}
