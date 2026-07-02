import { getCostsSummary, getCostsByAgent } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const [summary, costsByAgent] = await Promise.all([
    getCostsSummary(),
    getCostsByAgent(),
  ]);

  const hasData = summary && (summary.totalSpend !== undefined || summary.total !== undefined);
  const agentCosts = Array.isArray(costsByAgent) ? costsByAgent : (costsByAgent?.items || []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Costs</h1>
        <p className="text-gray-400 mt-1">Manager View</p>
      </div>

      {!hasData ? (
        <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg">Cost data not available yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Cost tracking will appear here once agents begin processing tasks.
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Total Spend</p>
              <p className="text-4xl font-bold text-white mt-2">
                ${((summary.totalSpend ?? summary.total ?? 0) / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Budget Remaining</p>
              <p className="text-4xl font-bold text-green-400 mt-2">
                {summary.budgetRemaining !== undefined
                  ? `$${(summary.budgetRemaining / 100).toFixed(2)}`
                  : "—"}
              </p>
            </div>
            <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm">Top Agent by Cost</p>
              <p className="text-xl font-bold text-blue-400 mt-2 truncate">
                {summary.topAgent || agentCosts[0]?.agentName || "—"}
              </p>
            </div>
          </div>

          {/* Costs by Agent Table */}
          {agentCosts.length > 0 && (
            <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-white">Costs by Agent</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Agent
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Spend
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tasks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agentCosts.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-5 py-3 text-white">{row.agentName || row.agent || "—"}</td>
                      <td className="px-5 py-3 text-right text-gray-300">
                        ${((row.totalSpend ?? row.spend ?? 0) / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-400">
                        {row.taskCount ?? row.tasks ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
