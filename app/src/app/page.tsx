import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { PlusCircle, CheckCircle2, Clock, Users } from "lucide-react";

// TODO: Replace with Paperclip API calls
// const client = new PaperclipClient(token);
// const issues = await client.getMyIssues(companyId);
// const agents = await client.getAgents(companyId);

const MOCK_STATS = {
  pending: 7,
  completedToday: 4,
  availableAgents: 5,
};

const MOCK_RECENT_TASKS = [
  {
    id: "1",
    identifier: "RED-142",
    title: "Generate Q3 pipeline forecast report",
    status: "in_progress",
    agentName: "Pipeline Analyst",
    updatedAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
  {
    id: "2",
    identifier: "RED-141",
    title: "Draft customer onboarding email sequence",
    status: "done",
    agentName: "Content Writer",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    identifier: "RED-139",
    title: "Audit RBAC permissions for staging cluster",
    status: "blocked",
    agentName: "Security Analyst",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "4",
    identifier: "RED-138",
    title: "Update Salesforce opportunity stage mappings",
    status: "todo",
    agentName: "CRM Specialist",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "5",
    identifier: "RED-136",
    title: "Research competitive landscape for RHOAI 3.4",
    status: "done",
    agentName: "Market Analyst",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {greeting}, Raghu
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Here&apos;s what your agents are working on today.
          </p>
        </div>
        <Link
          href="/request"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ee0000] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-[#cc0000] hover:shadow-red-900/30"
        >
          <PlusCircle className="h-4 w-4" />
          Quick Ask
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-5 w-5 text-[#f0ab00]" />}
          label="Pending Tasks"
          value={MOCK_STATS.pending}
          accent="#f0ab00"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-[#3e8635]" />}
          label="Completed Today"
          value={MOCK_STATS.completedToday}
          accent="#3e8635"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-[#06c]" />}
          label="Available Agents"
          value={MOCK_STATS.availableAgents}
          accent="#06c"
        />
      </div>

      {/* Recent activity */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Recent Activity
          </h2>
          <Link
            href="/tasks"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            View all
          </Link>
        </div>

        <div className="space-y-2">
          {MOCK_RECENT_TASKS.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-4 transition-all hover:border-white/[0.1] hover:bg-[#242424]"
            >
              <span className="hidden shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gray-400 sm:inline">
                {task.identifier}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-gray-200">
                {task.title}
              </span>
              <StatusBadge status={task.status} />
              <span className="hidden text-xs text-gray-500 sm:inline">
                {timeAgo(task.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}15` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}
