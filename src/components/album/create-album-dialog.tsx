'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGroupContext } from '@/contexts/GroupContext';
import { useCreateAlbum } from '@/hooks/fetchers/use-albums';
import { ACCENT_COLORS, type AccentColor } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Check, User, Users } from 'lucide-react';
import { useState } from 'react';
import { v7 as uuidv7 } from 'uuid';

interface CreateAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent: AccentColor;
  // onAlbumCreate: (album: Album) => void; // No longer needed as we use the hook directly
}

type AlbumType = 'personal' | 'family';

export function CreateAlbumDialog({
  open,
  onOpenChange,
  accent,
}: CreateAlbumDialogProps) {
  const { currentGroupId } = useGroupContext();
  const { mutateAsync: createAlbumMutation } = useCreateAlbum(currentGroupId);
  const [step, setStep] = useState<1 | 2>(1);
  const [albumType, setAlbumType] = useState<AlbumType>('personal');
  const [albumName, setAlbumName] = useState('');
  const [selectedAccent, setSelectedAccent] = useState<AccentColor>(accent);

  const accentConfig = ACCENT_COLORS.find((a) => a.id === accent)!;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setAlbumType('personal');
      setAlbumName('');
      setSelectedAccent(accent);
    }, 300);
  };

  const handleCreate = async () => {
    await createAlbumMutation({
      id: uuidv7(),
      title: albumName.trim() || '無題のアルバム',
      type: albumType,
      coverUrl: '',
      createdBy: '自分',
      groupId: currentGroupId,
      createdAt: new Date().toISOString().split('T')[0],
      ...(albumType === 'family' ? { memberName: '自分', sharedWith: [] } : {}),
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* 進捗バー */}
        <div className="h-0.5 bg-muted">
          <div
            className={cn(
              'h-full transition-all duration-500',
              accentConfig.bg,
              step === 1 ? 'w-1/2' : 'w-full'
            )}
          />
        </div>

        <div className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] text-muted-foreground font-medium tracking-widest uppercase">
                ステップ {step} / 2
              </span>
            </div>
            <DialogTitle className="font-sans text-lg font-medium">
              {step === 1 ? 'アルバムの種類を選ぶ' : 'アルバムの詳細'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {step === 1
                ? '誰のためのアルバムですか？'
                : 'アルバム名とカバー写真を設定してください。'}
            </DialogDescription>
          </DialogHeader>

          {/* ステップ 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {(['personal', 'family'] as AlbumType[]).map((type) => {
                const isSelected = albumType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setAlbumType(type)}
                    className={cn(
                      'relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 focus:outline-none',
                      isSelected
                        ? cn(accentConfig.border, accentConfig.bgLight)
                        : 'border-border hover:border-muted-foreground/40'
                    )}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <span
                        className={cn(
                          'absolute top-2.5 right-2.5 h-4 w-4 rounded-full flex items-center justify-center text-white',
                          accentConfig.bg
                        )}
                      >
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center',
                        isSelected ? accentConfig.bg : 'bg-muted'
                      )}
                    >
                      {type === 'personal' ? (
                        <User
                          size={18}
                          className={
                            isSelected ? 'text-white' : 'text-muted-foreground'
                          }
                        />
                      ) : (
                        <Users
                          size={18}
                          className={
                            isSelected ? 'text-white' : 'text-muted-foreground'
                          }
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isSelected ? accentConfig.text : 'text-foreground'
                        )}
                      >
                        {type === 'personal' ? '個人' : '家族・共有'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {type === 'personal' ? '自分だけ' : 'みんなとシェア'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ステップ 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* アルバム名 */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  アルバム名
                </label>
                <Input
                  placeholder="例：夏の家族旅行"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="focus-visible:ring-1 focus-visible:ring-offset-0"
                  autoFocus
                />
              </div>

              {/* テーマカラー（アルバム作成時はグローバルaccentを選択） */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest block mb-1.5">
                  テーマカラー
                </label>
                <div className="flex items-center gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedAccent(color.id)}
                      aria-label={`${color.label}を選ぶ`}
                      aria-pressed={selectedAccent === color.id}
                      className={cn(
                        'h-6 w-6 rounded-full transition-all focus:outline-none',
                        color.dot,
                        selectedAccent === color.id
                          ? 'ring-2 ring-offset-1 ring-foreground scale-110'
                          : 'hover:scale-105'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* フッター操作 */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-border">
            {step === 2 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="gap-1.5 text-muted-foreground"
              >
                <ArrowLeft size={13} />
                戻る
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-muted-foreground"
              >
                キャンセル
              </Button>
            )}

            {step === 1 ? (
              <Button
                size="sm"
                onClick={() => setStep(2)}
                className={cn(
                  'gap-1.5 text-white',
                  accentConfig.bg,
                  accentConfig.bgHover
                )}
              >
                次へ
                <ArrowRight size={13} />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleCreate}
                className={cn(
                  'gap-1.5 text-white',
                  accentConfig.bg,
                  accentConfig.bgHover
                )}
              >
                作成する
                <Check size={13} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
