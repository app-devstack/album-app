'use client';

import { Memo } from '@/db/schema';
import {
  useCreateMemo,
  useDeleteMemo,
  useMemos,
  useUpdateMemo,
} from '@/hooks/fetchers/use-memos';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AddMemoInput {
  body: string;
  mood?: string;
}

type EditMemoInput = Partial<Memo> & { id: string };

interface AlbumMemoContextValue {
  memos: Memo[];
  isLoadingMemos: boolean;
  isComposerOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
  editingMemoId: string | null;
  setEditingMemoId: (id: string | null) => void;
  addMemo: (input: AddMemoInput) => Promise<Memo>;
  editMemo: (input: EditMemoInput) => Promise<Memo>;
  removeMemo: (id: string) => Promise<{ message: string }>;
}

const AlbumMemoContext = createContext<AlbumMemoContextValue | undefined>(
  undefined
);

interface AlbumMemoProviderProps {
  albumId: string;
  children: ReactNode;
}

export function AlbumMemoProvider({
  albumId,
  children,
}: AlbumMemoProviderProps) {
  const { data: memos = [], isLoading: isLoadingMemos } = useMemos(albumId);
  const { mutateAsync: createMemoMutation } = useCreateMemo();
  const { mutateAsync: updateMemoMutation } = useUpdateMemo();
  const { mutateAsync: deleteMemoMutation } = useDeleteMemo();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  useEffect(() => {
    setIsComposerOpen(false);
    setEditingMemoId(null);
  }, [albumId]);

  const openComposer = useCallback(() => {
    setIsComposerOpen(true);
  }, []);

  const closeComposer = useCallback(() => {
    setIsComposerOpen(false);
  }, []);

  const addMemo = useCallback(
    async ({ body, mood }: AddMemoInput) => {
      return createMemoMutation({
        albumId,
        body,
        mood: mood ?? null,
      });
    },
    [albumId, createMemoMutation]
  );

  const editMemo = useCallback(
    async (input: EditMemoInput) => {
      return updateMemoMutation(input);
    },
    [updateMemoMutation]
  );

  const removeMemo = useCallback(
    async (id: string) => {
      return deleteMemoMutation(id);
    },
    [deleteMemoMutation]
  );

  const value = useMemo(
    () => ({
      memos,
      isLoadingMemos,
      isComposerOpen,
      openComposer,
      closeComposer,
      editingMemoId,
      setEditingMemoId,
      addMemo,
      editMemo,
      removeMemo,
    }),
    [
      memos,
      isLoadingMemos,
      isComposerOpen,
      openComposer,
      closeComposer,
      editingMemoId,
      addMemo,
      editMemo,
      removeMemo,
    ]
  );

  return (
    <AlbumMemoContext.Provider value={value}>
      {children}
    </AlbumMemoContext.Provider>
  );
}

export function useAlbumMemoContext() {
  const context = useContext(AlbumMemoContext);
  if (!context) {
    throw new Error(
      'useAlbumMemoContext must be used within an AlbumMemoProvider'
    );
  }
  return context;
}
