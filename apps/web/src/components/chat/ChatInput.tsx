// apps/web/src/components/chat/ChatInput.tsx
"use client";

import { PaperPlaneRight } from "@phosphor-icons/react";
import { useState } from "react";
import { useChatStore } from "@/lib/stores/useChatStore";

export function ChatInput() {
  const { inputValue, setInputValue, addMessage, clearInput, setIsTyping } =
    useChatStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();

    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
    });

    clearInput();
    setIsTyping(true);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to your backend
      // For now, simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock assistant response
      const mockResponse = getMockResponse(userMessage);

      addMessage({
        role: "assistant",
        content: mockResponse,
      });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-white/10 border-t p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about services, bookings, or home maintenance..."
          className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <PaperPlaneRight className="h-5 w-5 text-white" weight="bold" />
        </button>
      </div>
    </div>
  );
}

// Mock response generator (replace with actual API call)
function getMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (
    message.includes("plumb") ||
    message.includes("leak") ||
    message.includes("pipe")
  ) {
    return "I can help you book a plumber! Our plumbing services include leak repairs, pipe installations, and emergency fixes. Would you like to schedule a service visit? Our rates start at ₹500 per visit.";
  }

  if (
    message.includes("electr") ||
    message.includes("wiring") ||
    message.includes("light")
  ) {
    return "Need electrical work? We offer wiring repairs, fixture installations, and safety inspections. Our certified electricians are available 24/7. Shall I help you book an appointment?";
  }

  if (
    message.includes("pest") ||
    message.includes("cockroach") ||
    message.includes("termite")
  ) {
    return "Our pest control services cover termites, cockroaches, rodents, and more. We use eco-friendly solutions. Would you like to schedule a comprehensive pest inspection for your property?";
  }

  if (
    message.includes("book") ||
    message.includes("appoint") ||
    message.includes("schedule")
  ) {
    return "I can help you book a service! Please tell me:\n1. Which service do you need?\n2. Which property?\n3. Preferred date and time\n\nOr I can show you available services if you're not sure what you need.";
  }

  if (
    message.includes("price") ||
    message.includes("cost") ||
    message.includes("rate")
  ) {
    return "Our pricing varies by service:\n• Plumbing: ₹500-2000\n• Electrical: ₹600-2500\n• Pest Control: ₹800-3000\n• AC Service: ₹400-1500\n• Painting: ₹15-50/sqft\n\nPrices depend on the scope of work. Would you like a detailed quote?";
  }

  if (message.includes("subscription") || message.includes("plan")) {
    return "We offer 3 subscription plans:\n\n🌟 Starter (₹499/month): 2 services, quarterly reports\n💎 Pro (₹999/month): 5 services, monthly reports\n👑 Elite (₹1,999/month): Unlimited services, weekly reports + priority support\n\nWhich plan interests you?";
  }

  if (
    message.includes("hello") ||
    message.includes("hi") ||
    message.includes("hey")
  ) {
    return "Hello! 👋 I'm your HomeBuddy AI assistant. I can help you with:\n\n• Booking home services\n• Checking service status\n• Property management\n• Subscription plans\n• Emergency assistance\n\nHow can I help you today?";
  }

  return "I'm here to help with your home maintenance needs! I can assist with service bookings, property management, subscription plans, and more. Could you please provide more details about what you need?";
}
