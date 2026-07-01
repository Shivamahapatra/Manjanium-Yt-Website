"use client";

/**
 * TerminalChatProvider.tsx
 *
 * Mounts the Supabase realtime subscription for terminal_chats once at
 * application level. This prevents orphan subscriptions that occur when the
 * TerminalChat component is rendered inside route pages that unmount and
 * remount on navigation.
 *
 * The provider itself does not render any UI – it is a side-effect boundary.
 */

import { useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { realtimeManager } from "@/lib/realtimeManager";

export function TerminalChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();

  // Stable callback reference so unsubscription matches the registration
  const handleMessage = useCallback((message: any) => {
    // Root-level handler intentionally a no-op.
    // Per-component callbacks are registered separately via realtimeManager.
    // This call ensures the channel stays open even when all UI components
    // are temporarily unmounted during page transitions.
    void message;
  }, []);

  useEffect(() => {
    if (!userId) return;

    realtimeManager.subscribeToTerminalChat(userId, handleMessage);

    return () => {
      // On sign-out or unmount, remove only this provider's callback.
      // The channel stays open as long as other callbacks are registered.
      realtimeManager.unsubscribeFromTerminalChat(handleMessage);
    };
  }, [userId, handleMessage]);

  return <>{children}</>;
}
