"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { StatusBadge } from "@/components/status-badge";
import { ArrowLeft, Send } from "lucide-react";

// TODO: Replace with Paperclip API calls
// const client = new PaperclipClient(token);
// const issue = await client.getIssue(id);
// const activity = await client.getActivity(id);
// const messages = activityToMessages(activity);

const MOCK_TASK = {
  id: "1",
  identifier: "RED-142",
  title: "Generate Q3 pipeline forecast report",
  status: "in_progress",
  agentName: "Pipeline Analyst",
};

const MOCK_MESSAGES = [
  {
    id: "m1",
    role: "user" as const,
    content: "Can you generate the Q3 pipeline forecast? Focus on the enterprise segment and include win-rate trends.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "m2",
    role: "assistant" as const,
    content: `I'll analyze the Q3 pipeline data for the enterprise segment. Here's what I'm finding:\n\n## Pipeline Summary\n\n| Metric | Q2 Actual | Q3 Forecast |\n|--------|-----------|-------------|\n| Total Pipeline | $4.2M | $5.1M |\n| Qualified Opps | 23 | 31 |\n| Avg Deal Size | $182K | $164K |\n| Win Rate | 34% | 38% |\n\n### Key Observations\n\n1. **Pipeline growth is healthy** — 21% increase QoQ driven by RHOAI interest\n2. **Win rate trending up** — improved from 34% to projected 38%, likely due to better demo coverage\n3. **Deal size compression** — average deal size down 10%, suggest investigating mid-market deals entering enterprise pipeline\n\n### Risk Factors\n\n- 3 deals totaling $890K have been in negotiation >60 days\n- Two enterprise accounts showing reduced engagement signals\n\nShall I break this down by region or include the full deal-level detail?`,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "m3",
    role: "user" as const,
    content: "Yes, break it down by region. Also flag any deals where we haven't had contact in the last 2 weeks.",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "m4",
    role: "assistant" as const,
    content: `## Regional Breakdown\n\n### North America\n- Pipeline: **$2.8M** across 18 opportunities\n- Win rate: 41% (strongest region)\n- Notable: ACME Corp ($420K) moving to technical validation\n\n### EMEA\n- Pipeline: **$1.6M** across 9 opportunities  \n- Win rate: 33%\n- Risk: 2 deals stalled in procurement\n\n### APAC\n- Pipeline: **$700K** across 4 opportunities\n- Win rate: 28% (below target)\n- Action needed: Limited SE coverage impacting close rates\n\n---\n\n### Stale Deals (No Contact >14 Days)\n\n| Account | Amount | Last Contact | Days Silent |\n|---------|--------|-------------|-------------|\n| GlobalTech Inc | $310K | Jun 12 | 20 days |\n| Meridian Systems | $245K | Jun 15 | 17 days |\n| Orion Healthcare | $335K | Jun 14 | 18 days |\n\nI recommend immediate outreach on all three. Combined risk exposure is **$890K**. Want me to draft outreach emails?`,
    createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
  },
];

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TaskThreadPage() {
  const params = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}`,
        role: "user" as const,
        content: newMessage,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewMessage("");
    // TODO: await client.addComment(issueId, newMessage);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
      {/* Thread header */}
      <div className="mb-6 space-y-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-gray-400">
                {MOCK_TASK.identifier}
              </span>
              <StatusBadge status={MOCK_TASK.status} />
            </div>
            <h1
              className="mt-1 text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {MOCK_TASK.title}
            </h1>
          </div>
          <span className="text-sm text-gray-400">
            Assigned to <span className="text-gray-200">{MOCK_TASK.agentName}</span>
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "rounded-br-md bg-[#ee0000]/90 text-white"
                  : "rounded-bl-md border border-white/[0.06] bg-[#1f1f1f] text-gray-200"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_table]:text-xs [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-300 [&_td]:px-3 [&_td]:py-1.5 [&_td]:text-gray-400 [&_table]:border-collapse [&_th]:border-b [&_th]:border-white/10 [&_td]:border-b [&_td]:border-white/[0.04] [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-200 [&_strong]:text-white [&_li]:text-gray-300 [&_p]:text-gray-300 [&_hr]:border-white/10">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              <p
                className={`mt-2 text-[10px] ${
                  msg.role === "user" ? "text-white/50" : "text-gray-500"
                }`}
              >
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="sticky bottom-0 border-t border-white/[0.06] bg-[#151515] pb-4 pt-4 lg:bottom-0">
        <div className="flex items-end gap-2 rounded-xl border border-white/[0.06] bg-[#1f1f1f] p-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ee0000] text-white transition-all hover:bg-[#cc0000] disabled:opacity-30 disabled:hover:bg-[#ee0000]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
