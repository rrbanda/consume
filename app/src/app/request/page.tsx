"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RequestPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      assigneeAgentId: form.get("agentId") as string,
      priority: form.get("priority") as string,
      status: "todo",
    };

    try {
      const companyId = process.env.NEXT_PUBLIC_COMPANY_ID || "52d75bd0-d5db-4aa3-ae5b-a991111c4e00";
      const res = await fetch(`/api/paperclip/companies/${companyId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/tasks"), 1500);
      }
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <div className="text-green-400 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-white">Request Submitted</h2>
        <p className="text-gray-400 mt-2">Your agent is on it. Redirecting to tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New Request</h1>
        <p className="text-gray-400 mt-1">Ask an agent to do something for you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Agent</label>
          <select
            name="agentId"
            required
            className="w-full bg-[#292929] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select an agent...</option>
            <option value="a0000001-0001-4000-8000-000000000001">AI Sales Operations Lead</option>
            <option value="a0000001-0003-4000-8000-000000000003">Pitch Builder</option>
            <option value="a0000001-0004-4000-8000-000000000004">RFQ Response Agent</option>
            <option value="a0000001-0005-4000-8000-000000000005">Sales Simulation Engine</option>
            <option value="a0000001-0006-4000-8000-000000000006">Field Ops Assistant</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            name="title"
            required
            placeholder="What do you need?"
            className="w-full bg-[#292929] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Provide details, context, and any requirements..."
            className="w-full bg-[#292929] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Priority</label>
          <select
            name="priority"
            className="w-full bg-[#292929] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
