import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Plus } from "lucide-react";



export default function VendorPartnerEngineers() {
  const [engineers, setEngineers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", company: "", email: "", role: "Partner Engineer", accessLevel: "READ_ONLY", assignedCustomers: ["CUST-ALPHA"], accessExpiry: "2026-12-31" });

  const refresh = () => api.get("/vendor/partner-engineers").then(setEngineers).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function create() {
    await api.post("/vendor/partner-engineers", form);
    setMsg("Partner engineer added"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Partner Engineers</h1>
          <p className="text-sm text-slate-400 mt-0.5">{engineers.filter(e => e.status === "ACTIVE").length} active partners</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Add Engineer
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="bg-slate-800/50 border border-white/5 rounded-lg px-4 py-3 text-xs text-slate-400">
        Partner engineers have restricted access. They cannot access customer evidence by default. All partner engineer actions are audited.
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Add Partner Engineer</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[["name","Full Name"],["company","Company"],["email","Email"],["accessExpiry","Access Expiry"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Access Level</label>
              <select value={form.accessLevel} onChange={e => setForm(p => ({ ...p, accessLevel: e.target.value }))} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
                {["READ_ONLY","SUPPORT_ONLY","RESTRICTED"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Add Engineer</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["ID","Name","Company","Email","Role","Access Level","Assigned Customers","Expiry","Status","Last Login","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {engineers.map(e => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.id}</td>
                <td className="px-4 py-3 text-white font-medium">{e.name}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.company}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.email}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{e.role}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.accessLevel}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.assignedCustomers?.join(", ")}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.accessExpiry}</td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.lastLogin ? new Date(e.lastLogin).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded hover:bg-slate-600">Activity</button>
                    <button className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/30">Revoke</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
