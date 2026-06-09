import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { useRole } from "@/lib/role-context";
import { Package, Plus, Lock, CheckCircle2, Circle } from "lucide-react";



export default function VendorReleases() {
  const { vendorRole } = useRole();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok"|"err">("ok");

  const refresh = () => api.get("/vendor/releases").then(setReleases).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const showMsg = (m: string, t: "ok"|"err" = "ok") => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(""), 5000); };

  async function approveRelease(id: string) {
    try {
      await api.post(`/vendor/releases/${id}/approve`, { role: vendorRole });
      showMsg(`Release ${id} approved`); refresh();
    } catch (e: any) {
      showMsg(e.message, "err");
    }
  }

  const GATE_LABELS: Record<string, string> = {
    engineering: "Engineering validation", security: "Security validation",
    installer: "Installer validation", upgrade: "Upgrade validation",
    rollback: "Rollback validation", documentation: "Documentation validation",
    ownerApproval: "Owner approval",
  };

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Builds / Releases</h1>
        <p className="text-sm text-slate-400 mt-0.5">Release tracker and approval workflow</p>
      </div>

      {msg && (
        <div className={`flex items-start gap-2 text-sm rounded-lg px-4 py-2 ${msgType === "err" ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"}`}>
          {msgType === "err" && <Lock size={14} className="shrink-0 mt-0.5" />}{msg}
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5 text-xs text-amber-400">
        Production releases can only be approved by the Owner role. Switch role to Owner to approve production releases.
      </div>

      <div className="space-y-4">
        {releases.map(r => (
          <div key={r.id} className={`bg-slate-900 border rounded-xl p-5 ${r.approvalStatus === "PENDING" ? "border-yellow-500/20" : "border-white/5"}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-lg">v{r.version}</span>
                  <span className="font-mono text-xs text-slate-500">build {r.buildNumber}</span>
                  <StatusBadge status={r.releaseType.toUpperCase()} />
                  <StatusBadge status={r.approvalStatus} />
                  <StatusBadge status={r.signatureStatus} />
                </div>
                <div className="text-xs text-slate-500 mt-1">Built {r.buildDate} · {r.buildOwner} · commit: {r.gitCommit}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelected(selected?.id === r.id ? null : r)} className="text-xs text-violet-400 hover:underline">Details</button>
                {r.approvalStatus === "PENDING" && r.releaseType === "production" && (
                  <button onClick={() => approveRelease(r.id)} className="flex items-center gap-1 text-xs bg-violet-500 text-white px-3 py-1 rounded-lg hover:bg-violet-400">
                    {vendorRole !== "Owner" && <Lock size={11} />}Approve Release
                  </button>
                )}
              </div>
            </div>

            {/* Gates */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(r.gates || {}).map(([gate, passed]) => (
                <div key={gate} className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${passed ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                  {passed ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                  {GATE_LABELS[gate] || gate}
                </div>
              ))}
            </div>

            {selected?.id === r.id && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3">
                {[["Release Notes",r.releaseNotes],["Security Fixes",r.securityFixes],["Known Issues",r.knownIssues],["Upgrade Notes",r.upgradeNotes]].map(([k,v]) => (
                  <div key={k} className="bg-slate-800/50 rounded p-3">
                    <div className="text-slate-500 mb-1">{k}</div>
                    <div className="text-slate-200">{v || "None"}</div>
                  </div>
                ))}
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="text-slate-500 mb-1">Package Checksum</div>
                  <div className="font-mono text-slate-300 break-all">{r.packageChecksum}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
