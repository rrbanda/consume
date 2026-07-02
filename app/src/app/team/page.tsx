import { getAgents } from "@/lib/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ROLE_ORDER = ["ceo", "cto", "pm", "engineer", "researcher", "devops", "general"];
const ROLE_LABELS: Record<string, string> = {
  ceo: "CEO",
  cto: "CTO",
  pm: "Product Management",
  engineer: "Engineering",
  researcher: "Research",
  devops: "DevOps",
  general: "General",
};

export default async function TeamPage() {
  const agents = await getAgents();

  const grouped: Record<string, any[]> = {};
  for (const agent of agents) {
    const role = agent.role || "general";
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(agent);
  }

  const sortedRoles = Object.keys(grouped).sort(
    (a, b) => (ROLE_ORDER.indexOf(a) === -1 ? 99 : ROLE_ORDER.indexOf(a)) -
              (ROLE_ORDER.indexOf(b) === -1 ? 99 : ROLE_ORDER.indexOf(b))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Team</h1>
        <p className="text-gray-400 mt-1">{agents.length} agents across {sortedRoles.length} roles</p>
      </div>

      <div className="space-y-6">
        {sortedRoles.map((role) => (
          <div key={role} className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">
              {ROLE_LABELS[role] || role}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {grouped[role].map((agent: any) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#292929] text-xs font-semibold text-white">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.title || agent.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
