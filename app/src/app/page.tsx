import { getDashboardStats } from "@/lib/data";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { pending, completedToday, agentCount, recentIssues } = await getDashboardStats();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your AI agent workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Pending Tasks</p>
          <p className="text-4xl font-bold text-white mt-2">{pending}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Completed Today</p>
          <p className="text-4xl font-bold text-green-400 mt-2">{completedToday}</p>
        </div>
        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm">Available Agents</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">{agentCount}</p>
        </div>
      </div>

      {/* Quick Ask */}
      <Link
        href="/request"
        className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl text-lg font-semibold transition-colors"
      >
        + Ask an Agent
      </Link>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Tasks</h2>
        <div className="space-y-2">
          {recentIssues.map((issue: any) => (
            <Link
              key={issue.id}
              href={`/tasks/${issue.identifier || issue.id}`}
              className="block bg-[#1f1f1f] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {issue.identifier}
                  </span>
                  <span className="text-white text-sm truncate max-w-md">{issue.title}</span>
                </div>
                <StatusBadge status={issue.status} />
              </div>
            </Link>
          ))}
          {recentIssues.length === 0 && (
            <p className="text-gray-500 text-center py-8">No tasks yet. Ask an agent to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}
