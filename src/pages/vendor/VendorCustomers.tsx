import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, ChevronRight } from "lucide-react";



export default function VendorCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", shortCode: "", contractId: "", productEdition: "Enterprise", supportTier: "Gold", licenseType: "Subscription" });

  const refresh = () => api.get("/vendor/customers").then(setCustomers).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function createCustomer() {
    await api.post("/vendor/customers", form);
    setMsg("Customer created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  async function viewDetail(id: string) {
    const d = await api.get(`/vendor/customers/${id}`);
    setDetail(d);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Customer Registry</h1>
          <p className="text-sm text-slate-400 mt-0.5">{customers.length} customers</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Create Customer
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Customer</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[["name","Customer Name"],["shortCode","Short Code"],["contractId","Contract ID"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Product Edition</label>
              <select value={form.productEdition} onChange={e => setForm(p => ({ ...p, productEdition: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {["Trial","Professional","Enterprise","Partner"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Support Tier</label>
              <select value={form.supportTier} onChange={e => setForm(p => ({ ...p, supportTier: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {["Standard","Gold","Platinum"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createCustomer} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Save</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Customer ID","Name","Code","Contract","Edition","Support Tier","License Type","Expiry","Sites","Agents","Version","Status","Risk",""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{c.id}</td>
                <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.shortCode}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.contractId}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{c.productEdition}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.supportTier}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.licenseType}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.licenseExpiry}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.sites}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.allowedAgents}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-400">{c.currentVersion}</td>
                <td className="px-4 py-3"><StatusBadge status={c.deploymentStatus} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.riskStatus} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => viewDetail(c.id)} className="p-1 text-slate-500 hover:text-white"><ChevronRight size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-white">{detail.name} — Detail</h2>
            <button onClick={() => setDetail(null)} className="text-xs text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Contacts", items: detail.contacts?.map((c: any) => `${c.name} (${c.role}) — ${c.email}`) },
              { title: "Sites", items: detail.sites?.map((s: any) => `${s.siteName} — ${s.environment} — ${s.deploymentStatus}`) },
              { title: "Licenses", items: detail.licenses?.map((l: any) => `${l.id} — ${l.productEdition} — Expiry: ${l.expiryDate}`) },
              { title: "Packages", items: detail.packages?.map((p: any) => `${p.id} — ${p.type} — ${p.version}`) },
            ].map(({ title, items }) => (
              <div key={title} className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-xs font-medium text-violet-400 mb-2">{title}</div>
                {items?.length ? items.map((item: string, i: number) => <div key={i} className="text-xs text-slate-300">{item}</div>) : <div className="text-xs text-slate-500">None</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
