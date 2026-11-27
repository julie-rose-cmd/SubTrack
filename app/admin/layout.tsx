import type { ReactNode } from "react";
import AdministratorSidebar from "../(components)/administrator-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] lg:flex">
      <AdministratorSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
