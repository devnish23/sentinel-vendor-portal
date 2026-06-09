import { Link, useLocation } from "wouter";
import { useRole, type VendorRole } from "@/lib/role-context";
import {
  LayoutDashboard, Key, HardDrive, ArrowRightLeft, Layers, Package,
  Wrench, Headphones, ShieldCheck, Eye, ClipboardList, BookOpen,
  Globe, Truck, Users, Menu, X, LogOut,
} from "lucide-react";
import { useState } from "react";

const VENDOR_NAV = [
  { label: "Dashboard",           path: "/",                    icon: LayoutDashboard },
  { label: "Customers",           path: "/customers",           icon: Users },
  { label: "Sites",               path: "/sites",               icon: Globe },
  { label: "Deployments",         path: "/deployments",         icon: Truck },
  { label: "Licenses",            path: "/licenses",            icon: Key },
  { label: "Hardware Bindings",   path: "/hardware-bindings",   icon: HardDrive },
  { label: "License Migrations",  path: "/license-migrations",  icon: ArrowRightLeft },
  { label: "Package Builder",     path: "/package-builder",     icon: Layers },
  { label: "Builds / Releases",   path: "/releases",            icon: Package },
  { label: "Support Bundles",     path: "/support-bundles",     icon: Wrench },
  { label: "Support Cases",       path: "/support-cases",       icon: Headphones },
  { label: "Security Reviews",    path: "/security-reviews",    icon: ShieldCheck },
  { label: "Partner Engineers",   path: "/partner-engineers",   icon: Eye },
  { label: "Vendor Audit Logs",   path: "/audit",               icon: ClipboardList },
  { label: "Knowledge Base",      path: "/knowledge-base",      icon: BookOpen },
];

const VENDOR_ROLES: VendorRole[] = [
  "Owner", "Release Manager", "License Manager",
  "L1 Support", "L2 Support", "L3 Support",
  "Security Reviewer", "Partner Engineer",
];

function NavItem({ label, path, icon: Icon }: { label: string; path: string; icon: any }) {
  const [location] = useLocation();
  const active = path === "/" ? location === "/" : location.startsWith(path);
  return (
    <Link href={path}>
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
        active ? "bg-violet-500/15 text-violet-300 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}>
        <Icon size={15} className="shrink-0" />
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { vendorRole, setVendorRole } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} flex-none flex flex-col border-r border-white/5 bg-slate-900 transition-all duration-200`}>
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-violet-400" />
            <div>
              <div className="text-sm font-bold text-white">MINIFRA</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Sentinel Vendor</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {VENDOR_NAV.map(item => <NavItem key={item.path} {...item} />)}
        </nav>

        <div className="px-3 py-3 border-t border-white/5">
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 px-1">Minifra Internal</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm shrink-0">
          <button onClick={() => setSidebarOpen(v => !v)} className="text-slate-400 hover:text-white transition-colors">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Role:</span>
            <select
              value={vendorRole}
              onChange={e => setVendorRole(e.target.value as VendorRole)}
              className="text-xs bg-slate-800 border border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {VENDOR_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Minifra Operations
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
