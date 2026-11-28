"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Home, LogOut, ShieldCheck } from "lucide-react";

const navigationItems = [
  { label: "Overview", href: "/homeowner/overview", icon: Home },
  {
    label: "Statement of account",
    href: "/homeowner/statement-of-account",
    icon: FileText,
  },
];

export default function HomeownerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Clear the current view even if the logout request cannot reach the server.
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between bg-[#2d2d2d] text-[#f9f9f9]">
      <div>
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ff8c00]">
            <span className="text-base font-bold text-[#2d2d2d]">S</span>
          </div>
          <div>
            <div className="text-base font-bold">SineGANG</div>
            <div className="text-sm text-gray-400">HOMEOWNERS ASSN.</div>
          </div>
        </div>

        <div className="mt-2 px-6 py-2 text-sm text-gray-400">
          HOMEOWNER PORTAL
        </div>

        <nav
          aria-label="Homeowner navigation"
          className="mt-2 flex flex-col gap-1 px-4"
        >
          {navigationItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 text-base transition-colors ${
                  isActive
                    ? "border-[#ff8c00] bg-[#1e1e1e] font-bold text-[#ff8c00]"
                    : "border-transparent text-gray-300 hover:text-[#ff8c00]"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <div className="rounded-lg border border-[#3d3d3d] bg-[#1e1e1e] p-4">
          <ShieldCheck size={20} className="mb-2 text-[#ff8c00]" />
          <div className="text-base font-bold">Resident account</div>
          <div className="mt-1 text-sm text-gray-400">
            View your household balance, payments, and records.
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-[#3d3d3d] px-2 pt-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d] text-xs font-bold">
            AL
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#f9f9f9]">Adrian Lleva</div>
            <div className="text-xs text-gray-400">Homeowner · A-101</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex cursor-pointer items-center gap-2 px-2 pt-4 text-sm text-gray-400 transition-colors"
        >
          <LogOut size={16} className="transition-colors group-hover:text-[#ff8c00]" />
          <span className="transition-colors group-hover:text-white">Sign out</span>
        </button>
      </div>
    </aside>
  );
}





