"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === "assistant";

  const formatContent = (text: string) => {
    if (!isAssistant) return text;

    const parts = text.split(/(".*?")|('.*?')/g);
    return parts.map((part, i) => {
      if (!part) return null;
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        return <strong key={i} className="text-emerald-300 font-semibold">{part}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex w-full mb-5",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {/* Severino Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="h-7 w-7 flex items-center justify-center overflow-hidden" style={{ borderRadius: "6px" }}>
            <Image src="/icone-claro.png" alt="S" width={28} height={28} />
          </div>
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] px-4 py-3 text-[13px] leading-relaxed",
          isAssistant
            ? "bg-zinc-900/40 text-zinc-200 border border-zinc-800/50"
            : "bg-emerald-500/8 text-zinc-100 border border-emerald-400/15"
        )}
        style={{ borderRadius: "8px" }}
      >
        <div className="whitespace-pre-wrap">
          {formatContent(content)}
        </div>
      </div>
    </motion.div>
  );
}
