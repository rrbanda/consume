import Link from "next/link";
import { StatusBadge } from "./status-badge";

interface TaskCardProps {
  id: string;
  identifier: string;
  title: string;
  status: string;
  agentName: string;
  updatedAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TaskCard({ id, identifier, title, status, agentName, updatedAt }: TaskCardProps) {
  return (
    <Link
      href={`/tasks/${id}`}
      className="group block rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#242424]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gray-400">
              {identifier}
            </span>
            <StatusBadge status={status} />
          </div>
          <h3 className="mt-1.5 truncate text-sm font-medium text-white group-hover:text-gray-100">
            {title}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{agentName}</span>
        <span>{timeAgo(updatedAt)}</span>
      </div>
    </Link>
  );
}
