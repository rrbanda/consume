"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  DollarSign,
  Building2,
  Settings,
  MoreHorizontal,
} from "lucide-react";

const NAV_MAIN = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/request", label: "New Request", icon: PlusCircle },
];

const NAV_MANAGE = [
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/team", label: "Team", icon: Building2 },
];

const NAV_SETTINGS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/request", label: "Request", icon: PlusCircle },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/agents", label: "More", icon: MoreHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-white/[0.08] text-white"
            : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
        {label}
      </Link>
    );
  };

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

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          <div className="my-3 border-t border-white/[0.06]" />

          {NAV_MANAGE.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          <div className="my-3 border-t border-white/[0.06]" />

          {NAV_SETTINGS.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-xs text-gray-500">Paperclip v1.0</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-[#1f1f1f] px-2 py-1 lg:hidden">
        {MOBILE_NAV.map((item) => {
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
    </>
  );
}
