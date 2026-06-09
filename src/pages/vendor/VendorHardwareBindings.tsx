import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { HardDrive } from "lucide-react";



export default function VendorHardwareBindings() {
  const [bindings, setBindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const refresh = () => api.get("/vendor/hardware-bindings").then(setBindings).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function approve(id: string) {
    const r = await api.post(`/vendor/hardware-bindings/${id}/approve`);
    setMsg(`Binding ${id} approved — Activation file: ${r.activationFile}`);
    refresh(); setTimeout(() => setMsg(""), 5000);
  }

  async function reject(id: string) {
    await api.post(`/vendor/hardware-bindings/${id}/reject`);
    setMsg(`Binding ${id} rejected`); refresh(); setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Hardware Binding Requests</h1>
        <p className="text-sm text-slate-400 mt-0.5">{bindings.filter(b => b.status === "PENDING").length} pending review</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {/* Flow */}
      <div className="bg-slate-800/50 border border-white/5 rounded-lg px-4 py-3 text-xs text-slate-400">
        <strong className="text-slate-200">Workflow:</strong> Customer runs binding script → sends binding file → Vendor imports &amp; validates → Vendor generates activation file → Customer imports activation → Result recorded
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-white/5">
              {["Request ID","Customer","Site","Hostname","Version","Binding Hash","Status","Requested","Reviewed By","Review Time","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bindings.map(b => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{b.customerName}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{b.siteId}</td>
                <td className="px-4 py-3 text-white">{b.hostname}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-400">{b.productVersion}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[130px] truncate">{b.bindingHash}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(b.requestedTime).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{b.reviewedBy ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{b.reviewTime ? new Date(b.reviewTime).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  {b.status === "PENDING" && (
                    <div className="flex gap-1.5">
                      <button onClick={() => approve(b.id)} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded hover:bg-emerald-500/30">Approve</button>
                      <button onClick={() => reject(b.id)} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                  {b.status === "APPROVED" && (
                    <button className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/30">Gen. Activation File</button>
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
