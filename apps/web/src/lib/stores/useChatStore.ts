// apps/web/src/lib/stores/useChatStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStore {
  // State
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  inputValue: string;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setIsTyping: (isTyping: boolean) => void;
  setInputValue: (value: string) => void;
  clearMessages: () => void;
  clearInput: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, _get) => ({
      // Initial state
      isOpen: false,
      messages: [],
      isTyping: false,
      inputValue: "",

      // Actions
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date(),
            },
          ],
        })),

      setIsTyping: (isTyping) => set({ isTyping }),
      setInputValue: (value) => set({ inputValue: value }),
      clearMessages: () => set({ messages: [] }),
      clearInput: () => set({ inputValue: "" }),
    }),
    {
      name: "homebuddy-chat-storage",
      partialize: (state) => ({
        messages: state.messages.slice(-20), // Keep last 20 messages only
      }),
    },
  ),
);
