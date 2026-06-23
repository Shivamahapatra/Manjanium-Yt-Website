"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, TerminalSquare, Info, BarChart2, GitCompare, HelpCircle } from "lucide-react";

export interface TerminalMessage {
  id?: string;
  created_at?: string;
  user_id?: string | null;
  username: string;
  message_text: string;
  context: "f1" | "football";
  type: "user" | "system" | "command_response";
}

interface TerminalChatProps {
  context: "f1" | "football";
  className?: string;
}

const SLASH_COMMANDS = [
  { command: "/predict", desc: "Log prediction (e.g. /predict P1 VER)", icon: <TerminalSquare className="w-3 h-3" /> },
  { command: "/stats", desc: "Show stats (e.g. /stats HAM)", icon: <BarChart2 className="w-3 h-3" /> },
  { command: "/compare", desc: "Compare entities (e.g. /compare VER HAM)", icon: <GitCompare className="w-3 h-3" /> },
  { command: "/help", desc: "Show available commands", icon: <HelpCircle className="w-3 h-3" /> },
];

export function TerminalChat({ context, className = "" }: TerminalChatProps) {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const username = isLoaded && user ? user.username || user.firstName?.toLowerCase() || "user" : "guest";
  const promptText = `${username}@manjanium-core:~$`;

  useEffect(() => {
    // Initial fetch
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

    // Set up Realtime subscription
    const subscription = supabase
      .channel(`terminal_${context}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "terminal_chats", filter: `context=eq.${context}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as TerminalMessage];
          });
        }
      )
      .subscribe();

    // Mock System Data Generator
    const systemInterval = setInterval(() => {
      const mockSystemMsgs = context === 'f1' ? [
        "WARNING: Track Limits - Car 4 (NOR).",
        "INFO: Pit Window Open.",
        "DRS ENABLED."
      ] : [
        "GOAL: ARG 1 - 0 BRA (Messi 45')",
        "VAR CHECK: Possible Penalty.",
        "SUB: IN - #10, OUT - #8."
      ];
      
      const randomMsg = mockSystemMsgs[Math.floor(Math.random() * mockSystemMsgs.length)];
      
      const newSysMsg: TerminalMessage = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        username: "SYSTEM",
        message_text: randomMsg,
        context: context,
        type: "system"
      };

      setMessages(prev => [...prev, newSysMsg]);
    }, 45000); // every 45s a system log appears for effect

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(systemInterval);
    };
  }, [context]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.startsWith("/")) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  const executeCommand = async (cmdString: string) => {
    const args = cmdString.split(" ");
    const cmd = args[0];
    
    let responseText = "";
    if (cmd === "/predict") {
      responseText = `PREDICTION LOGGED: ${args.slice(1).join(" ") || "N/A"} - Waiting for official results.`;
    } else if (cmd === "/stats") {
      responseText = `STATS RETRIEVED: Entity '${args[1] || "N/A"}' - Updating dashboard...`;
    } else if (cmd === "/compare") {
      responseText = `COMPARING: '${args[1] || "?"}' vs '${args[2] || "?"}' - See Head-to-Head panel.`;
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
      type: "command_response" as const
    };

    setMessages(prev => {
      if (prev.some(m => m.id === commandResponseMsg.id)) return prev;
      return [...prev, commandResponseMsg];
    });

    await supabase.from("terminal_chats").insert([commandResponseMsg]);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const isCommand = inputValue.trim().startsWith("/");
      const messageText = inputValue.trim();
      
      const newMsg: TerminalMessage = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        user_id: user?.id || null,
        username,
        message_text: messageText,
        context,
        type: "user" as const
      };

      setInputValue("");
      setShowCommands(false);

      // Optimistic Update
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Insert User Message
      const { error } = await supabase.from("terminal_chats").insert([newMsg]);
      
      if (error) {
        console.error("Failed to insert message:", error);
      } else if (isCommand) {
        await executeCommand(messageText);
      }
    }
  };

  return (
    <div className={`fixed top-24 right-6 z-50 flex flex-col items-end ${className}`}>
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="bg-black/90 border border-primary/40 text-primary p-4 rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.4)] hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
          >
            <Terminal className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="flex flex-col w-[320px] sm:w-[400px] bg-black/90 border border-primary/20 rounded-xl overflow-hidden font-mono text-xs sm:text-sm shadow-[0_0_25px_rgba(var(--color-primary),0.3)] origin-top-right"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border-b border-primary/20 text-primary cursor-pointer" onClick={() => setIsExpanded(false)}>
              <Terminal className="w-4 h-4" />
              <span className="font-bold tracking-widest uppercase text-[10px] sm:text-xs">Manjanium OS Terminal</span>
              <div className="ml-auto flex gap-1.5 items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                  className="w-3 h-3 rounded-full bg-warning/80 hover:bg-warning transition-colors"
                  title="Minimize"
                />
                <div className="w-3 h-3 rounded-full bg-success/80"></div>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 p-3 overflow-y-auto space-y-2 h-[300px] sm:h-[400px]"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(var(--color-primary), 0.3) transparent" }}
            >
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className="break-words">
                  {msg.type === "system" ? (
                    <span className="text-error/90 font-semibold">[{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'SYS'}]: {msg.message_text}</span>
                  ) : msg.type === "command_response" ? (
                    <span className="text-secondary/90 font-bold">{'>'} {msg.message_text}</span>
                  ) : (
                    <span>
                      <span className="text-success">{msg.username}@manjanium-core:~$</span>{" "}
                      <span className="text-gray-300">{msg.message_text}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="relative p-3 bg-black border-t border-primary/20">
              <AnimatePresence>
                {showCommands && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 w-full bg-black/95 border-t border-primary/30 p-2 z-10"
                  >
                    <div className="text-primary/70 text-xs mb-2 font-bold px-2 uppercase tracking-wider">Available Commands</div>
                    <div className="space-y-1">
                      {SLASH_COMMANDS.map((cmd) => (
                        <div 
                          key={cmd.command} 
                          className="flex items-center gap-2 px-2 py-1 hover:bg-primary/20 cursor-pointer text-gray-300 transition-colors"
                          onClick={() => {
                            setInputValue(cmd.command + " ");
                            setShowCommands(false);
                          }}
                        >
                          <span className="text-secondary">{cmd.icon}</span>
                          <span className="text-success font-bold">{cmd.command}</span>
                          <span className="text-[10px] sm:text-xs text-gray-500">- {cmd.desc}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center">
                <span className="text-success mr-2 shrink-0 hidden sm:inline">{promptText}</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
