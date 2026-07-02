/** Paperclip API client -- per consumer-ui-api-contract skill */

const PAPERCLIP_URL = process.env.PAPERCLIP_API_URL || "http://paperclip:3100";

export interface PaperclipAgent {
  id: string;
  name: string;
  role: string;
  title: string;
  status: "idle" | "active" | "error" | "terminated";
  capabilities: string;
  metadata?: Record<string, unknown>;
}

export interface PaperclipIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeAgentId: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperclipActivity {
  id: string;
  type: "comment" | "status_change" | "work_product" | "system";
  content?: string;
  body?: string;
  authorType: "user" | "agent" | "system";
  authorId?: string;
  createdAt: string;
}

export class PaperclipClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string) {
    this.baseUrl = PAPERCLIP_URL;
    this.token = token;
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...init?.headers,
      },
    });
    if (!res.ok) throw new Error(`Paperclip API ${res.status}: ${path}`);
    return res.json();
  }

  async getAgents(companyId: string): Promise<PaperclipAgent[]> {
    const data = await this.fetch<{ items: PaperclipAgent[] }>(
      `/companies/${companyId}/agents`
    );
    return data.items;
  }

  async getMyIssues(companyId: string): Promise<PaperclipIssue[]> {
    const data = await this.fetch<{ items: PaperclipIssue[] }>(
      `/companies/${companyId}/issues?touchedByUserId=me&limit=50&sortField=updated&sortDir=desc`
    );
    return data.items;
  }

  async getIssue(issueId: string): Promise<PaperclipIssue> {
    return this.fetch<PaperclipIssue>(`/issues/${issueId}`);
  }

  async getActivity(issueId: string): Promise<PaperclipActivity[]> {
    const data = await this.fetch<{ items: PaperclipActivity[] }>(
      `/issues/${issueId}/activity`
    );
    return data.items;
  }

  async createIssue(
    companyId: string,
    data: {
      title: string;
      description: string;
      assigneeAgentId: string;
      priority?: string;
      projectId?: string;
    }
  ): Promise<PaperclipIssue> {
    return this.fetch<PaperclipIssue>(`/companies/${companyId}/issues`, {
      method: "POST",
      body: JSON.stringify({ ...data, status: "todo" }),
    });
  }

  async addComment(issueId: string, body: string): Promise<void> {
    await this.fetch(`/issues/${issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  async signIn(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
  }

  async getSession() {
    return this.fetch<{ user: { id: string; name: string; email: string } }>(
      "/auth/get-session"
    );
  }

  async getCompanies() {
    return this.fetch<{ id: string; name: string }[]>("/companies");
  }
}
