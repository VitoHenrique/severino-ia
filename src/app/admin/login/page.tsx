"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Senha Incorreta");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24">
      <div className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
         <div className="flex flex-col items-center mb-6">
           <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
             <Shield className="w-5 h-5 text-emerald-400" />
           </div>
           <h2 className="text-xl font-bold tracking-tight">Área Restrita</h2>
           <p className="text-xs text-zinc-500 mt-1">Insira a senha do administrador</p>
         </div>
         <form onSubmit={handleLogin} className="flex flex-col gap-4">
           <div>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors text-sm"
               placeholder="Senha..."
             />
           </div>
           {error && <p className="text-red-400 text-xs text-center">{error}</p>}
           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-zinc-950 font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acessar Painel"}
           </button>
         </form>
      </div>
    </div>
  );
}
