"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Loader2, Save, X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminSource {
  id: number;
  title: string;
  content: string;
}

export default function AdminDashboard() {
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSource, setEditingSource] = useState<AdminSource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/sources/list");
      if(res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const openCreate = () => {
    setTitle("");
    setContent("");
    setIsCreating(true);
  };

  const openEdit = (source: AdminSource) => {
    setEditingSource(source);
    setTitle(source.title);
    setContent(source.content);
  };

  const handleSave = async () => {
    if (!title || !content) return;
    setIsSaving(true);
    
    const isNew = isCreating;
    const payload = isNew 
      ? { title, content } 
      : { id: editingSource?.id, title, content };
    
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if(res.ok) {
        closeModals();
        await fetchSources();
      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.error || "ao salvar"}`);
      }
    } catch(e) {
      alert("Erro de conexão com o banco de dados.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Tem certeza que deseja excluir esta fonte permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/sources?id=${id}`, { method: "DELETE" });
      if(res.ok) {
        await fetchSources();
      }
    } catch(e) {}
  };

  const closeModals = () => {
    setIsCreating(false);
    setEditingSource(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Base de Conhecimento</h2>
          <p className="text-sm text-zinc-500">Gerencie os documentos que o Severino usa para responder.</p>
        </div>
        <button 
          onClick={openCreate} 
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> Nova Fonte
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-zinc-500 text-sm animate-pulse">Carregando fontes do banco...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sources.map(source => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={source.id} 
              className="group bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 rounded-2xl p-6 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-emerald-400 text-lg mb-2 truncate">{source.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{source.content}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEdit(source)} 
                    className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(source.id)} 
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {sources.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500 font-medium italic">Nenhuma fonte encontrada. Comece adicionando uma!</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {(isCreating || editingSource) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModals}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-100 italic">
                  {isCreating ? "Nova Fonte de Conhecimento" : "Editando Fonte"}
                </h3>
                <button onClick={closeModals} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Título / Nome do Arquivo</label>
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-xl text-emerald-400 outline-none focus:border-emerald-500 transition-all font-medium" 
                    placeholder="Ex: Guia_de_Vendas.txt"
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Conteúdo (Base do Conhecimento)</label>
                  <textarea 
                    className="w-full h-80 bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-xl text-zinc-300 outline-none focus:border-emerald-500 transition-all text-sm resize-none" 
                    placeholder="Descreva aqui as informações que o Severino deve conhecer..."
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
                <button 
                  onClick={closeModals}
                  className="px-6 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !title || !content} 
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-2.5 rounded-xl font-black flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                  {isCreating ? "Criar Fonte" : "Salvar Alterações"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

