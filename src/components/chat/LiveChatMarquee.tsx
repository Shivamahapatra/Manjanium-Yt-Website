"use client";

import React, { useEffect, useState } from "react";
import { Drawer, Timeline, Avatar } from "antd";
import { IconMessageCircle } from "@tabler/icons-react";
import { motion } from "framer-motion";

const fanMessages = [
  "Wow! What a lap!",
  "Is the telemetry updating?",
  "Let's gooooo!",
  "That was so close...",
  "Incredible performance today.",
  "What is the strategy here?",
  "Pit stop incoming?",
  "Yellow flag sector 2!",
  "Goal!!! Wait wrong sport?",
  "Absolutely massive result.",
];

export function LiveChatMarquee({
  isActive,
}: {
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: number; text: string; user: string }[]
  >([]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newMsg = {
        id: Date.now(),
        text: fanMessages[Math.floor(Math.random() * fanMessages.length)],
        user: `User${Math.floor(Math.random() * 1000)}`,
      };
      setMessages((prev) => [newMsg, ...prev].slice(0, 50));
    }, 2500);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-neutral-900"></span>
            </span>
            <div className="bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-500 transition">
              <IconMessageCircle className="text-white w-6 h-6" />
            </div>
          </div>
        </motion.div>
      )}

      <Drawer
        title={<span className="dark:text-white">Live Chat Room</span>}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        mask={false}
        styles={{
          body: { padding: "16px 24px", backgroundColor: "var(--bg-color)" },
          header: { backgroundColor: "var(--bg-color)" },
        }}
        className="dark:bg-neutral-900 dark:text-neutral-200"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <Timeline
              items={messages.map((msg) => ({
                color: "blue",
                children: (
                  <div className="flex items-start gap-2 mb-4">
                    <Avatar className="bg-blue-500 flex-shrink-0">
                      {msg.user.substring(0, 1)}
                    </Avatar>
                    <div className="flex flex-col bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        {msg.user}
                      </span>
                      <span className="text-sm dark:text-neutral-200">
                        {msg.text}
                      </span>
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
            <input
              type="text"
              placeholder="Chat is simulated..."
              disabled
              className="w-full px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 dark:text-neutral-200 focus:outline-none"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
}
