'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth/auth-client';
import { sendToNative } from '@/lib/native-bridge';

/** 既存セッションの Bearer トークンを Native シェルへ同期する。 */
export function NativeSessionTokenSync() {
  const { data } = authClient.useSession();
  const token = data?.session?.token;

  useEffect(() => {
    if (typeof token === 'string' && token.length > 0) {
      sendToNative({ type: 'SESSION_TOKEN', token });
    }
  }, [token]);

  return null;
}
