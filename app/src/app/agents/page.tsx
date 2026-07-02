import { getAgents } from "@/lib/data";
import { AgentCard } from "@/components/agent-card";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Agents</h1>
        <p className="text-gray-400 mt-1">{agents.length} agents available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent: any) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            title={agent.title || agent.role}
            status={agent.status}
            capabilities={agent.capabilities || ""}
          />
        ))}
      </div>
    </div>
  );
}
