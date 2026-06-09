import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Globe, Plus } from "lucide-react";



export default function VendorSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ customerId: "CUST-ALPHA", customerName: "Alpha Manufacturing", siteName: "", location: "", environment: "Production", hubHostname: "", vaultHostname: "" });

  const refresh = () => api.get("/vendor/sites").then(setSites).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function create() {
    await api.post("/vendor/sites", form);
    setMsg("Site created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Site Registry</h1>
          <p className="text-sm text-slate-400 mt-0.5">{sites.length} sites</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Create Site
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Site</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[["customerId","Customer ID"],["siteName","Site Name"],["location","Location"],["hubHostname","Hub Hostname"],["vaultHostname","Vault Hostname"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Environment</label>
              <select value={form.environment} onChange={e => setForm(p => ({ ...p, environment: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {["Pilot","Production","DR"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Save</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Site ID","Customer","Site Name","Location","Env","Hub","Hub IP","Vault","Vault IP","Agents","Network","Proxy","SMTP","Status",""].map(h => (
                <th key={h} className="text-left px-3 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map(s => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-3 py-3 font-mono text-xs text-slate-400">{s.id}</td>
                <td className="px-3 py-3 text-xs text-slate-300">{s.customerName}</td>
                <td className="px-3 py-3 text-white font-medium">{s.siteName}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{s.location}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{s.environment}</td>
                <td className="px-3 py-3 text-xs font-mono text-slate-400">{s.hubHostname}</td>
                <td className="px-3 py-3 text-xs font-mono text-slate-500">{s.hubIp}</td>
                <td className="px-3 py-3 text-xs font-mono text-slate-400">{s.vaultHostname}</td>
                <td className="px-3 py-3 text-xs font-mono text-slate-500">{s.vaultIp}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{s.agentCount}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{s.networkMode}</td>
                <td className="px-3 py-3 text-xs">{s.proxyRequired ? <span className="text-yellow-400">Yes</span> : <span className="text-slate-500">No</span>}</td>
                <td className="px-3 py-3 text-xs">{s.smtpAvailable ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                <td className="px-3 py-3"><StatusBadge status={s.deploymentStatus} /></td>
                <td className="px-3 py-3">
                  <button className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-600">Checklist</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
