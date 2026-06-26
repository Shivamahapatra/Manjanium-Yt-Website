"use client";

/**
 * TerminalChat.tsx
 *
 * Changes from previous version:
 *  1. Subscription via realtimeManager – no inline supabase.channel() so
 *     subscriptions survive component unmounts without leaking.
 *  2. Mobile responsive – the fixed sidebar is hidden below lg breakpoint.
 *     A floating 💬 FAB appears on mobile and opens a vaul bottom drawer.
 *  3. All existing functionality preserved: slash commands (/predict, /stats,
 *     /compare, /help), Supabase INSERT, optimistic updates, scroll-to-bottom.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { realtimeManager } from "@/lib/realtimeManager";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  TerminalSquare,
  BarChart2,
  GitCompare,
  HelpCircle,
  X,
  MessageSquare,
} from "lucide-react";
import { Drawer } from "vaul";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TerminalMessage {
  id?: string;
  created_at?: string;
  user_id?: string | null;
  username: string;
  message_text: string;
  context: "f1" | "football";
  type: "user" | "system" | "command_response";
}

export interface TerminalChatProps {
  context: "f1" | "football";
  className?: string;
}

// ─── Slash-command registry ───────────────────────────────────────────────────

const SLASH_COMMANDS = [
  {
    command: "/predict",
    desc: "Log prediction (e.g. /predict P1 VER)",
    icon: <TerminalSquare className="w-3 h-3" />,
  },
  {
    command: "/stats",
    desc: "Show stats (e.g. /stats HAM)",
    icon: <BarChart2 className="w-3 h-3" />,
  },
  {
    command: "/compare",
    desc: "Compare entities (e.g. /compare VER HAM)",
    icon: <GitCompare className="w-3 h-3" />,
  },
  {
    command: "/help",
    desc: "Show available commands",
    icon: <HelpCircle className="w-3 h-3" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TerminalChat({ context, className = "" }: TerminalChatProps) {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Wait for document to be available (portal requirement)
  useEffect(() => {
    setMounted(true);
  }, []);

  const username =
    isLoaded && user
      ? user.username || user.firstName?.toLowerCase() || "user"
      : "guest";
  const promptText = `${username}@manjanium-core:~$`;

  // ── Auto-scroll to latest message ──────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Initial message fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("terminal_chats")
        .select("*")
        .eq("context", context)
        .order("created_at", { ascending: true })
        .limit(50);

      if (!error && data) {
        setMessages(data as TerminalMessage[]);
      }
    };
    fetchMessages();
  }, [context]);

  // ── Realtime subscription via realtimeManager ──────────────────────────────
  // Using a stable callback reference so unsubscription is accurate.
  const handleNewMessage = useCallback(
    (payload: any) => {
      // Only handle messages matching this context
      if (payload.context !== context) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload as TerminalMessage];
      });
    },
    [context]
  );

  useEffect(() => {
    const channelKey = user?.id || context;
    realtimeManager.subscribeToTerminalChat(channelKey, handleNewMessage);

    return () => {
      realtimeManager.unsubscribeFromTerminalChat(handleNewMessage);
    };
  }, [context, user?.id, handleNewMessage]);

  // ── Slash-command handler ──────────────────────────────────────────────────
  const executeCommand = async (cmdString: string) => {
    const args = cmdString.split(" ");
    const cmd = args[0];

    let responseText = "";
    if (cmd === "/predict") {
      responseText = `PREDICTION LOGGED: ${args.slice(1).join(" ") || "N/A"} – Waiting for official results.`;
    } else if (cmd === "/stats") {
      responseText = `STATS RETRIEVED: Entity '${args[1] || "N/A"}' – Updating dashboard...`;
    } else if (cmd === "/compare") {
      responseText = `COMPARING: '${args[1] || "?"}' vs '${args[2] || "?"}' – See Head-to-Head panel.`;
    } else if (cmd === "/help") {
      responseText = `AVAILABLE COMMANDS: /predict, /stats, /compare, /help`;
    } else {
      responseText = `ERROR: Command not found: ${cmd}`;
    }

    const commandResponseMsg: TerminalMessage = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: "system",
      username: "SYSTEM",
      message_text: responseText,
      context,
      type: "command_response",
    };

    setMessages((prev) => {
      if (prev.some((m) => m.id === commandResponseMsg.id)) return prev;
      return [...prev, commandResponseMsg];
    });

    await supabase.from("terminal_chats").insert([commandResponseMsg]);
  };

  // ── Input handlers ─────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowCommands(val.startsWith("/"));
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !inputValue.trim()) return;

    const isCommand = inputValue.trim().startsWith("/");
    const messageText = inputValue.trim();

    const newMsg: TerminalMessage = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: user?.id || null,
      username,
      message_text: messageText,
      context,
      type: "user",
    };

    setInputValue("");
    setShowCommands(false);

    // Optimistic update
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    const { error } = await supabase.from("terminal_chats").insert([newMsg]);

    if (error) {
      console.error("[TerminalChat] Failed to insert message:", error);
    } else if (isCommand) {
      await executeCommand(messageText);
    }
  };

  // ── Shared chat content (rendered in both desktop panel and mobile drawer) ─
  const ChatContent = (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(var(--color-primary), 0.3) transparent",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className="break-words leading-relaxed">
            {msg.type === "system" ? (
              <span className="text-[#ff5555] font-semibold text-xs">
                [
                {msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "SYS"}
                ]: {msg.message_text}
              </span>
            ) : msg.type === "command_response" ? (
              <span className="text-secondary/90 font-bold text-xs">
                {">"} {msg.message_text}
              </span>
            ) : (
              <span className="text-xs">
                <span className="text-success">
                  {msg.username}@manjanium-core:~$
                </span>{" "}
                <span className="text-gray-300">{msg.message_text}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="relative p-4 border-t border-primary/20 shrink-0 bg-[#0a0a0a]">
        <AnimatePresence>
          {showCommands && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 w-full bg-[#0f0f0f] border-t border-primary/30 p-2 z-10 shadow-lg"
            >
              <div className="text-primary/70 text-xs mb-2 font-bold px-2 uppercase tracking-wider">
                Available Commands
              </div>
              <div className="space-y-1">
                {SLASH_COMMANDS.map((cmd) => (
                  <div
                    key={cmd.command}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-primary/20 rounded cursor-pointer text-gray-300 transition-colors"
                    onClick={() => {
                      setInputValue(cmd.command + " ");
                      setShowCommands(false);
                    }}
                  >
                    <span className="text-secondary">{cmd.icon}</span>
                    <span className="text-success font-bold text-xs">
                      {cmd.command}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      – {cmd.desc}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center font-mono text-xs">
          <span className="text-success mr-2 shrink-0 hidden sm:inline">
            {promptText}
          </span>
          <span className="text-success mr-2 shrink-0 sm:hidden">~$:</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Type a message..." : "Login to chat..."}
            disabled={!user}
            className="flex-1 bg-transparent text-gray-200 outline-none caret-success placeholder:text-gray-600"
          />
        </div>
      </div>
    </div>
  );

  // ── Portal guard ───────────────────────────────────────────────────────────
  if (!mounted) return null;

  const widget = (
    <>
      {/* ── DESKTOP: fixed sidebar (lg and above) ───────────────────────── */}
      <div
        className={`
          hidden lg:flex
          fixed top-24 right-4 z-[100]
          flex-col
          w-[320px] xl:w-[380px]
          h-[calc(100vh-110px)]
          bg-[#0a0a0a]/95 backdrop-blur-md
          border border-primary/20
          rounded-xl overflow-hidden
          font-mono text-xs shadow-[0_0_30px_rgba(0,0,0,0.8)]
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 shrink-0">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>Manjanium OS Terminal</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(var(--color-success),0.8)]" />
        </div>

        {ChatContent}
      </div>

      {/* ── MOBILE: floating action button (below lg) ────────────────────── */}
      <button
        aria-label="Open Terminal Chat"
        onClick={() => setMobileOpen(true)}
        className="
          lg:hidden
          fixed bottom-6 right-6 z-[100]
          w-14 h-14
          bg-primary text-background
          rounded-full
          flex items-center justify-center
          shadow-lg
          hover:scale-105 active:scale-95
          transition-transform
        "
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* ── MOBILE: vaul bottom drawer (below lg) ────────────────────────── */}
      <Drawer.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-[110] backdrop-blur-sm" />
          <Drawer.Content
            className="
              fixed bottom-0 left-0 right-0 z-[120]
              bg-[#0a0a0a]
              border-t border-primary/20
              rounded-t-2xl
              flex flex-col
              max-h-[85dvh]
              font-mono text-xs
              outline-none
            "
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 shrink-0">
              <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs">
                <Terminal className="w-3.5 h-3.5" />
                <span>Manjanium OS Terminal</span>
              </div>
              <button
                aria-label="Close Terminal Chat"
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body – same chat content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {ChatContent}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );

  return createPortal(widget, document.body);
}

export default TerminalChat;
