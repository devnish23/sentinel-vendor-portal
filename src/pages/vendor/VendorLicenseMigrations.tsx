import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";



export default function VendorLicenseMigrations() {
  const [migrations, setMigrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const refresh = () => api.get("/vendor/license-migrations").then(setMigrations).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const act = async (id: string, endpoint: string, label: string) => {
    await api.post(`/vendor/license-migrations/${id}/${endpoint}`);
    setMsg(`${label} for ${id}`); refresh(); setTimeout(() => setMsg(""), 3000);
  };

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">License Migration Requests</h1>
        <p className="text-sm text-slate-400 mt-0.5">Review and approve customer hardware migrations</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="bg-slate-800/50 border border-white/5 rounded-lg px-4 py-3 text-xs text-slate-400 space-y-1">
        <strong className="text-slate-200">Migration workflow:</strong>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {["1. Customer requests","2. Submits source binding","3. Submits target binding","4. Vendor validates both","5. Vendor approves","6. Issues migration license","7. Dual validity active","8. Customer confirms cutover","9. Vendor deactivates source","10. Migration closed"].map(s => (
            <span key={s} className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Migration ID","Customer","Source","Target","Source Hash","Target Hash","Rollback Window","Dual Validity","Final Cutover","Source Deactivation","Status","Actions"].map(h => (
                <th key={h} className="text-left px-3 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {migrations.map(m => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-3 py-3 font-mono text-xs text-slate-400">{m.id}</td>
                <td className="px-3 py-3 text-xs text-slate-300">{m.customerName}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{m.sourceHostname}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{m.targetHostname}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-500 max-w-[100px] truncate">{m.sourceBindingHash}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-500 max-w-[100px] truncate">{m.targetBindingHash}</td>
                <td className="px-3 py-3 text-xs text-slate-400 whitespace-nowrap">{m.rollbackWindowStart} → {m.rollbackWindowEnd}</td>
                <td className="px-3 py-3"><StatusBadge status={m.dualValidityStatus} /></td>
                <td className="px-3 py-3"><StatusBadge status={m.finalCutoverStatus} /></td>
                <td className="px-3 py-3"><StatusBadge status={m.sourceDeactivationStatus} /></td>
                <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-3 py-3">
                  {["REQUESTED","UNDER_REVIEW"].includes(m.status) && (
                    <div className="flex gap-1">
                      <button onClick={() => act(m.id, "approve", "Approved")} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Approve</button>
                      <button onClick={() => act(m.id, "reject", "Rejected")} className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Reject</button>
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
