import { Switch, Route, Router as WouterRouter } from "wouter";
import { RoleProvider } from "@/lib/role-context";
import { AppShell } from "@/components/AppShell";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorCustomers from "@/pages/vendor/VendorCustomers";
import VendorSites from "@/pages/vendor/VendorSites";
import VendorDeployments from "@/pages/vendor/VendorDeployments";
import VendorLicenses from "@/pages/vendor/VendorLicenses";
import VendorHardwareBindings from "@/pages/vendor/VendorHardwareBindings";
import VendorLicenseMigrations from "@/pages/vendor/VendorLicenseMigrations";
import PackageBuilder from "@/pages/vendor/PackageBuilder";
import VendorReleases from "@/pages/vendor/VendorReleases";
import VendorSupportBundles from "@/pages/vendor/VendorSupportBundles";
import VendorSupportCases from "@/pages/vendor/VendorSupportCases";
import VendorSecurityReviews from "@/pages/vendor/VendorSecurityReviews";
import VendorPartnerEngineers from "@/pages/vendor/VendorPartnerEngineers";
import VendorAudit from "@/pages/vendor/VendorAudit";
import VendorKnowledgeBase from "@/pages/vendor/VendorKnowledgeBase";

export default function App() {
  return (
    <RoleProvider>
      <WouterRouter>
        <AppShell>
          <Switch>
            <Route path="/" component={VendorDashboard} />
            <Route path="/customers" component={VendorCustomers} />
            <Route path="/sites" component={VendorSites} />
            <Route path="/deployments" component={VendorDeployments} />
            <Route path="/licenses" component={VendorLicenses} />
            <Route path="/hardware-bindings" component={VendorHardwareBindings} />
            <Route path="/license-migrations" component={VendorLicenseMigrations} />
            <Route path="/package-builder" component={PackageBuilder} />
            <Route path="/releases" component={VendorReleases} />
            <Route path="/support-bundles" component={VendorSupportBundles} />
            <Route path="/support-cases" component={VendorSupportCases} />
            <Route path="/security-reviews" component={VendorSecurityReviews} />
            <Route path="/partner-engineers" component={VendorPartnerEngineers} />
            <Route path="/audit" component={VendorAudit} />
            <Route path="/knowledge-base" component={VendorKnowledgeBase} />
            <Route>
              <div className="p-8 text-slate-500 text-sm">Page not found — <a href="/" className="text-violet-400 hover:underline">Go to dashboard</a></div>
            </Route>
          </Switch>
        </AppShell>
      </WouterRouter>
    </RoleProvider>
  );
}
