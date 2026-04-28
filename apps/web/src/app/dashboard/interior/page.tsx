"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  generatedImage?: string; // URL from Replicate
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  room?: string;
  style?: string;
}

interface RoomPreset {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

interface StylePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  replicatePrompt: string; // style keywords for Replicate
  accent: string;
  border: string;
  text: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_PRESETS: RoomPreset[] = [
  { id: "living", name: "Living Room", icon: "🛋️", prompt: "my living room" },
  { id: "bedroom", name: "Bedroom", icon: "🛏️", prompt: "my bedroom" },
  { id: "kitchen", name: "Kitchen", icon: "🍳", prompt: "my kitchen" },
  { id: "bathroom", name: "Bathroom", icon: "🚿", prompt: "my bathroom" },
  { id: "balcony", name: "Balcony", icon: "🌿", prompt: "my balcony" },
  { id: "study", name: "Study Room", icon: "📚", prompt: "my study room" },
  { id: "dining", name: "Dining Area", icon: "🍽️", prompt: "my dining area" },
  { id: "kids", name: "Kids Room", icon: "🧸", prompt: "my kid's room" },
];

const STYLE_PRESETS: StylePreset[] = [
  {
    id: "modern",
    name: "Modern Minimal",
    icon: "◻️",
    description: "Clean lines, neutral tones",
    replicatePrompt:
      "modern minimalist interior, clean lines, neutral colors, Scandinavian furniture, natural light",
    accent: "from-slate-500/10 to-slate-600/5",
    border: "border-slate-500/30",
    text: "text-slate-300",
  },
  {
    id: "indian",
    name: "Indian Traditional",
    icon: "🪔",
    description: "Rich colours, ethnic patterns",
    replicatePrompt:
      "Indian traditional interior, rich warm colors, ethnic patterns, wooden furniture, brass accents, jute decor",
    accent: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/30",
    text: "text-orange-400",
  },
  {
    id: "boho",
    name: "Boho Chic",
    icon: "🌵",
    description: "Earthy, eclectic, layered",
    replicatePrompt:
      "bohemian interior design, earthy tones, macrame, plants, rattan furniture, layered rugs, cozy eclectic",
    accent: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: "✨",
    description: "Marble, gold, velvet textures",
    replicatePrompt:
      "luxury interior design, marble floors, gold accents, velvet furniture, crystal chandelier, high-end opulent",
    accent: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    icon: "❄️",
    description: "Cozy, wood, white & warm",
    replicatePrompt:
      "Scandinavian hygge interior, white walls, warm wood, cozy textiles, minimalist functional",
    accent: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/30",
    text: "text-blue-300",
  },
  {
    id: "industrial",
    name: "Industrial",
    icon: "⚙️",
    description: "Raw concrete, metal, dark",
    replicatePrompt:
      "industrial interior design, exposed brick, concrete walls, metal furniture, Edison bulbs, dark moody",
    accent: "from-zinc-500/10 to-zinc-600/5",
    border: "border-zinc-500/30",
    text: "text-zinc-300",
  },
];

const QUICK_SUGGESTIONS = [
  {
    id: "s1",
    label: "Small flat ideas",
    prompt:
      "Give me interior design ideas for a small 2BHK flat in India with a budget of ₹2 lakhs",
  },
  {
    id: "s2",
    label: "Colour palette",
    prompt:
      "Suggest a colour palette and paint combinations for a modern Indian living room with brand names",
  },
  {
    id: "s3",
    label: "Space maximising",
    prompt:
      "How can I maximise storage and space in a small bedroom under 150 sq ft?",
  },
  {
    id: "s4",
    label: "Vastu tips",
    prompt:
      "Give me Vastu-compliant interior design suggestions for a flat — directions for each room",
  },
  {
    id: "s5",
    label: "Budget breakdown",
    prompt:
      "Give me a realistic budget breakdown for furnishing a 3BHK flat in India under ₹5 lakhs",
  },
  {
    id: "s6",
    label: "Lighting guide",
    prompt:
      "Explain the best lighting setup for each room in a modern Indian flat — ambient, task, accent",
  },
];

const SYSTEM_PROMPT = `You are an expert AI interior designer specializing in Indian homes — apartments, flats, villas, and independent houses. You have deep expertise in:

- Indian interior design styles: traditional, contemporary, fusion, Vastu-compliant layouts
- Space optimization for compact Indian flats (1BHK, 2BHK, 3BHK)
- Budget-conscious recommendations with Indian market pricing in INR
- Popular Indian furniture brands: Urban Ladder, Pepperfry, IKEA India, @home, Hometown
- Indian climate considerations (ventilation, humidity, tropical light)
- Local materials: teak, sheesham wood, jute, brass, terracotta
- Colour psychology and popular Indian palettes
- Vastu Shastra principles when requested
- Paint brands: Asian Paints, Berger, Nerolac — always give shade names

When responding:
1. Be specific and actionable — give room measurements, furniture dimensions, colour codes
2. Always mention Indian-market price ranges in INR (₹)
3. Structure responses with clear sections using emojis as section headers
4. Suggest specific products available in India when possible
5. Keep responses warm, friendly, and encouraging
6. After detailed design suggestions, always end with: "💡 Want me to generate an AI image of this design? Just say **generate image** and I'll create a visual!"

You are part of HomeBuddy — India's AI-powered home management platform.`;

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "homebuddy_interior_sessions";

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Revive Date objects
    return parsed.map((s: ChatSession) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function makeWelcomeMessage(): Message {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Namaste! 🏠✨ I'm your personal AI Interior Designer from HomeBuddy.\n\nI can help you with:\n- **Room design ideas** tailored to Indian flats\n- **Colour palettes** from Asian Paints, Berger & Nerolac\n- **Budget planning** in INR with real Indian brand prices\n- **Vastu-compliant** layouts for every room\n- **Furniture picks** from Urban Ladder, Pepperfry & IKEA India\n- **Space maximising** tips for compact homes\n- **AI-generated room visuals** — just say 'generate image'!\n\nTell me about your space — which room, your style, and budget? Let's design your dream home! 🎨",
    timestamp: new Date(),
  };
}

function makeNewSession(title = "New Design Chat"): ChatSession {
  return {
    id: generateId(),
    title,
    messages: [makeWelcomeMessage()],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─── Replicate image generation ───────────────────────────────────────────────

async function generateRoomImage(
  prompt: string,
  style: string,
): Promise<string | null> {
  // Uses Replicate's interior-design-sdxl-lightning model via their API
  // $0.011 per run, ~9 seconds, photorealistic SDXL output
  const fullPrompt = `photorealistic interior design, ${style}, ${prompt}, professional photography, 8k, beautiful lighting, high detail`;

  try {
    const startRes = await fetch(
      "https://api.replicate.com/v1/models/rocketdigitalai/interior-design-sdxl-lightning/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN ?? ""}`,
          Prefer: "wait=30",
        },
        body: JSON.stringify({
          input: {
            prompt: fullPrompt,
            negative_prompt:
              "low quality, blurry, cartoon, anime, ugly, deformed, distorted",
            num_inference_steps: 6,
            guidance_scale: 2,
            width: 1024,
            height: 768,
          },
        }),
      },
    );

    if (!startRes.ok) return null;
    const result = await startRes.json();

    // If synchronous result
    if (result.output && Array.isArray(result.output) && result.output[0]) {
      return result.output[0];
    }

    // Poll if async
    if (result.id) {
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(
          `https://api.replicate.com/v1/predictions/${result.id}`,
          {
            headers: {
              Authorization: `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN ?? ""}`,
            },
          },
        );
        const polled = await pollRes.json();
        if (polled.status === "succeeded" && polled.output?.[0])
          return polled.output[0];
        if (polled.status === "failed") return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      );
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0 text-amber-400">▸</span>
            <span>{parts.slice(1)}</span>
          </div>
        );
      }
      return <div key={i}>{parts}</div>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
          isUser
            ? "bg-gradient-to-br from-amber-500 to-amber-600"
            : "border border-violet-500/30 bg-gradient-to-br from-violet-500/40 to-indigo-600/40"
        }`}
      >
        {isUser ? "👤" : "✨"}
      </div>

      <div
        className={`flex max-w-[82%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              : "rounded-tl-sm border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.03] text-white/80"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="space-y-1">
              {renderContent(message.content)}
              {message.isStreaming && (
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-violet-400 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Generated image */}
        {message.generatedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl"
          >
            <img
              src={message.generatedImage}
              alt="AI generated room design"
              className="w-full max-w-sm object-cover"
            />
            <div className="flex items-center gap-2 border-white/[0.06] border-t bg-white/[0.04] px-3 py-2">
              <span className="text-white/40 text-xs">
                AI Generated · Replicate SDXL
              </span>
              <a
                href={message.generatedImage}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-amber-400 text-xs transition-colors hover:text-amber-300"
              >
                Download ↓
              </a>
            </div>
          </motion.div>
        )}

        <span className="px-1 text-white/20 text-xs">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ label = "Thinking..." }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/40 to-indigo-600/40 text-lg">
        ✨
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.03] px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-violet-400"
              animate={{ y: [0, -5, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 0.8,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <span className="ml-1 text-white/40 text-xs">{label}</span>
      </div>
    </motion.div>
  );
}

// ─── Session Sidebar ──────────────────────────────────────────────────────────

function SessionSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const grouped = sessions.reduce<Record<string, ChatSession[]>>((acc, s) => {
    const label = formatDate(s.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-full flex-col">
      {/* New chat button */}
      <button
        onClick={onNew}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-amber-600 hover:to-amber-700"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Chat
      </button>

      {/* Session list */}
      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto pr-1">
        {sessions.length === 0 && (
          <p className="py-6 text-center text-white/30 text-xs">
            No chats yet. Start designing!
          </p>
        )}
        {Object.entries(grouped).map(([date, group]) => (
          <div key={date}>
            <p className="mb-2 px-1 font-semibold text-white/30 text-xs uppercase tracking-wider">
              {date}
            </p>
            <div className="space-y-1">
              {group.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`group relative flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-all ${
                    s.id === activeId
                      ? "border border-amber-500/30 bg-amber-500/15"
                      : "border border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex-shrink-0 text-lg">💬</span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-medium text-sm ${s.id === activeId ? "text-amber-300" : "text-white/70"}`}
                    >
                      {s.title}
                    </p>
                    <p className="truncate text-white/30 text-xs">
                      {s.messages.length - 1} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s.id);
                    }}
                    className="rounded p-1 text-white/30 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div className="mt-4 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-3">
        <p className="mb-1 font-semibold text-violet-400 text-xs">
          🤖 AI Models Used
        </p>
        <p className="text-white/40 text-xs leading-relaxed">
          <span className="text-white/60">Claude Sonnet</span> — design advice &
          plans
          <br />
          <span className="text-white/60">Replicate SDXL</span> — room image
          generation
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIInteriorDesignerPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rooms" | "styles">("rooms");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReplicate, setHasReplicate] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check for Replicate token
  useEffect(() => {
    setHasReplicate(!!process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN);
  }, []);

  // Load sessions from storage
  useEffect(() => {
    const stored = loadSessions();
    if (stored.length > 0) {
      setSessions(stored);
      setActiveSessionId(stored[0].id);
    } else {
      const initial = makeNewSession("My First Design Chat");
      setSessions([initial]);
      setActiveSessionId(initial.id);
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages ?? [];

  // Update session helper
  const updateSession = useCallback(
    (id: string, updater: (s: ChatSession) => ChatSession) => {
      setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
    },
    [],
  );

  // Derive session title from first user message
  const deriveTitle = (text: string) => {
    const words = text.trim().split(" ").slice(0, 6).join(" ");
    return words.length > 40 ? `${words.slice(0, 40)}…` : words;
  };

  const newSession = useCallback(() => {
    const s = makeNewSession();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    setSelectedRoom(null);
    setSelectedStyle(null);
    setInput("");
    setError(null);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (next.length === 0) {
          const fresh = makeNewSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (id === activeSessionId) setActiveSessionId(next[0].id);
        return next;
      });
    },
    [activeSessionId],
  );

  // Build context prefix
  const buildPrefix = useCallback(() => {
    const parts: string[] = [];
    if (selectedRoom) {
      const r = ROOM_PRESETS.find((x) => x.id === selectedRoom);
      if (r) parts.push(`Room: ${r.name}`);
    }
    if (selectedStyle) {
      const s = STYLE_PRESETS.find((x) => x.id === selectedStyle);
      if (s) parts.push(`Style: ${s.name}`);
    }
    return parts.length ? `[Context — ${parts.join(", ")}]\n\n` : "";
  }, [selectedRoom, selectedStyle]);

  // Detect if user wants image generated
  const wantsImage = (text: string) => {
    const t = text.toLowerCase();
    return (
      t.includes("generate image") ||
      t.includes("show image") ||
      t.includes("visualise") ||
      t.includes("visualize") ||
      t.includes("create image") ||
      t.includes("make image")
    );
  };

  // Send message
  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading || !activeSessionId) return;
      setError(null);

      const prefix = buildPrefix();
      const fullText = prefix + userText.trim();
      const sessionSnapshot = sessions.find((s) => s.id === activeSessionId);
      if (!sessionSnapshot) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: userText.trim(),
        timestamp: new Date(),
      };
      const assistantMsgId = generateId();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      // Update title from first real user message
      const isFirstMsg =
        sessionSnapshot.messages.filter((m) => m.role === "user").length === 0;
      const newTitle = isFirstMsg
        ? deriveTitle(userText)
        : sessionSnapshot.title;

      updateSession(activeSessionId, (s) => ({
        ...s,
        title: newTitle,
        updatedAt: new Date(),
        messages: [...s.messages, userMsg, assistantMsg],
      }));

      setInput("");
      setIsLoading(true);

      // Build history for API
      const history = [
        ...sessionSnapshot.messages
          .filter((m) => m.id !== "welcome" && !m.isStreaming)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: fullText },
      ];

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: history,
            stream: true,
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder
            .decode(value, { stream: true })
            .split("\n")
            .filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                accumulated += parsed.delta.text;
                updateSession(activeSessionId, (s) => ({
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulated }
                      : m,
                  ),
                }));
              }
            } catch {}
          }
        }

        // Mark done
        updateSession(activeSessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
          ),
        }));

        // Image generation
        if (wantsImage(userText) && hasReplicate) {
          setIsGeneratingImage(true);
          const styleObj = STYLE_PRESETS.find(
            (x) => x.id === (selectedStyle ?? "modern"),
          );
          const roomObj = ROOM_PRESETS.find(
            (x) => x.id === (selectedRoom ?? "living"),
          );
          const imgPrompt = `${roomObj?.name ?? "living room"}, Indian home`;
          const imgUrl = await generateRoomImage(
            imgPrompt,
            styleObj?.replicatePrompt ?? "modern minimalist",
          );
          if (imgUrl) {
            updateSession(activeSessionId, (s) => ({
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, generatedImage: imgUrl } : m,
              ),
            }));
          }
          setIsGeneratingImage(false);
        }
      } catch {
        setError("Couldn't reach the AI. Please try again.");
        updateSession(activeSessionId, (s) => ({
          ...s,
          messages: s.messages.filter((m) => m.id !== assistantMsgId),
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      activeSessionId,
      sessions,
      buildPrefix,
      updateSession,
      hasReplicate,
      selectedStyle,
      selectedRoom,
      deriveTitle,
      wantsImage,
    ],
  );

  const handleSubmit = () => {
    if (input.trim()) sendMessage(input);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRoomQuickPrompt = (room: RoomPreset) => {
    setSelectedRoom(room.id);
    sendMessage(
      `Give me a complete interior design plan for ${room.prompt} in an Indian flat. Include colour palette, furniture suggestions with INR prices, lighting tips, and decor ideas.`,
    );
  };

  const handleStyleQuickPrompt = (style: StylePreset) => {
    setSelectedStyle(style.id);
    const room =
      ROOM_PRESETS.find((r) => r.id === selectedRoom)?.prompt ?? "my flat";
    sendMessage(
      `Design ${room} in a ${style.name} style (${style.description}). Give specific furniture, colour codes, material, and decor recommendations with Indian market pricing.`,
    );
  };

  const selectedStyleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
  const selectedRoomObj = ROOM_PRESETS.find((r) => r.id === selectedRoom);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <div className="mb-1 flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <h1 className="font-bold text-3xl text-white tracking-tight">
              AI Interior Designer
            </h1>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 font-bold text-violet-400 text-xs">
              AI POWERED
            </span>
          </div>
          <p className="text-white/40">
            Personal design expert for Indian homes — advice, palettes, budgets
            & AI room visuals
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex items-center gap-2 self-start rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2 font-medium text-sm text-white/50 transition-all hover:bg-white/[0.08] hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
          {sidebarOpen ? "Hide History" : "Show History"}
        </button>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-4 gap-3"
      >
        {[
          { label: "Room Types", value: ROOM_PRESETS.length, color: "violet" },
          {
            label: "Design Styles",
            value: STYLE_PRESETS.length,
            color: "amber",
          },
          { label: "Saved Chats", value: sessions.length, color: "blue" },
          { label: "Consultation", value: "Free", color: "green" },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl bg-gradient-to-br p-4 from-${s.color}-500/10 to-${s.color}-600/5 border border-${s.color}-500/20 text-center`}
          >
            <p className="font-bold text-2xl text-white">{s.value}</p>
            <p className={`text-xs text-${s.color}-400 mt-1`}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Body ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid gap-4"
        style={{
          gridTemplateColumns: sidebarOpen ? "220px 1fr 220px" : "1fr 220px",
        }}
      >
        {/* ── Session sidebar ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="overflow-hidden"
            >
              <div
                className="h-full rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4"
                style={{ minHeight: 560 }}
              >
                <p className="mb-3 font-semibold text-white/40 text-xs uppercase tracking-wider">
                  Chat History
                </p>
                <SessionSidebar
                  sessions={[...sessions].sort(
                    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
                  )}
                  activeId={activeSessionId}
                  onSelect={setActiveSessionId}
                  onNew={newSession}
                  onDelete={deleteSession}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Chat panel ── */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Active context pills */}
          {(selectedRoomObj || selectedStyleObj) && (
            <div className="flex flex-wrap gap-2 px-1">
              <span className="text-white/30 text-xs">Active context:</span>
              {selectedRoomObj && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300 text-xs">
                  {selectedRoomObj.icon} {selectedRoomObj.name}
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="ml-1 text-amber-300/50 hover:text-amber-300"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedStyleObj && (
                <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-violet-300 text-xs">
                  {selectedStyleObj.icon} {selectedStyleObj.name}
                  <button
                    onClick={() => setSelectedStyle(null)}
                    className="ml-1 text-violet-300/50 hover:text-violet-300"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat window */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02]"
            style={{ height: 520 }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center gap-3 border-white/[0.06] border-b px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/40 to-indigo-600/40 text-lg">
                ✨
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-sm text-white">
                  {activeSession?.title ?? "AI Designer"}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  <p className="text-white/40 text-xs">
                    Claude Sonnet · Replicate SDXL
                  </p>
                </div>
              </div>
              {!hasReplicate && (
                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-400/70 text-xs">
                  Add REPLICATE_API_TOKEN for image gen
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="scrollbar-hide flex-1 space-y-5 overflow-y-auto p-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isLoading && !messages[messages.length - 1]?.isStreaming && (
                  <TypingIndicator label="Designing your space..." />
                )}
                {isGeneratingImage && (
                  <TypingIndicator label="Generating room image with SDXL..." />
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 border-red-500/20 border-t bg-red-500/10 px-5 py-2 text-red-400 text-xs"
                >
                  <span>⚠️</span> {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-300 hover:text-red-200"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="flex-shrink-0 border-white/[0.06] border-t px-4 py-4">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasReplicate
                      ? "Ask about design, colours, budget… or say 'generate image'"
                      : "Ask about room design, colours, budget, furniture…"
                  }
                  rows={1}
                  disabled={isLoading || isGeneratingImage}
                  className="scrollbar-hide flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white transition-colors placeholder:text-white/25 focus:border-amber-500/40 focus:outline-none disabled:opacity-50"
                  style={{ maxHeight: 120 }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || isGeneratingImage || !input.trim()}
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
                    isLoading || isGeneratingImage || !input.trim()
                      ? "bg-white/[0.04] text-white/20"
                      : "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700"
                  }`}
                >
                  {isLoading || isGeneratingImage ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1,
                        ease: "linear",
                      }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 ml-1 text-white/20 text-xs">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Quick suggestions */}
          <div>
            <p className="mb-2 px-1 font-semibold text-white/30 text-xs uppercase tracking-wider">
              Quick Questions
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendMessage(s.prompt)}
                  disabled={isLoading || isGeneratingImage}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-left text-white/50 text-xs leading-snug transition-all hover:border-amber-500/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  {s.label} →
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: rooms + styles ── */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(["rooms", "styles"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-2 font-semibold text-xs capitalize transition-all ${
                  activeTab === tab
                    ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "rooms" && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-2 gap-2"
              >
                {ROOM_PRESETS.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomQuickPrompt(room)}
                    disabled={isLoading || isGeneratingImage}
                    className={`rounded-xl border p-3 text-left transition-all hover:scale-105 disabled:opacity-40 ${
                      selectedRoom === room.id
                        ? "border-amber-500/40 bg-amber-500/20"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="mb-1 text-2xl">{room.icon}</div>
                    <div className="font-medium text-white text-xs leading-tight">
                      {room.name}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === "styles" && (
              <motion.div
                key="styles"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-2"
              >
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleQuickPrompt(style)}
                    disabled={isLoading || isGeneratingImage}
                    className={`w-full rounded-xl border bg-gradient-to-br p-3 text-left transition-all hover:scale-[1.02] ${style.accent} ${style.border} disabled:opacity-40`}
                  >
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-lg">{style.icon}</span>
                      <span className={`font-bold text-sm ${style.text}`}>
                        {style.name}
                      </span>
                    </div>
                    <p className="pl-7 text-white/40 text-xs">
                      {style.description}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image gen tip */}
          {hasReplicate && (
            <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-3">
              <p className="mb-1 font-semibold text-violet-400 text-xs">
                🖼️ Image Generation
              </p>
              <p className="text-white/40 text-xs">
                Say{" "}
                <span className="text-violet-300 italic">"generate image"</span>{" "}
                after asking for a design to see an AI room visual via Replicate
                SDXL.
              </p>
            </div>
          )}
          {!hasReplicate && (
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-3">
              <p className="mb-1 font-semibold text-amber-400 text-xs">
                🖼️ Enable Image Gen
              </p>
              <p className="text-white/40 text-xs">
                Add{" "}
                <span className="font-mono text-amber-300">
                  NEXT_PUBLIC_REPLICATE_API_TOKEN
                </span>{" "}
                to your <span className="text-amber-300">.env</span> to activate
                AI room visuals.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── API Info banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5"
      >
        <p className="mb-3 font-semibold text-white/40 text-xs uppercase tracking-wider">
          🤖 AI Models Powering This Page
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-bold text-sm text-white">
                Claude Sonnet (Anthropic)
              </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Powers all design advice, Vastu recommendations, colour palettes,
              budget plans, and furniture suggestions. Trained on Indian home
              design context via system prompt. Streaming responses for
              real-time feel.
            </p>
            <span className="mt-2 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-violet-400 text-xs">
              api.anthropic.com/v1/messages
            </span>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <span className="font-bold text-sm text-white">
                SDXL Lightning (Replicate)
              </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
              Generates photorealistic room images using RealVisXL
              V5.0-Lightning + ControlNet Depth. Produces 1024×768 high-res
              renders in ~9 seconds. ~₹1 per image. Say "generate image" to
              trigger it.
            </p>
            <span className="mt-2 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-blue-400 text-xs">
              replicate.com · $0.011/run
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
