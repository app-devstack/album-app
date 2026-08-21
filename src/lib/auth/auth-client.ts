import { sendToNative } from '@/lib/native-bridge';
import { createAuthClient } from 'better-auth/react';

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (typeof window !== 'undefined' ? window.location.origin : undefined);

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get('set-auth-token');
      if (authToken) {
        sendToNative({ type: 'SESSION_TOKEN', token: authToken });
      }
    },
  },
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
