import { Share2 } from "lucide-react";

export default function SharedPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
        <Share2 className="h-8 w-8 text-gray-500" />
      </div>
      <h1
        className="text-xl font-bold"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Shared Workspace
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-400">
        Shared artifacts, reports, and deliverables from your agents will appear here.
        This feature is coming soon.
      </p>
    </div>
  );
}
