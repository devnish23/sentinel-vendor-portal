import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Key, Package, ShieldCheck, Headphones, Activity } from "lucide-react";



function VStatCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-500">{label}</span>
        <div className={`p-1.5 rounded-md ${color}`}><Icon size={14} /></div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function VendorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/vendor/dashboard").then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading…</div>;
  if (!data) return <div className="p-8 text-red-400 text-sm">Failed to load</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Vendor Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Minifra Operations Overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VStatCard label="Total Customers" value={data.totalCustomers} sub={`${data.activeCustomers} production`} icon={Users} color="bg-violet-500/10 text-violet-400" />
        <VStatCard label="Expiring Licenses" value={data.expiringLicenses} sub="within 90 days" icon={Key} color="bg-yellow-500/10 text-yellow-400" />
        <VStatCard label="Open Support Cases" value={data.openSupportCases} sub="active tickets" icon={Headphones} color="bg-red-500/10 text-red-400" />
        <VStatCard label="Packages Generated" value={data.packagesGenerated} sub="total packages" icon={Package} color="bg-blue-500/10 text-blue-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VStatCard label="Pending Activations" value={data.pendingActivationRequests} sub="hardware binding" icon={Key} color="bg-orange-500/10 text-orange-400" />
        <VStatCard label="Pending Migrations" value={data.pendingMigrationRequests} sub="license migrations" icon={ShieldCheck} color="bg-teal-500/10 text-teal-400" />
        <VStatCard label="Security Reviews" value={data.securityReviewsPending} sub="pending" icon={ShieldCheck} color="bg-violet-500/10 text-violet-400" />
        <VStatCard label="Prod Releases" value={data.productionReleasesPendingApproval} sub="pending owner approval" icon={Package} color={data.productionReleasesPendingApproval > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-violet-400" /><span className="text-sm font-bold text-white">Recent Activity</span></div>
          <div className="space-y-2">
            {data.recentActivity?.map((a: any, i: number) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-slate-500 shrink-0 font-mono">{a.time}</span>
                <span className="text-slate-300">{a.event}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Package size={14} className="text-violet-400" /><span className="text-sm font-bold text-white">Platform Status</span></div>
          <div className="space-y-2 text-xs">
            {[
              ["Latest Version", data.latestProductVersion, "text-white"],
              ["Packages Generated", data.packagesGenerated, "text-white"],
              ["Security Reviews Pending", data.securityReviewsPending, data.securityReviewsPending > 0 ? "text-yellow-400" : "text-emerald-400"],
              ["Prod Releases Pending Approval", data.productionReleasesPendingApproval, data.productionReleasesPendingApproval > 0 ? "text-yellow-400" : "text-emerald-400"],
            ].map(([k, v, c]) => (
              <div key={String(k)} className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">{k}</span>
                <span className={String(c)}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
