"use client";

import { useState } from "react";

export function CommentForm({ issueId }: { issueId: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await fetch(`/api/paperclip/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: message }),
      });
      setMessage("");
      window.location.reload();
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-[#1f1f1f]">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#292929] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
}
