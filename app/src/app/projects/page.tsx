import { getProjects } from "@/lib/data";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-gray-400 mt-1">{projects.length} projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project: any) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group block rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#242424]"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-white group-hover:text-gray-100">
                {project.name}
              </h3>
              <StatusBadge status={project.status || "todo"} />
            </div>
            <p className="mt-2 text-xs text-gray-400 line-clamp-2">
              {project.description || "No description"}
            </p>
            {project.identifier && (
              <span className="mt-3 inline-block rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gray-500">
                {project.identifier}
              </span>
            )}
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 text-center py-8 col-span-2">
            No projects yet.
          </p>
        )}
      </div>
    </div>
  );
}
