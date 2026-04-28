// apps/web/src/components/chat/ChatWidget.tsx
"use client";

import { Sparkle, Trash, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/stores/useChatStore";
import { ChatButton } from "./ChatButton";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

export function ChatWidget() {
  const { isOpen, closeChat, messages, clearMessages, isTyping } =
    useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        useChatStore.getState().addMessage({
          role: "assistant",
          content:
            "Hello! 👋 I'm your HomeBuddy AI assistant. I can help you with service bookings, property management, and home maintenance questions. How can I assist you today?",
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  return (
    <>
      {/* Floating Button */}
      <ChatButton />

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-6 bottom-24 z-50 flex h-[600px] max-h-[calc(100vh-8rem)] w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl shadow-2xl md:w-[400px]"
              style={{
                background: "rgba(15, 15, 15, 0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-white/10 border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                    <Sparkle className="h-5 w-5 text-white" weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">
                      HomeBuddy AI
                    </h3>
                    <p className="text-white/60 text-xs">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 1 && (
                    <button
                      onClick={clearMessages}
                      className="rounded-lg p-2 transition-colors hover:bg-white/10"
                      title="Clear chat"
                    >
                      <Trash className="h-4 w-4 text-white/60" />
                    </button>
                  )}
                  <button
                    onClick={closeChat}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    <X className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-white/40">
                      <Sparkle
                        className="mx-auto mb-2 h-12 w-12 opacity-50"
                        weight="fill"
                      />
                      <p className="text-sm">Start a conversation...</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Sparkle className="h-4 w-4 text-white" weight="fill" />
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
                      <div className="flex gap-1">
                        <motion.div
                          className="h-2 w-2 rounded-full bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="h-2 w-2 rounded-full bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="h-2 w-2 rounded-full bg-white/60"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0.4,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <ChatInput />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
