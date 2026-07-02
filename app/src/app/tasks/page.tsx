import { TaskCard } from "@/components/task-card";

// TODO: Replace with Paperclip API call
// const client = new PaperclipClient(token);
// const issues = await client.getMyIssues(companyId);

const MOCK_TASKS = [
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
  {
    id: "6",
    identifier: "RED-135",
    title: "Prepare demo environment for customer briefing",
    status: "error",
    agentName: "Demo Navigator",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "7",
    identifier: "RED-134",
    title: "Create competitive battle card for CloudShift AI",
    status: "done",
    agentName: "Market Analyst",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Tasks you&apos;ve requested, sorted by most recently updated.
        </p>
      </div>

      <div className="space-y-2">
        {MOCK_TASKS.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            identifier={task.identifier}
            title={task.title}
            status={task.status}
            agentName={task.agentName}
            updatedAt={task.updatedAt}
          />
        ))}
      </div>
    </div>
  );
}
