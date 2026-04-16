"use client";

import { SendHorizonal } from "lucide-react";
import { useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="relative flex items-center w-full bg-zinc-900/40 border border-zinc-800/50 overflow-hidden focus-within:border-emerald-400/30 transition-all duration-200"
      style={{ borderRadius: "10px" }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Manda sua dúvida, campeão..."
        className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-200 outline-none resize-none scrollbar-none placeholder:text-zinc-600"
        disabled={disabled}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        className="p-3 mr-1 text-zinc-500 hover:text-emerald-400 disabled:opacity-20 disabled:hover:text-zinc-500 transition-colors cursor-pointer"
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  );
}
