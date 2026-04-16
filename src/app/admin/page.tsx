"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Loader2, Save, X } from "lucide-react";

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
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
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

  const handleSave = async (isNew: boolean) => {
    setIsSaving(true);
    let payload;
    if (isNew) {
      payload = { title: newTitle, content: newContent };
    } else {
      payload = { id: editingSource?.id, title: editingSource?.title, content: editingSource?.content };
    }
    
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if(res.ok) {
        setEditingSource(null);
        setIsCreating(false);
        setNewTitle("");
        setNewContent("");
        await fetchSources();
      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.error || "ao salvar a fonte"}`);
      }
    } catch(e) {
      alert("Erro ao conectar ao servidor.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Tem certeza que deseja apagar esta fonte?")) return;
    try {
      const res = await fetch(`/api/admin/sources?id=${id}`, { method: "DELETE" });
      if(res.ok) {
        await fetchSources();
      }
    } catch(e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Base de Conhecimento do Agente</h2>
        <button onClick={() => setIsCreating(true)} className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nova Fonte
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : (
        <div className="grid gap-4">
          {sources.map(source => (
            <div key={source.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
              {editingSource?.id === source.id ? (
                <div className="space-y-4">
                  <input 
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-sm text-emerald-400 outline-none" 
                    value={editingSource.title} 
                    onChange={e => setEditingSource({...editingSource, title: e.target.value})} 
                  />
                  <textarea 
                    className="w-full h-48 bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-sm outline-none resize-none" 
                    value={editingSource.content} 
                    onChange={e => setEditingSource({...editingSource, content: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(false)} disabled={isSaving} className="bg-emerald-500 text-zinc-950 px-4 py-2 text-sm rounded font-medium flex items-center gap-2">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Salvar
                    </button>
                    <button onClick={() => setEditingSource(null)} className="bg-zinc-800 text-zinc-300 px-4 py-2 text-sm rounded hover:bg-zinc-700">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-emerald-400">{source.title}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingSource(source)} className="p-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 rounded transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(source.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">{source.content}</p>
                </div>
              )}
            </div>
          ))}

          {isCreating && (
            <div className="bg-zinc-900 border border-emerald-500/50 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-emerald-400">Criando Nova Fonte</h3>
              <input 
                className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-sm text-emerald-400 outline-none" 
                placeholder="Título do Arquivo (Ex: NOME.txt)"
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
              />
              <textarea 
                className="w-full h-48 bg-zinc-950 border border-zinc-700 px-3 py-2 rounded text-sm outline-none resize-none" 
                placeholder="Conteúdo que o Severino vai usar como base de conhecimento..."
                value={newContent} 
                onChange={e => setNewContent(e.target.value)} 
              />
              <div className="flex gap-2">
                <button onClick={() => handleSave(true)} disabled={isSaving || !newTitle || !newContent} className="bg-emerald-500 text-zinc-950 px-4 py-2 text-sm rounded font-medium flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Salvar
                </button>
                <button onClick={() => setIsCreating(false)} className="bg-zinc-800 text-zinc-300 px-4 py-2 text-sm rounded hover:bg-zinc-700">Cancelar</button>
              </div>
            </div>
          )}
          {sources.length === 0 && !isCreating && !isLoading && (
            <div className="text-center py-12 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">Nenhuma fonte de conhecimento cadastrada no banco de dados.</div>
          )}
        </div>
      )}
    </div>
  );
}
