import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Headphones, Plus, AlertTriangle } from "lucide-react";



export default function VendorSupportCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ customerId: "CUST-ALPHA", customerName: "Alpha Manufacturing", siteId: "SITE-SG-001", severity: "MED", title: "", description: "" });

  const refresh = () => api.get("/vendor/support-cases").then(setCases).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function create() {
    await api.post("/vendor/support-cases", form);
    setMsg("Support case created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Support Cases</h1>
          <p className="text-sm text-slate-400 mt-0.5">{cases.filter(c => c.status !== "CLOSED").length} open cases</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Create Case
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Support Case</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["customerId","Customer ID"],["siteId","Site ID"],["title","Title"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Severity</label>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {["LOW","MED","HIGH","CRITICAL"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Create Case</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Case ID","Customer","Site","Severity","Title","Status","Assigned","Created","Updated","Escalation",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 cursor-pointer" onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{c.customerName}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.siteId}</td>
                <td className="px-4 py-3"><StatusBadge status={c.severity} /></td>
                <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">{c.title}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.assignedEngineer}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(c.createdTime).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(c.updatedTime).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">L{c.escalationLevel}</td>
                <td className="px-4 py-3"><button className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded">Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-white">{selected.id} — Remote Support</h2>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={12} />No customer evidence access unless explicitly approved by customer.
          </div>
          {selected.remoteSupport && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[["Customer Approval",selected.remoteSupport.customerApproval],["Access Reason",selected.remoteSupport.accessReason],["Engineer",selected.remoteSupport.engineer],["Window Start",selected.remoteSupport.windowStart],["Window End",selected.remoteSupport.windowEnd],["Evidence Download",selected.remoteSupport.evidenceDownloadApproved ? "APPROVED" : "NOT APPROVED"]].map(([k,v]) => (
                <div key={k} className="bg-slate-800/50 rounded p-2.5"><div className="text-slate-500 mb-0.5">{k}</div><div className="text-white">{String(v)}</div></div>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button className="text-xs bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-500/30">Open Remote Support Request</button>
            <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">Escalate</button>
            <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">Close Case</button>
          </div>
        </div>
      )}
    </div>
  );
}
