'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { isAlbumSortOrder } from '@/lib/album-sort-order';
import { cn } from '@/lib/utils';
import { useAlbumListStore } from '@/stores/albumListStore';
import { ArrowUpDown } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

type SortTriggerButtonProps = Omit<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'children'
>;

function SortTriggerButton({
  className,
  onClick,
  ref,
  ...rest
}: SortTriggerButtonProps) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0', className)}
      aria-label="アルバムの並び替え"
      onClick={onClick}
      {...rest}
    >
      <ArrowUpDown className="size-4" strokeWidth={2} />
    </Button>
  );
}

/** 作成日基準の一覧ソート。デスクトップはドロップダウン、モバイルはボトムシート。 */
export function AlbumGridSortControlButton() {
  const sortOrder = useAlbumListStore((s) => s.sortOrder);
  const setSortOrder = useAlbumListStore((s) => s.setSortOrder);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onSortChange = (value: string) => {
    if (isAlbumSortOrder(value)) {
      setSortOrder(value);
    }
  };

  if (isMobile) {
    return (
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
        }}
        direction="bottom"
      >
        <DrawerTrigger asChild>
          <SortTriggerButton />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>並び替え</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <RadioGroup
              className="gap-4"
              value={sortOrder}
              onValueChange={(v) => {
                onSortChange(v);
                setDrawerOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="created_desc" id="sort-created-desc" />
                <Label
                  htmlFor="sort-created-desc"
                  className="cursor-pointer font-normal"
                >
                  作成日（新しい順）
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="created_asc" id="sort-created-asc" />
                <Label
                  htmlFor="sort-created-asc"
                  className="cursor-pointer font-normal"
                >
                  作成日（古い順）
                </Label>
              </div>
            </RadioGroup>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SortTriggerButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>並び替え</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortOrder} onValueChange={onSortChange}>
          <DropdownMenuRadioItem value="created_desc">
            作成日（新しい順）
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created_asc">
            作成日（古い順）
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
