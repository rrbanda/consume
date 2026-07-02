"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";

// TODO: Replace with Paperclip API call
// const client = new PaperclipClient(token);
// const agents = await client.getAgents(companyId);

const MOCK_AGENTS = [
  { id: "agent-1", name: "Pipeline Analyst" },
  { id: "agent-2", name: "Content Writer" },
  { id: "agent-3", name: "Security Analyst" },
  { id: "agent-4", name: "CRM Specialist" },
  { id: "agent-5", name: "Market Analyst" },
  { id: "agent-6", name: "Demo Navigator" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "#6a6e73" },
  { value: "medium", label: "Medium", color: "#06c" },
  { value: "high", label: "High", color: "#f0ab00" },
  { value: "critical", label: "Critical", color: "#c9190b" },
];

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg py-12 text-center text-gray-500">Loading...</div>}>
      <RequestForm />
    </Suspense>
  );
}

function RequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAgent = searchParams.get("agent") ?? "";

  const [agent, setAgent] = useState(preselectedAgent);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent || !title.trim()) return;

    setSubmitting(true);

    // TODO: Replace with Paperclip API call
    // await client.createIssue(companyId, {
    //   title,
    //   description,
    //   assigneeAgentId: agent,
    //   priority,
    // });
    await new Promise((r) => setTimeout(r, 800));

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push("/tasks"), 2000);
  };

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3e8635]/15">
          <CheckCircle2 className="h-8 w-8 text-[#3e8635]" />
        </div>
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Request Submitted
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Your task has been created and assigned. Redirecting to tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          New Request
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Assign a new task to one of your agents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Agent selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Assign to Agent
          </label>
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            required
            className="w-full rounded-lg border border-white/[0.06] bg-[#1f1f1f] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#ee0000]/50 focus:ring-1 focus:ring-[#ee0000]/30"
          >
            <option value="">Select an agent...</option>
            {MOCK_AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., Generate weekly pipeline report"
            className="w-full rounded-lg border border-white/[0.06] bg-[#1f1f1f] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#ee0000]/50 focus:ring-1 focus:ring-[#ee0000]/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe what you need in detail..."
            className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#1f1f1f] px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-[#ee0000]/50 focus:ring-1 focus:ring-[#ee0000]/30"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  priority === p.value
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/[0.06] bg-[#1f1f1f] text-gray-400 hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !agent || !title.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ee0000] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-[#cc0000] disabled:opacity-40 disabled:hover:bg-[#ee0000]"
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
