'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { isNative } from '@/lib/native-bridge';
import {
  QUEUE_PROCESSED_BODY_TEMPLATE,
  QUEUE_PROCESSED_NOTIFICATION_TITLE,
} from '@/lib/upload-notification-constants';

/** Native の送信待ちキュー完了をトーストで表示する。 */
export function NativeQueueProcessedToast() {
  useEffect(() => {
    if (!isNative()) {
      return;
    }

    const onQueueProcessed = (e: Event) => {
      const detail = (e as CustomEvent<{ albumId: string; count: number }>)
        .detail;
      if (!detail || detail.count <= 0) {
        return;
      }

      toast({
        title: QUEUE_PROCESSED_NOTIFICATION_TITLE,
        description: QUEUE_PROCESSED_BODY_TEMPLATE.replace(
          '{count}',
          String(detail.count)
        ),
      });
    };

    window.addEventListener('native:queueProcessed', onQueueProcessed);
    return () => {
      window.removeEventListener('native:queueProcessed', onQueueProcessed);
    };
  }, []);

  return null;
}
