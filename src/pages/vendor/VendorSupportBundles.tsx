import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Wrench, Play } from "lucide-react";



const DETECTABLE = ["Service not running","Hub unreachable","Agent offline","License expired","Hardware mismatch","Policy mismatch","Vault unreachable","Storage full","Time sync issue","Config drift","Port blocked","Upload queue stuck","Export failed","Tamper suspected"];

export default function VendorSupportBundles() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const refresh = () => api.get("/vendor/support-bundles").then(setBundles).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function analyze(id: string) {
    const r = await api.post(`/vendor/support-bundles/${id}/analyze`);
    setMsg(`Analysis complete: ${r.diagnosis}`); refresh();
    setTimeout(() => setMsg(""), 8000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Support Bundle Analyzer</h1>
        <p className="text-sm text-slate-400 mt-0.5">Analyze customer-uploaded diagnostic bundles</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      <details className="bg-slate-900/50 border border-white/5 rounded-lg">
        <summary className="px-4 py-2.5 text-xs text-slate-400 cursor-pointer">Detectable issues ({DETECTABLE.length})</summary>
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {DETECTABLE.map(d => <span key={d} className="text-[10px] bg-slate-800 text-slate-400 rounded px-2 py-0.5">{d}</span>)}
        </div>
      </details>

      <div className="space-y-4">
        {bundles.map(b => (
          <div key={b.id} className="bg-slate-900 border border-white/5 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{b.id}</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-slate-300">{b.customerName}</span>
                  <StatusBadge status={b.analysisStatus} />
                  <StatusBadge status={b.riskRating} />
                </div>
                <div className="text-xs text-slate-500 mt-1">Uploaded {new Date(b.uploadedTime).toLocaleString()} · v{b.productVersion}</div>
              </div>
              <div className="flex gap-2">
                {b.analysisStatus !== "COMPLETED" && (
                  <button onClick={() => analyze(b.id)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-400">
                    <Play size={11} />Analyze Bundle
                  </button>
                )}
                <button onClick={() => setSelected(selected?.id === b.id ? null : b)} className="text-xs text-violet-400 hover:underline">
                  {selected?.id === b.id ? "Hide" : "View"} Report
                </button>
              </div>
            </div>

            {b.analysisStatus === "COMPLETED" && (
              <div className="text-xs">
                <div className="flex gap-3 mb-2">
                  <span className="text-slate-500">Root cause:</span>
                  <span className="text-yellow-300 font-medium">{b.rootCauseCategory}</span>
                </div>
              </div>
            )}

            {selected?.id === b.id && b.analysisStatus === "COMPLETED" && (
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 mt-2">
                <div className="text-xs font-medium text-violet-400">Diagnosis Report</div>
                <div className="text-xs text-slate-300 leading-relaxed">{b.diagnosis}</div>
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-1">Recommended Fix</div>
                  <div className="text-xs text-slate-300 bg-slate-900 rounded p-2 font-mono">{b.recommendedFix}</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Escalation Required:</span>
                  <span className={b.escalationRequired ? "text-red-400" : "text-emerald-400"}>{b.escalationRequired ? "YES" : "No"}</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-500/30">Generate Diagnosis Report</button>
                  <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">Create Support Case</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
