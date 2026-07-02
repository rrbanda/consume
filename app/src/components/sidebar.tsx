"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  PlusCircle,
  Share2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/request", label: "New Request", icon: PlusCircle },
  { href: "/shared", label: "Shared", icon: Share2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 bg-[#1f1f1f] border-r border-white/[0.06]">
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-white/[0.06]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ee0000]">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Paperclip
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-xs text-gray-500">Paperclip v1.0</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-[#1f1f1f] px-2 py-1 lg:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-white" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile hamburger (for sheets/overlays if needed) */}
      <button
        className="fixed right-4 top-4 z-50 rounded-lg bg-[#292929] p-2 text-gray-400 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        style={{ display: "none" }}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  );
}
