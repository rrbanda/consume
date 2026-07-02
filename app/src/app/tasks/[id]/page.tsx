import { getIssue, getIssueComments } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
import { CommentForm } from "./comment-form";

export const dynamic = "force-dynamic";

export default async function TaskThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let issue: any = null;
  let comments: any[] = [];

  try {
    issue = await getIssue(id);
    if (issue?.id) {
      comments = await getIssueComments(issue.id);
    }
  } catch {
    // Issue might not exist or API error
  }

  if (!issue || !issue.id) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-400 text-lg">Task not found: {id}</p>
        <a href="/tasks" className="text-blue-400 hover:underline mt-4 inline-block">Back to tasks</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-[#1f1f1f] rounded-t-xl mt-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
            {issue.identifier}
          </span>
          <StatusBadge status={issue.status} />
          {issue.priority && (
            <span className="text-xs text-gray-500 capitalize">{issue.priority}</span>
          )}
        </div>
        <h1 className="text-lg font-semibold text-white mt-2">{issue.title}</h1>
        {issue.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-3">{issue.description}</p>
        )}
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#151515]">
        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet.</p>
            <p className="text-gray-600 text-sm mt-1">
              {issue.status === "todo" ? "Agent will respond once it picks up the task." : "Send a message below to interact."}
            </p>
          </div>
        )}

        {comments.map((comment: any) => {
          const isAgent = comment.authorType === "agent";
          const isSystem = comment.authorType === "system";

          if (isSystem) {
            return (
              <div key={comment.id} className="text-center">
                <span className="text-xs text-gray-600 bg-gray-800/50 px-3 py-1 rounded-full">
                  {comment.body || "System event"}
                </span>
              </div>
            );
          }

          return (
            <div
              key={comment.id}
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isAgent
                    ? "bg-[#292929] border border-gray-800 text-gray-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                    {isAgent ? "Agent" : "You"}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {comment.body || ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose */}
      <CommentForm issueId={issue.id} />
    </div>
  );
}
