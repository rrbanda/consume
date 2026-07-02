/** Activity -> Chat message mapping -- per consumer-ui-paperclip-integration skill */

import type { PaperclipActivity } from "./paperclip-client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  hasDeliverable: boolean;
}

export function activityToMessages(activity: PaperclipActivity[]): ChatMessage[] {
  return activity
    .filter((a) => a.type === "comment" || a.type === "work_product")
    .map((a) => ({
      id: a.id,
      role: a.authorType === "agent" ? "assistant" as const : "user" as const,
      content: a.content || a.body || "",
      createdAt: a.createdAt,
      hasDeliverable: a.type === "work_product" || (a.content?.length ?? 0) > 500,
    }));
}
