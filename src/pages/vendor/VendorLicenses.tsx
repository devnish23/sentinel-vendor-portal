import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useRole } from "@/lib/role-context";
import { Key, Plus, AlertTriangle } from "lucide-react";



export default function VendorLicenses() {
  const { vendorRole } = useRole();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok"|"err">("ok");
  const [form, setForm] = useState({ customerId: "CUST-ALPHA", siteId: "SITE-SG-001", productEdition: "Enterprise", agentLimit: 10, hubLimit: 2, vaultLimit: 5, startDate: "2026-01-01", expiryDate: "2026-12-31", gracePeriod: 30 });

  const refresh = () => api.get("/vendor/licenses").then(setLicenses).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const showMsg = (m: string, t: "ok"|"err" = "ok") => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(""), 5000); };

  async function createLicense() {
    const l = await api.post("/vendor/licenses", form);
    showMsg(`License ${l.id} generated — audit recorded`); setShowForm(false); refresh();
  }

  async function revoke(id: string) {
    try { await api.post(`/vendor/licenses/${id}/revoke`); showMsg(`License ${id} revoked`); refresh(); }
    catch (e: any) { showMsg(e.message, "err"); }
  }

  async function renew(id: string) {
    await api.post(`/vendor/licenses/${id}/renew`, { expiryDate: "2027-12-31" });
    showMsg(`License ${id} renewed`); refresh();
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">License Factory</h1>
          <p className="text-sm text-slate-400 mt-0.5">Create, manage, and audit all customer licenses</p>
        </div>
        {["Owner","License Manager"].includes(vendorRole) && (
          <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
            <Plus size={13} />Create License
          </button>
        )}
      </div>

      {msg && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-4 py-2 ${msgType === "err" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
          {msgType === "err" && <AlertTriangle size={15} className="shrink-0 mt-0.5" />}{msg}
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New License</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[["customerId","Customer ID"],["siteId","Site ID"],["agentLimit","Agent Limit"],["hubLimit","Hub Limit"],["vaultLimit","Vault Limit"],["startDate","Start Date"],["expiryDate","Expiry Date"],["gracePeriod","Grace Period (days)"]].map(([k,label]) => (
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
          </div>
          <div className="flex gap-2">
            <button onClick={createLicense} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Generate License</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-700">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["License ID","Customer","Site","Edition","Agents","Hub","Vault","Start","Expiry","Status","Signature","Issued By","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {licenses.map(l => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{l.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{l.customerId}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.siteId}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{l.productEdition}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.agentLimit}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.hubLimit}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.vaultLimit}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.startDate}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.expiryDate}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={l.signatureStatus || "SIGNED"} /></td>
                <td className="px-4 py-3 text-xs text-slate-400">{l.issuedBy}</td>
                <td className="px-4 py-3">
                  {["Owner","License Manager"].includes(vendorRole) && l.status === "ACTIVE" && (
                    <div className="flex gap-1.5">
                      <button onClick={() => renew(l.id)} className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30">Renew</button>
                      <button onClick={() => revoke(l.id)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/30">Revoke</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
