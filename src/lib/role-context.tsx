import { createContext, useContext, useState, type ReactNode } from "react";

export type VendorRole =
  | "Owner"
  | "Release Manager"
  | "License Manager"
  | "L1 Support"
  | "L2 Support"
  | "L3 Support"
  | "Security Reviewer"
  | "Partner Engineer";

interface RoleState {
  vendorRole: VendorRole;
  setVendorRole: (r: VendorRole) => void;
}

const RoleContext = createContext<RoleState | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [vendorRole, setVendorRole] = useState<VendorRole>("Owner");
  return (
    <RoleContext.Provider value={{ vendorRole, setVendorRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
