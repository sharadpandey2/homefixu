// apps/web/src/components/chat/ChatButton.tsx
"use client";

import { ChatCircleDots, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/lib/stores/useChatStore";

export function ChatButton() {
  const { isOpen, toggleChat, messages } = useChatStore();
  const unreadCount = 0; // TODO: Implement unread message tracking

  return (
    <motion.button
      onClick={toggleChat}
      className="group fixed right-6 bottom-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-60 blur-xl transition-opacity group-hover:opacity-80" />

      {/* Button */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6 text-white" weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatCircleDots className="h-6 w-6 text-white" weight="fill" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-lg"
          >
            <span className="font-bold text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.div>
        )}
      </div>

      {/* Pulse Animation */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-600"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 1,
          }}
        />
      )}
    </motion.button>
  );
}
