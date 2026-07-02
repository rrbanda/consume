"use client";

import { Bell } from "lucide-react";

export function NotificationBell({ count = 3 }: { count?: number }) {
  return (
    <button
      className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#292929] hover:text-white"
      aria-label={`${count} notifications`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ee0000] px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
