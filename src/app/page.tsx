"use client";

import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Database, X, FileText } from "lucide-react";

interface SourceFile {
  name: string;
  size: number;
  updatedAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Fala, campeão! Severino na área. Pronto pra bater a meta de hoje? Me manda sua dúvida que eu te dou o caminho das pedras." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [sourcesList, setSourcesList] = useState<SourceFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    
    // Fetch sources
    const fetchSources = async () => {
      try {
        const res = await fetch("/api/sources");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSourcesList(data);
        }
      } catch (error) {
        console.error("Failed to fetch sources", error);
      }
    };
    fetchSources();
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });

        requestAnimationFrame(() => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role !== "assistant") return prev;
            return [
              ...prev.slice(0, -1),
              { ...last, content: assistantContent },
            ];
          });
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Eita, deu ruim aqui! Tenta de novo, campeão." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── SPLASH SCREEN ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0d0a12 50%, #0a0a0a 100%)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-8"
            >
              {/* Logo Mark */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src="/icone-claro.png" alt="Severino IA" width={56} height={56} className="opacity-90" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p className="text-sm text-zinc-500 tracking-[0.3em] uppercase mb-3">
                  Seja bem-vindo ao
                </p>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                  Severino
                  <span className="text-emerald-300"> IA</span>
                </h1>
              </motion.div>

              {/* Progress */}
              <motion.div className="w-56 h-px bg-zinc-800/50 mt-4 overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-zinc-600 tracking-[0.2em]"
              >
                Preparando o mestre das vendas...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN APP ── */}
      <div className="flex h-screen text-zinc-200 font-sans overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div className="flex flex-1 flex-col relative overflow-hidden">

          {/* ── HEADER ── */}
          <header className="flex h-14 items-center px-6 sm:px-8 justify-between z-10 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <Image src="/icone-claro.png" alt="Severino IA" width={24} height={24} className="opacity-80" />
              <div className="flex items-baseline gap-2">
                <h1 className="text-sm font-semibold tracking-wide">
                  Severino<span className="text-emerald-300 ml-0.5">IA</span>
                </h1>
                <span className="hidden sm:inline text-[10px] text-zinc-600 tracking-wider">
                  Mestre das Vendas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSources(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
                style={{ borderRadius: "4px" }}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="text-[10px] tracking-wide font-medium">Fontes</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/50 border border-zinc-800/50" style={{ borderRadius: "4px" }}>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-500 tracking-wide">Online</span>
              </div>
            </div>
          </header>

          {/* ── CHAT AREA ── */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 scrollbar-thin overflow-x-hidden" ref={scrollRef}>
            <div className="mx-auto max-w-2xl">
              {/* Welcome Card (only when 1 message) */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12 mt-8"
                >
                  <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-200 mb-3 tracking-tight">
                    Como posso te ajudar a <span className="text-emerald-300">vender mais</span> hoje?
                  </h2>
                  <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Pergunte sobre API Oficial, Disparos, RCS ou estratégias de vendas. Estou aqui pra te dar o caminho das pedras.
                  </p>
                </motion.div>
              )}

              {/* Messages */}
              <AnimatePresence>
                {messages.map((m, i) => (
                  <ChatBubble key={i} role={m.role} content={m.content} />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && messages[messages.length - 1].role === "user" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-6 pl-1"
                >
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-emerald-300/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-emerald-300/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-emerald-300/40 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[11px] text-zinc-600">Severino está pensando...</span>
                </motion.div>
              )}
            </div>
          </main>

          {/* ── INPUT AREA ── */}
          <footer className="px-4 sm:px-6 pb-6 pt-4 z-10">
            <div className="mx-auto max-w-2xl">
              <ChatInput onSend={handleSend} disabled={isLoading} />
              <p className="mt-3 text-center text-[10px] text-zinc-700 tracking-wider">
                Severino IA · <span className="text-emerald-400/50">Texto em verde</span> = envie para o cliente
              </p>
            </div>
          </footer>

          {/* ── SOURCES MODAL ── */}
          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSources(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-sm shadow-2xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => setShowSources(false)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">Fontes de Conhecimento</h3>
                  </div>
                  
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    Estes são os documentos que o Severino acessa para gerar as respostas e garantir a precisão no atendimento.
                  </p>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {sourcesList.length > 0 ? (
                      sourcesList.map((source: SourceFile, i: number) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50 text-xs text-zinc-300">
                          <FileText className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{source.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-xs text-zinc-500">Nenhuma fonte encontrada.</div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient Light */}
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 -z-10 h-[500px] w-[800px] bg-zinc-700/[0.06] [filter:blur(160px)] rounded-full pointer-events-none" />
        </div>
      </div>
    </>
  );
}
