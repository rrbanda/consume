import { getIssue, getIssueActivity } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
import { CommentForm } from "./comment-form";

export const dynamic = "force-dynamic";

export default async function TaskThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let issue: any = null;
  let activity: any[] = [];

  try {
    issue = await getIssue(id);
    activity = await getIssueActivity(issue?.id || id);
  } catch {
    // Issue might not exist or API error
  }

  if (!issue) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-gray-400">Task not found: {id}</p>
      </div>
    );
  }

  const messages = activity.filter(
    (a: any) => a.kind === "comment" || a.type === "comment"
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-[#1f1f1f]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded mr-2">
              {issue.identifier}
            </span>
            <StatusBadge status={issue.status} />
          </div>
        </div>
        <h1 className="text-lg font-semibold text-white mt-2">{issue.title}</h1>
        {issue.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{issue.description}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Waiting for agent to respond...
          </p>
        )}
        {messages.map((msg: any) => {
          const isAgent = msg.actorType === "agent" || msg.authorType === "agent";
          return (
            <div
              key={msg.id}
              className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  isAgent
                    ? "bg-[#292929] text-gray-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">
                  {isAgent ? "Agent" : "You"}
                </p>
                <div className="text-sm whitespace-pre-wrap">
                  {msg.body || msg.content || msg.text || ""}
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
