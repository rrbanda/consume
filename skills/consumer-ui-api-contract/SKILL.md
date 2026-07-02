---
name: Consumer UI API Contract
description: Maps every consumer UI screen to exact Paperclip API calls with request/response shapes, query parameters, and authentication patterns.
---

# Consumer UI API Contract

This skill defines the precise API contract between the consumer frontend and the Paperclip backend. Every screen's data requirements are mapped to specific REST endpoints.

## Authentication

All consumer UI requests use the same auth as Paperclip's board user:
- **Method:** Session cookie (from `/api/auth/sign-in/email`) OR board API key (Bearer token)
- **Scoping:** Every list query includes `?touchedByUserId=me` or filters by user's project/agent memberships
- **Base URL:** `${PAPERCLIP_API_URL}/api` (internal cluster service: `http://paperclip:3100/api`)

## Screen 1: Home Dashboard

### Data Requirements
- Count of pending tasks (my requests in todo/in_progress)
- Count of completed tasks (done today)
- Count of available agents (my memberships)
- Recent activity feed (last 20 items)

### API Calls

```
GET /api/companies/{companyId}/issues?touchedByUserId=me&status=todo,in_progress&limit=0
Response: { total: number }  // count only

GET /api/companies/{companyId}/issues?touchedByUserId=me&status=done&updatedAfter={todayISO}&limit=0
Response: { total: number }

GET /api/companies/{companyId}/agents
Response: { items: Agent[] }
Filter client-side: only agents where user has agent_membership

GET /api/companies/{companyId}/activity?limit=20
Response: { items: ActivityEntry[] }
Filter client-side: only entries where issue.assigneeAgentId is in my agent memberships
```

## Screen 2: Agent Catalog (My Agents)

### Data Requirements
- List of agents the user is a member of
- Each agent: name, role, title, status (idle/active/error), capabilities text
- Agent avatar (from metadata or generated)

### API Calls

```
GET /api/companies/{companyId}/agents
Response: {
  items: [{
    id: string,
    name: string,
    role: string,
    title: string,
    status: "idle" | "active" | "error" | "terminated",
    capabilities: string,
    metadata: object
  }]
}

// Agent membership check (to filter "my" agents):
// Option A: Pre-fetch memberships at login
GET /api/companies/{companyId}/members?principalType=user&principalId={userId}
// Cross-reference agentId from agent_memberships

// Option B: Use a dedicated endpoint if available
GET /api/agents/me/inbox-lite
Response: { agentIds: string[] }  // agents this user can interact with
```

## Screen 3: New Request (Create Task)

### Data Requirements
- Selected agent (from my catalog)
- Form fields: title, description, priority
- Optional: project assignment (from my project memberships)

### API Calls

```
POST /api/companies/{companyId}/issues
Headers: { "Content-Type": "application/json", "Authorization": "Bearer {token}" }
Body: {
  "title": "Build pitch deck for Acme Corp",
  "description": "Customer is in financial services, 500 employees...",
  "priority": "high",
  "assigneeAgentId": "{selectedAgentId}",
  "projectId": "{optionalProjectId}",
  "status": "todo"
}
Response: {
  id: string,
  identifier: "RED-123",
  title: string,
  status: "todo",
  assigneeAgentId: string,
  createdAt: string
}
```

## Screen 4: Task Thread (Conversation View)

### Data Requirements
- Issue details (title, status, assignee, timestamps)
- Activity feed (comments from user + agent responses)
- Live run status (is agent currently working?)
- Documents/work products attached

### API Calls

```
// Issue details
GET /api/issues/{issueId}
Response: {
  id, identifier, title, description, status, priority,
  assigneeAgentId, projectId, createdAt, updatedAt
}

// Activity/comments (the "conversation")
GET /api/issues/{issueId}/activity
Response: {
  items: [{
    id: string,
    type: "comment" | "status_change" | "work_product" | "system",
    content: string,        // markdown body
    authorType: "user" | "agent" | "system",
    authorId: string,
    createdAt: string
  }]
}

// Add user comment (follow-up question)
POST /api/issues/{issueId}/comments
Body: { "body": "Can you also include pricing comparison?" }
Response: { id, body, authorType: "user", createdAt }

// Check active run (is agent working right now?)
GET /api/issues/{issueId}/active-run
Response: { id, status: "running" | null, startedAt }

// Live run log (real-time progress)
GET /api/heartbeat-runs/{runId}/log?offset=0&limitBytes=256000
Response: { content: string, offset: number, hasMore: boolean }

// Work products / documents
GET /api/issues/{issueId}/work-products
Response: { items: [{ id, title, kind, url, createdAt }] }
```

### WebSocket (Real-time updates)
```
Connect: wss://{host}/api/live
Message format: { type: "issue_updated" | "run_started" | "run_completed" | "comment_added", payload: {...} }
Filter: only events for issues where touchedByUserId matches
```

## Screen 5: Deliverable Preview

### Data Requirements
- Full issue comment/work-product content (markdown)
- Rendered as rich HTML

### API Calls

```
// Get specific work product content
GET /api/issues/{issueId}/work-products/{productId}
Response: { id, title, kind, content: string (markdown), metadata, createdAt }

// Or get the full comment that contains the deliverable
GET /api/issues/{issueId}/activity?type=comment&authorType=agent
Response: { items: [{ content: "# Pitch Deck for Acme\n\n..." }] }
```

No additional API needed -- rendering is client-side (markdown -> HTML).

## Screen 6: Team / Shared

### Data Requirements
- Issues shared with me (via mentions/tags in comments)
- Issues from my shared projects (project_memberships)

### API Calls

```
// Issues from my projects (shared team work)
GET /api/companies/{companyId}/issues?projectId={sharedProjectId}&status=done&limit=50&sortField=updated&sortDir=desc
Response: { items: Issue[], total: number }

// Mentions/tags -- currently not a native Paperclip feature
// Workaround: filter activity where comment body contains @{myUsername}
// OR: use a custom label on issues to mark "shared with {userId}"
```

## Screen 7: Notifications

### Data Requirements
- Unread count
- Notification list (agent completed, needs input, shared with me)

### API Calls

```
// Unread issues for this user
GET /api/companies/{companyId}/issues?unreadForUserId=me&limit=50
Response: { items: Issue[], total: number }

// Mark as read (archive from inbox)
// Paperclip uses inboxArchivedByUserId concept
POST /api/issues/{issueId}/inbox-archive
Body: {} // marks as read for current user
```

### Push Notifications (Outbound)
Requires a Paperclip **plugin** that listens to issue events and pushes to external channels:
- Webhook to Microsoft Teams incoming connector
- Webhook to Slack incoming webhook
- Email via SMTP

Plugin trigger: `issue.status_changed` -> if assignee is user's agent -> notify user

## Error Handling

All endpoints return standard HTTP errors:
- `401` -- session expired, redirect to login
- `403` -- user does not have access to this resource (enforce consumer scoping)
- `404` -- issue/agent not found
- `422` -- validation error (bad request body)
- `429` -- rate limited

Consumer UI should show friendly messages and retry with exponential backoff on 5xx.

## Rate Limits

For 30-50 concurrent users:
- Poll active runs every 3 seconds (or use WebSocket)
- Dashboard refresh every 30 seconds
- Activity feed poll every 5 seconds (when on task thread)
