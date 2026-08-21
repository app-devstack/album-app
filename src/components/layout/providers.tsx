
"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NativeQueueProcessedToast } from "@/components/layout/native-queue-processed-toast";
import { NativeSessionTokenSync } from "@/components/layout/native-session-token-sync";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeSessionTokenSync />
      <NativeQueueProcessedToast />
      {children}
    </QueryClientProvider>
  );
}
