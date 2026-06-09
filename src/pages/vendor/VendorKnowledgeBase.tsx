import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, Plus, Search } from "lucide-react";



const CATEGORIES = ["All","Installation issues","Agent offline troubleshooting","Hub startup issue","Vault issue","License activation issue","Hardware mismatch issue","K7 / antivirus blocking issue","Windows reboot survival issue","Port/firewall issue","Proxy issue","Export failure issue","Migration issue","Rollback issue","Upgrade issue","Recording engine issue","OpenCV fallback issue","Desktop Duplication API issue"];

export default function VendorKnowledgeBase() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ category: "Recording engine issue", title: "", content: "", tags: "" });

  const refresh = () => api.get("/vendor/knowledge-base").then(setArticles).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function create() {
    await api.post("/vendor/knowledge-base", { ...form, tags: form.tags.split(",").map(t => t.trim()) });
    setMsg("Article created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  const filtered = articles.filter(a =>
    (category === "All" || a.category === category) &&
    (search === "" || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
          <p className="text-sm text-slate-400 mt-0.5">{articles.length} articles</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Create Article
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="flex gap-2">
        <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 flex-1">
          <Search size={13} className="text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" className="bg-transparent text-sm text-white focus:outline-none flex-1 placeholder:text-slate-600" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none max-w-[200px]">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Knowledge Base Article</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Content</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Save Article</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.id} className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/2" onClick={() => setSelected(selected?.id === a.id ? null : a)}>
              <div className="p-2 bg-violet-500/10 rounded-lg mt-0.5"><BookOpen size={14} className="text-violet-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{a.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 flex gap-2 flex-wrap">
                  <span className="text-violet-400">{a.category}</span>
                  <span>·</span>
                  <span>{a.createdBy}</span>
                  <span>·</span>
                  <span>{a.createdAt}</span>
                  {a.linkedCases?.length > 0 && <><span>·</span><span className="text-yellow-400">Cases: {a.linkedCases.join(", ")}</span></>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {a.tags?.map((t: string) => <span key={t} className="text-[10px] bg-slate-800 text-slate-400 rounded px-1.5 py-0.5">{t}</span>)}
              </div>
            </div>
            {selected?.id === a.id && (
              <div className="px-4 pb-4 pt-0 border-t border-white/5">
                <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{a.content}</div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No articles found</div>}
      </div>
    </div>
  );
}
