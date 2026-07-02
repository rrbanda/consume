import { getMyIssues } from "@/lib/data";
import { TaskCard } from "@/components/task-card";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const issues = await getMyIssues();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <p className="text-gray-400 mt-1">{issues.length} tasks</p>
      </div>

      <div className="space-y-2">
        {issues.map((issue: any) => (
          <TaskCard
            key={issue.id}
            id={issue.identifier || issue.id}
            identifier={issue.identifier || ""}
            title={issue.title}
            status={issue.status}
            agentName={issue.assigneeAgentName || "Agent"}
            updatedAt={issue.updatedAt}
          />
        ))}
        {issues.length === 0 && (
          <p className="text-gray-500 text-center py-12">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
