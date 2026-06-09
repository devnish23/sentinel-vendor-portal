import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { ShieldCheck, Plus, CheckCircle2, Circle } from "lucide-react";



const CHECKLIST_LABELS: Record<string, string> = {
  authentication: "Authentication", rbac: "RBAC", mfaReadiness: "MFA Readiness",
  partnerEngineerRestricted: "Partner Engineer Restricted", auditLicenseActions: "Audit License Actions",
  auditPackageGeneration: "Audit Package Generation", auditCustomerDataAccess: "Audit Customer Data Access",
  auditSupportBundleDownloads: "Audit Support Bundle Downloads", auditReleaseApprovals: "Audit Release Approvals",
  auditRemoteSupportSessions: "Audit Remote Support Sessions", secretRedaction: "Secret Redaction",
  noEvidenceAccessByDefault: "No Evidence Access By Default", approvalForEvidenceExportSupport: "Approval for Evidence Export",
  devProdSeparation: "Dev/Prod Separation",
};

export default function VendorSecurityReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ productVersion: "3.1.0", customer: "ALL", scope: "Full platform", reviewer: "sec-reviewer@minifra.io" });

  const refresh = () => api.get("/vendor/security-reviews").then(setReviews).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  async function create() {
    await api.post("/vendor/security-reviews", form);
    setMsg("Security review created"); setShowForm(false); refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Security Reviews</h1>
          <p className="text-sm text-slate-400 mt-0.5">{reviews.filter(r => r.approvalStatus === "PENDING").length} pending owner approval</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-400">
          <Plus size={13} />Create Review
        </button>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg px-4 py-2">{msg}</div>}

      {showForm && (
        <div className="bg-slate-900 border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">New Security Review</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["productVersion","Product Version"],["customer","Customer (ALL for platform-wide)"],["scope","Scope"],["reviewer","Reviewer"]].map(([k,label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="text-sm bg-violet-500 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-violet-400">Create Review</button>
            <button onClick={() => setShowForm(false)} className="text-sm bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-slate-900 border border-white/5 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{r.id}</span>
                  <span className="text-slate-500">v{r.productVersion}</span>
                  <StatusBadge status={r.status} />
                  <StatusBadge status={r.riskRating} />
                  <StatusBadge status={r.approvalStatus} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Reviewer: {r.reviewer} · Scope: {r.scope}</div>
              </div>
              <button onClick={() => setSelected(selected?.id === r.id ? null : r)} className="text-xs text-violet-400 hover:underline">
                {selected?.id === r.id ? "Hide" : "View"} Checklist
              </button>
            </div>

            {r.findings?.length > 0 && (
              <div className="text-xs text-emerald-400 bg-emerald-500/5 rounded p-2 mb-2">
                {r.findings.join(" · ")}
              </div>
            )}

            {selected?.id === r.id && r.checklist && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {Object.entries(r.checklist).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-1.5 text-xs rounded p-2 ${v ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {v ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    {CHECKLIST_LABELS[k] || k}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button className="text-xs bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-500/30">Approve Review</button>
              <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">Export Review Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
