---
name: Consumer UI Paperclip Alignment
description: Aligns the consumer UI design with Paperclip's existing and planned features (CEO Chat, Agent Chat tab, Work Products) to avoid building what upstream is already shipping.
---

# Consumer UI -- Alignment with Paperclip Upstream

## Critical Discovery: Paperclip Already Has / Is Building Consumer Features

After researching the upstream repo (github.com/paperclipai/paperclip), the following features either EXIST or are PLANNED:

### Already Shipped (PR #6003)

**Direct Agent Chat Tab:**
- Chat tab on every agent detail page
- No issues created, no heartbeat cycle
- SSE-streamed via Claude Agent SDK
- Agent has full local tool access (bash, Paperclip API, file reads, git)
- System prompt from agent's instructionsRootPath (SOUL.md + AGENTS.md + HEARTBEAT.md)
- Agentic loop handles multi-turn tool calls until `end_turn`
- ~1s response time (direct SDK vs 12-22s CLI spawn)
- In-memory session state per agent

**Endpoints (from PR #6003):**
- `POST /api/agents/{id}/chat` -- start/continue chat session
- SSE stream for token-by-token responses
- Tool-call indicators in stream
- Image attachment support

### Planned: CEO Chat (Issue #5948, Roadmap)

- Board operator chats with leadership agent (CEO)
- Conversations resolve to real work objects (issues, plans, approvals)
- Generalizes existing `agentSessions` service
- Mutations tagged with actorId + sessionId for audit
- Connects to issue #49 (most-requested feature: "chat with agents")

### Planned: CEO/Company Console (Issue #6260)

- Focused console for the configured leadership agent
- CEO agent can: inspect state, create issues, assign/delegate, wake agents, request approval, summarize status
- Board operator sends message -> CEO responds with prose + structured Paperclip actions

### Planned: Artifacts & Work Products (Roadmap)

- Generated outputs become first-class with previews
- Handoff from "agent did work" to "here is the result" becomes visible

---

## What This Means for the Consumer UI

**DO NOT rebuild:**
- Agent chat (already exists as SSE-streamed tab)
- CEO/leadership interaction (being built upstream)
- Agent session management (exists in `agentSessions` service)
- Tool execution in chat (already works)

**The consumer UI should be a THEMED FRONTEND on top of these existing endpoints**, not a parallel implementation.

---

## Revised Architecture

```
Consumer UI                      Paperclip (already has)
──────────                      ────────────────────────
Branded theme                   /api/agents/{id}/chat (SSE)
User scoping (memberships)      /api/issues (task management)
Mobile-responsive layout        /api/issues/{id}/activity
Push notifications              /api/live (WebSocket events)
Sharing/mentions (new)          agentSessions service
AG-UI event mapping             Direct agent chat (PR #6003)
                                CEO Chat (planned upstream)
                                Work Products (planned)
```

---

## What the Consumer UI ACTUALLY Builds (Revised)

### Tier 1: Presentation Layer Only (reuses existing API)

| Feature | Implementation | Paperclip endpoint used |
|---------|---------------|------------------------|
| Chat with my agent | Themed UI calling existing chat endpoint | `POST /api/agents/{id}/chat` (SSE) |
| See task results | Render activity feed | `GET /api/issues/{id}/activity` |
| Create task request | Form -> API | `POST /api/companies/{id}/issues` |
| Agent catalog | Filtered list | `GET /api/companies/{id}/agents` |
| Real-time status | WebSocket consumer | `wss://{host}/api/live` |

### Tier 2: Scoping Layer (thin proxy)

| Feature | Implementation |
|---------|---------------|
| Membership-based filtering | Proxy adds `?touchedByUserId=me` |
| Agent visibility | Filter by `agent_memberships` |
| Project scoping | Filter by `project_memberships` |
| Consumer role enforcement | Proxy blocks admin routes |

### Tier 3: Net-New Features (not in Paperclip)

| Feature | Why Paperclip doesn't have it | Lines of code |
|---------|------------------------------|---------------|
| @Mentions/tagging users | No user-mention concept | ~100 |
| Push to Teams/Slack/email | No outbound notification | ~200 |
| Notification preferences | No per-user settings | ~50 |
| Shareable output links | No public/team sharing | ~50 |
| Branded mobile theme | Paperclip UI is operator-focused | ~2000 (UI) |

---

## Key Decisions (Informed by Upstream)

### 1. Use the existing Agent Chat endpoint -- don't build a new one

PR #6003 gives us SSE-streamed agent chat with tool calling, agentic loops, and 1-second responses. The consumer UI should call this directly through the proxy.

### 2. Wait for CEO Chat to ship, then integrate

The upstream CEO Chat feature (#5948, #6260) will provide exactly the "conversational leadership" interface we want. Rather than building our own, design the consumer UI to adopt it when it ships:

- Consumer UI's "Ask my CoS" button -> calls CEO Chat endpoint when available
- Fallback: creates a task via issues API (works today)

### 3. Use Work Products when they ship

The "Artifacts & Work Products" roadmap item will make deliverable previews native. Design the consumer UI's deliverable preview to consume whatever format Paperclip's work products use.

### 4. AG-UI adapter sits between existing Paperclip SSE and CopilotKit/assistant-ui

The chat SSE stream from PR #6003 needs to be mapped to AG-UI events for our frontend framework:

```typescript
// Paperclip agent chat SSE -> AG-UI events
function mapPaperclipChatSSE(chunk: PaperclipSSEChunk): AGUIEvent {
  if (chunk.type === "text_delta") {
    return { type: "TEXT_MESSAGE_CONTENT", messageId: chunk.id, delta: chunk.content };
  }
  if (chunk.type === "tool_call_start") {
    return { type: "TOOL_CALL_START", toolCallId: chunk.toolId, toolName: chunk.name };
  }
  if (chunk.type === "done") {
    return { type: "RUN_FINISHED", runId: chunk.sessionId };
  }
}
```

---

## Upstream Features We Should Track

| Feature | Issue/PR | Status | Impact on Consumer UI |
|---------|----------|--------|----------------------|
| Agent Chat Tab | PR #6003 | Merged | Use directly -- it's the chat backend |
| CEO Chat | #5948 | Planned | Adopt when ships -- CoS interaction |
| CEO Console | #6260 | Planned | May provide operator-grade chat we can theme |
| Work Products | Roadmap | Planned | Adopt for deliverable previews |
| Memory/Knowledge | Roadmap | Planned | Could enable agent context persistence |
| Artifacts | Roadmap | Planned | Rich output rendering |
| Cloud Deployments | Roadmap | Planned | May simplify our OpenShift deployment |
| Desktop App | Roadmap | Planned | Could share code with consumer mobile |

---

## Summary: Build vs Reuse vs Wait

| Category | Strategy |
|----------|----------|
| **Agent chat** | REUSE -- PR #6003 shipped it |
| **Task management** | REUSE -- issues API is complete |
| **Agent discovery** | REUSE -- agents API is complete |
| **Real-time events** | REUSE -- WebSocket is complete |
| **Deliverable previews** | WAIT + REUSE -- Work Products coming upstream |
| **CEO/leadership chat** | WAIT + ADOPT -- CEO Chat is coming upstream |
| **User scoping** | BUILD (thin proxy, ~50 lines) |
| **Push notifications** | BUILD (plugin or webhook, ~200 lines) |
| **@Mentions** | BUILD (net-new, ~100 lines) |
| **Branded mobile UI** | BUILD (React components, ~2000 lines) |
| **AG-UI adapter** | BUILD (event mapping, ~40 lines) |

**Total new code: ~2400 lines.**
**Paperclip modifications: ZERO.**
**Features reinvented: ZERO.**
