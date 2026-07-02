import { getProjectIssues, getProjects } from "@/lib/data";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { TaskCard } from "@/components/task-card";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [projects, issues] = await Promise.all([
    getProjects(),
    getProjectIssues(id),
  ]);

  const project = projects.find((p: any) => p.id === id);
  const projectName = project?.name || "Project";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-white mt-1">{projectName}</h1>
          <p className="text-gray-400 mt-1">{issues.length} tasks</p>
        </div>
        <Link
          href={`/request?projectId=${id}`}
          className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          + New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {issues.map((issue: any) => (
          <TaskCard
            key={issue.id}
            id={issue.identifier || issue.id}
            identifier={issue.identifier || "—"}
            title={issue.title}
            status={issue.status}
            agentName={issue.assigneeAgent?.name || "Unassigned"}
            updatedAt={issue.updatedAt || issue.createdAt}
          />
        ))}
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks in this project yet.</p>
          <Link
            href={`/request?projectId=${id}`}
            className="inline-block mt-4 rounded-lg bg-white/[0.06] px-4 py-2 text-sm text-gray-300 hover:bg-white/[0.1] transition-colors"
          >
            Create the first task
          </Link>
        </div>
      )}
    </div>
  );
}
