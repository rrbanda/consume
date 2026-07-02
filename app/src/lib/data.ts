/** Server-side Paperclip data fetcher -- called from Server Components */
import { config } from "./config";

async function paperclipFetch<T>(path: string): Promise<T> {
  const url = `${config.paperclipApiUrl}/api${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.PAPERCLIP_API_KEY || ""}`,
    },
  });
  if (!res.ok) {
    console.error(`Paperclip API error: ${res.status} ${url}`);
    return [] as unknown as T;
  }
  return res.json();
}

export async function getAgents() {
  const data = await paperclipFetch<any>(
    `/companies/${config.companyId}/agents`
  );
  const items = Array.isArray(data) ? data : (data?.items || []);
  return items.filter((a: any) => a.status !== "terminated");
}

export async function getMyIssues() {
  const data = await paperclipFetch<any>(
    `/companies/${config.companyId}/issues?limit=50&sortField=updated&sortDir=desc`
  );
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getIssue(id: string) {
  return paperclipFetch<any>(`/issues/${id}`);
}

export async function getIssueActivity(id: string) {
  const data = await paperclipFetch<any>(
    `/issues/${id}/activity`
  );
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getProjects() {
  const data = await paperclipFetch<any>(`/companies/${config.companyId}/projects`);
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getProjectIssues(projectId: string) {
  const data = await paperclipFetch<any>(
    `/companies/${config.companyId}/issues?projectId=${projectId}&limit=50&sortField=updated&sortDir=desc`
  );
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getSkills() {
  const data = await paperclipFetch<any>(`/companies/${config.companyId}/skills`);
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getApprovals() {
  const data = await paperclipFetch<any>(`/companies/${config.companyId}/approvals`);
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getCostsByAgent() {
  return paperclipFetch<any>(`/companies/${config.companyId}/costs/by-agent`);
}

export async function getCostsByProject() {
  return paperclipFetch<any>(`/companies/${config.companyId}/costs/by-project`);
}

export async function getCostsSummary() {
  return paperclipFetch<any>(`/companies/${config.companyId}/costs/summary`);
}

export async function getBudgetsOverview() {
  return paperclipFetch<any>(`/companies/${config.companyId}/budgets/overview`);
}

export async function getAgentIssues(agentId: string) {
  const data = await paperclipFetch<any>(
    `/companies/${config.companyId}/issues?assigneeAgentId=${agentId}&limit=20&sortField=updated&sortDir=desc`
  );
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function getDashboardStats() {
  const [issues, agents] = await Promise.all([
    getMyIssues(),
    getAgents(),
  ]);

  const pending = issues.filter((i: any) => ["todo", "in_progress", "blocked"].includes(i.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = issues.filter((i: any) => i.status === "done" && i.updatedAt?.startsWith(today)).length;

  return { pending, completedToday, agentCount: agents.length, recentIssues: issues.slice(0, 8) };
}
