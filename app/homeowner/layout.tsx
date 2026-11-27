import type { ReactNode } from "react";
import HomeownerSidebar from "./components/homeowner-sidebar";

export default function HomeownerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] lg:flex">
      <HomeownerSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
