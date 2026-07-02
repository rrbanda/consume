"use client";

import Link from "next/link";

const STATUS_DOT_COLORS: Record<string, string> = {
  idle: "#6a6e73",
  active: "#3e8635",
  working: "#06c",
  error: "#c9190b",
};

interface AgentCardProps {
  id: string;
  name: string;
  title: string;
  status: string;
  capabilities: string;
}

export function AgentCard({ id, name, title, status, capabilities }: AgentCardProps) {
  const dotColor = STATUS_DOT_COLORS[status] ?? STATUS_DOT_COLORS.idle;

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 hover:border-white/[0.1]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#292929] text-sm font-semibold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{name}</h3>
            <p className="text-xs text-gray-400">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className="text-xs capitalize text-gray-500">{status}</span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-400">
        {capabilities}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/request?agent=${id}`}
          className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          Request Work
        </Link>
        <Link
          href={`/tasks?agent=${id}`}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-300"
        >
          View Tasks
        </Link>
      </div>
    </div>
  );
}
