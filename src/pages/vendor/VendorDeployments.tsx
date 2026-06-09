import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Circle } from "lucide-react";



const STAGES = ["Pre-sales","POC","Pilot","Implementation","UAT","Production rollout","Hypercare","Steady state","Renewal","Migration","Decommission"];

export default function VendorDeployments() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const refresh = () => api.get("/vendor/deployments").then(setDeployments).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function updateStage(id: string, stage: string) {
    await api.post(`/vendor/deployments/${id}/update-stage`, { stage });
    setMsg(`Stage updated to ${stage}`); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Deployments</h1>
        <p className="text-sm text-slate-400 mt-0.5">{deployments.length} active deployments</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <div className="grid grid-cols-1 gap-4">
        {deployments.map(d => {
          const checklist = d.checklist || {};
          const done = Object.values(checklist).filter(Boolean).length;
          const total = Object.keys(checklist).length;
          return (
            <div key={d.id} className="bg-slate-900 border border-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{d.customerName}</span>
                    <span className="text-slate-500">—</span>
                    <span className="text-slate-300">{d.siteName}</span>
                    <StatusBadge status={d.stage.replace(/\s+/g,"_").toUpperCase()} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Started {d.startDate} · Last updated {d.lastUpdate?.split("T")[0]}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Checklist progress</div>
                  <div className="text-lg font-bold text-white">{done}/{total}</div>
                  <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1">
                    <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(done/total)*100}%` }} />
                  </div>
                </div>
              </div>

              {/* Stage selector */}
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-1.5">Update Stage</div>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map(s => (
                    <button key={s} onClick={() => updateStage(d.id, s)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${d.stage === s ? "bg-violet-500 text-white border-violet-500" : "border-white/10 text-slate-400 hover:text-white hover:border-violet-500/50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <button onClick={() => setSelected(selected?.id === d.id ? null : d)} className="text-xs text-violet-400 hover:underline mb-3 block">
                {selected?.id === d.id ? "Hide" : "Show"} deployment checklist
              </button>

              {selected?.id === d.id && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(checklist).map(([k, v]) => (
                    <div key={k} className={`flex items-center gap-1.5 text-xs rounded p-2 ${v ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/50 text-slate-500"}`}>
                      {v ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
