/**
 * realtimeManager.ts
 *
 * Centralised singleton for Supabase realtime subscriptions.
 * Reuses the shared supabase client from @/lib/supabase so the browser
 * never opens more than one WebSocket connection.
 *
 * Subscriptions are keyed by channel name, meaning they survive component
 * unmounts and are never duplicated even if multiple components call
 * subscribeToTerminalChat with the same userId.
 */

import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Internal subscription registry ──────────────────────────────────────────

interface SubscriptionRegistry {
  terminalChat: RealtimeChannel | null;
  terminalChatCallbacks: Array<(msg: any) => void>;
}

const registry: SubscriptionRegistry = {
  terminalChat: null,
  terminalChatCallbacks: [],
};

// ─── Terminal Chat ────────────────────────────────────────────────────────────

export const realtimeManager = {
  /**
   * Subscribe to new terminal_chats rows for a given user.
   * If a subscription already exists it is reused; the new callback is added
   * to the existing channel's callback list.
   */
  subscribeToTerminalChat(
    channelKey: string,
    onMessage: (msg: any) => void
  ): RealtimeChannel {
    // Register the callback regardless of whether the channel is new or reused
    registry.terminalChatCallbacks.push(onMessage);

    if (registry.terminalChat) {
      // Channel already open – nothing more to do
      return registry.terminalChat;
    }

    const channel = supabase
      .channel(`terminal_chat_${channelKey}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "terminal_chats",
        },
        (payload) => {
          // Fan out to every registered callback
          registry.terminalChatCallbacks.forEach((cb) => {
            try {
              cb(payload.new);
            } catch (err) {
              console.error("[realtimeManager] callback error:", err);
            }
          });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[realtimeManager] terminal chat channel error");
        }
      });

    registry.terminalChat = channel;
    return channel;
  },

  /**
   * Remove a previously registered callback.
   * If no callbacks remain the underlying channel is closed.
   */
  async unsubscribeFromTerminalChat(
    onMessage: (msg: any) => void
  ): Promise<void> {
    registry.terminalChatCallbacks = registry.terminalChatCallbacks.filter(
      (cb) => cb !== onMessage
    );

    if (
      registry.terminalChatCallbacks.length === 0 &&
      registry.terminalChat
    ) {
      await supabase.removeChannel(registry.terminalChat);
      registry.terminalChat = null;
    }
  },

  /**
   * Force-close the terminal chat channel (e.g. on sign-out).
   */
  async closeTerminalChat(): Promise<void> {
    if (registry.terminalChat) {
      await supabase.removeChannel(registry.terminalChat);
      registry.terminalChat = null;
      registry.terminalChatCallbacks = [];
    }
  },

  getTerminalChatChannel(): RealtimeChannel | null {
    return registry.terminalChat;
  },
};
