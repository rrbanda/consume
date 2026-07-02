import { getApprovals } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Approvals</h1>
        <p className="text-gray-400 mt-1">Pending review items</p>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg">No pending approvals</p>
          <p className="text-gray-500 text-sm mt-2">
            Approval requests from agents will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval: any) => (
            <div
              key={approval.id}
              className="rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">
                    {approval.title || approval.description || "Approval Request"}
                  </h3>
                  {approval.description && approval.title && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                      {approval.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {approval.createdAt
                      ? new Date(approval.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="rounded-lg bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/30 transition-colors">
                    Approve
                  </button>
                  <button className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
