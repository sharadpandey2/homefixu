// apps/web/src/components/chat/ChatMessage.tsx
"use client";

import { Sparkle, User } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { ChatMessage as ChatMessageType } from "@/lib/stores/useChatStore";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-600"
            : "bg-gradient-to-br from-purple-500 to-indigo-600"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" weight="bold" />
        ) : (
          <Sparkle className="h-4 w-4 text-white" weight="fill" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-600/20"
            : "border border-white/20 bg-white/10 backdrop-blur-xl"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm text-white/90 leading-relaxed">
          {message.content}
        </p>
        <p className="mt-1 text-white/40 text-xs">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}
