import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <header className="flex h-14 items-center px-6 border-b border-zinc-800/50 justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h1 className="text-sm font-semibold tracking-wide text-zinc-100">Severino Admin Dashboard</h1>
        </div>
        <a 
          href="/" 
          className="text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          Voltar para Home
        </a>
      </header>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
