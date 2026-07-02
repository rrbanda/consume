import { getAgents, getAgentIssues } from "@/lib/data";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { TaskCard } from "@/components/task-card";

export const dynamic = "force-dynamic";

const STATUS_DOT_COLORS: Record<string, string> = {
  idle: "#6a6e73",
  active: "#3e8635",
  working: "#06c",
  error: "#c9190b",
};

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [agents, issues] = await Promise.all([
    getAgents(),
    getAgentIssues(id),
  ]);

  const agent = agents.find((a: any) => a.id === id);

  if (!agent) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-400">Agent not found.</p>
        <Link href="/agents" className="text-sm text-blue-400 hover:underline mt-2 inline-block">
          ← Back to Agents
        </Link>
      </div>
    );
  }

  const dotColor = STATUS_DOT_COLORS[agent.status] ?? STATUS_DOT_COLORS.idle;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link href="/agents" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
        ← Back to Agents
      </Link>

      {/* Agent Header */}
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#292929] text-xl font-bold text-white">
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
                <span className="text-xs capitalize text-gray-500">{agent.status}</span>
              </div>
            </div>
            <p className="text-gray-400 mt-1">{agent.title || agent.role}</p>
            {agent.role && (
              <span className="mt-2 inline-block rounded bg-white/[0.06] px-2 py-0.5 text-xs text-gray-400 capitalize">
                {agent.role}
              </span>
            )}
          </div>
          <Link
            href={`/request?agentId=${id}`}
            className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Request Work
          </Link>
        </div>

        {agent.capabilities && (
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Capabilities
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {agent.capabilities}
            </p>
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {issues.map((issue: any) => (
            <TaskCard
              key={issue.id}
              id={issue.identifier || issue.id}
              identifier={issue.identifier || "—"}
              title={issue.title}
              status={issue.status}
              agentName={agent.name}
              updatedAt={issue.updatedAt || issue.createdAt}
            />
          ))}
        </div>
        {issues.length === 0 && (
          <p className="text-gray-500 text-center py-8">No tasks assigned to this agent yet.</p>
        )}
      </div>
    </div>
  );
}
