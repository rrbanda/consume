import { AgentCard } from "@/components/agent-card";

// TODO: Replace with Paperclip API call
// const client = new PaperclipClient(token);
// const agents = await client.getAgents(companyId);

const MOCK_AGENTS = [
  {
    id: "agent-1",
    name: "Pipeline Analyst",
    title: "Sales Pipeline & Forecasting",
    status: "active",
    capabilities:
      "Generates pipeline forecasts, analyzes win/loss trends, identifies at-risk deals, and produces weekly pipeline summary reports.",
  },
  {
    id: "agent-2",
    name: "Content Writer",
    title: "Marketing Content Specialist",
    status: "idle",
    capabilities:
      "Drafts blog posts, email sequences, social copy, and customer case studies. Follows brand voice guidelines.",
  },
  {
    id: "agent-3",
    name: "Security Analyst",
    title: "Infrastructure Security",
    status: "active",
    capabilities:
      "Audits RBAC configurations, reviews security policies, scans for CVEs, and generates compliance reports.",
  },
  {
    id: "agent-4",
    name: "CRM Specialist",
    title: "Salesforce Administration",
    status: "idle",
    capabilities:
      "Manages Salesforce configurations, updates field mappings, creates reports and dashboards, handles data cleanup.",
  },
  {
    id: "agent-5",
    name: "Market Analyst",
    title: "Competitive Intelligence",
    status: "active",
    capabilities:
      "Researches competitor products, tracks market trends, analyzes pricing strategies, and creates competitive battle cards.",
  },
  {
    id: "agent-6",
    name: "Demo Navigator",
    title: "Product Demo Support",
    status: "error",
    capabilities:
      "Guides interactive product demos, prepares environment walkthroughs, creates demo scripts, and handles Q&A preparation.",
  },
];

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Agents
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Your available AI agents. Click an agent to see their work or request a new task.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            title={agent.title}
            status={agent.status}
            capabilities={agent.capabilities}
          />
        ))}
      </div>
    </div>
  );
}
