---
name: Consumer UI Paperclip Integration
description: Maps exactly what Paperclip already provides that the consumer UI reuses without reinventing, what thin adapters are needed, and what (if anything) requires new development.
---

# Consumer UI <-> Paperclip Integration

## Principle: Don't Reinvent What Paperclip Already Does

Paperclip is a full-featured platform with 345 API endpoints. The consumer UI is a **thin, scoped frontend** -- not a parallel backend. It should:

- NEVER duplicate agent execution logic
- NEVER manage its own task state
- NEVER store messages/comments separately
- NEVER implement its own auth system
- NEVER re-implement skill management

Everything flows through Paperclip's existing API.

---

## What Paperclip Already Provides (USE AS-IS)

### Authentication -- DONE, don't rebuild

| Capability | Paperclip provides | Consumer UI does |
|---|---|---|
| User sign-up/sign-in | `POST /api/auth/sign-up/email`, `POST /api/auth/sign-in/email` | Proxies these calls, stores session cookie |
| Session management | better-auth handles tokens, refresh, expiry | Just checks if session is valid |
| User profile | `GET /api/auth/get-session` returns user | Displays it |
| Logout | `POST /api/auth/sign-out` | Calls it |

**Zero auth code to write.** The consumer UI is a pass-through.

---

### Task/Issue Management -- DONE, don't rebuild

| Capability | Paperclip endpoint | Consumer UI does |
|---|---|---|
| Create task | `POST /api/companies/{id}/issues` | Wraps in a nice form, calls this |
| List my tasks | `GET /api/companies/{id}/issues?touchedByUserId=me` | Renders the response |
| Task detail | `GET /api/issues/{id}` | Displays title, status, assignee |
| Task comments (conversation) | `GET /api/issues/{id}/activity` | Renders as chat messages |
| Add comment (user follow-up) | `POST /api/issues/{id}/comments` | Sends from compose box |
| Task status | Already in issue object | Shows badge |
| Assign to agent | `assigneeAgentId` field on create | Dropdown in request form |
| Priority | `priority` field | Selector in form |
| Project assignment | `projectId` field | Optional dropdown |

**Zero task management code to write.** The consumer UI just renders Paperclip's existing issue data as a chat-like thread.

---

### Agent Discovery -- DONE, don't rebuild

| Capability | Paperclip endpoint | Consumer UI does |
|---|---|---|
| List agents | `GET /api/companies/{id}/agents` | Filters by membership, renders cards |
| Agent status | `status` field on agent object | Shows indicator |
| Agent capabilities | `capabilities` text field | Shows description |
| Agent name/title | Already in agent object | Renders |

**Zero agent management code.** Just read and display.

---

### Real-time Updates -- DONE, don't rebuild

| Capability | Paperclip provides | Consumer UI does |
|---|---|---|
| WebSocket live events | `wss://{host}/api/live` | Connects, filters by user scope, renders |
| Issue updated events | Fires on status change | Updates task card badge |
| Run started/completed | Fires on heartbeat run lifecycle | Shows "working..." / "done" |
| New comment events | Fires when agent posts comment | Appends to thread |

**Zero real-time infrastructure to build.** Paperclip's existing WebSocket is the source of truth.

---

### Agent Execution -- DONE, don't even think about it

| Capability | Paperclip handles entirely |
|---|---|
| Agent heartbeat scheduling | Paperclip's heartbeat scheduler |
| Adapter invocation (CLI, HTTP, gateway) | Paperclip's adapter system |
| Skill injection into agent prompts | Paperclip's skill materialization |
| Run logging | Paperclip's run log store |
| Budget tracking | Paperclip's cost system |
| Approval gates | Paperclip's approval system |

The consumer UI has **zero involvement** in agent execution. It creates a task, then observes the result.

---

### Skill Store -- DONE, don't rebuild

Skills are managed via GitOps + Paperclip skill store. The consumer UI never touches skills.

---

## What Needs a THIN Adapter (Glue Code Only)

These are small pieces that translate between Paperclip's data model and the consumer UI's presentation layer:

### 1. Membership-based filtering (client-side or proxy)

**Problem:** Paperclip returns ALL agents/issues for a company. Consumer needs only "mine."

**Solution (choose one):**
- **Client-side filter:** Fetch all agents, filter where user has `agent_memberships`. Simple. Works now.
- **Proxy filter:** Consumer UI server-side proxy removes items the user doesn't have membership for before sending to browser. More secure.

**Code needed:** ~20 lines in the API proxy.

```typescript
// In API proxy route
const agents = await paperclipFetch('/api/companies/{id}/agents');
const myMemberships = await paperclipFetch('/api/companies/{id}/members?userId=me');
const myAgentIds = myMemberships.filter(m => m.principalType === 'agent').map(m => m.agentId);
return agents.filter(a => myAgentIds.includes(a.id));
```

---

### 2. Activity -> Chat Message Mapping

**Problem:** Paperclip returns "activity" items (comments, status changes, work products). Consumer UI shows them as chat messages.

**Solution:** A pure function that maps activity entries to chat message shapes.

```typescript
function activityToMessages(activity: PaperclipActivity[]): ChatMessage[] {
  return activity
    .filter(a => a.type === "comment" || a.type === "work_product")
    .map(a => ({
      id: a.id,
      role: a.authorType === "agent" ? "assistant" : "user",
      content: a.content || a.body,
      createdAt: a.createdAt,
      // Rich content detection
      hasDeliverable: a.type === "work_product" || a.content?.length > 500,
    }));
}
```

**Code needed:** ~30 lines. Pure function, no state.

---

### 3. Paperclip WebSocket -> SSE Bridge

**Problem:** Paperclip's WebSocket pushes ALL company events. Consumer browser needs only "my" events via SSE.

**Solution:** Consumer UI server maintains ONE WebSocket to Paperclip, fans out filtered SSE streams to connected browsers.

```typescript
// Server-side: WebSocket listener -> per-user SSE streams
const paperclipWs = new WebSocket('wss://paperclip:3100/api/live');
const userStreams = new Map<string, ReadableStreamController>();

paperclipWs.on('message', (event) => {
  const parsed = JSON.parse(event.data);
  // Find which users care about this event
  for (const [userId, controller] of userStreams) {
    if (isRelevantToUser(parsed, userId)) {
      controller.enqueue(`data: ${event.data}\n\n`);
    }
  }
});
```

**Code needed:** ~50 lines. Standard pattern.

---

### 4. AG-UI Event Adapter

**Problem:** CopilotKit/assistant-ui expect AG-UI protocol events. Paperclip speaks its own event format.

**Solution:** Map Paperclip events to AG-UI events (defined in tech-foundation skill).

**Code needed:** ~40 lines. Already specified in the tech-foundation skill.

---

## What Does NOT Exist in Paperclip (Must Build New)

These are the ONLY things the consumer UI actually needs to create from scratch:

| Feature | Why Paperclip doesn't have it | What to build |
|---|---|---|
| **@Mentions / tagging** | Paperclip has no user-mention concept in comments | A mentions table in consumer UI DB (or use issue labels as workaround) |
| **Push notifications (external)** | Paperclip has no outbound Teams/Slack/email integration | Paperclip plugin OR consumer UI webhook listener that dispatches |
| **Notification preferences** | Paperclip has no per-user notification settings | Small preferences store (local DB or user metadata) |
| **Share/forward UI** | Paperclip doesn't expose "shared with users" | Use project memberships (move task to shared project) OR mentions table |
| **Unread badge (computed)** | Paperclip has `unreadForUserId` but no push badge count | Derived from polling `?unreadForUserId=me&limit=0` total count |

That's it. **5 small features** are net-new. Everything else is Paperclip's API rendered differently.

---

## Integration Diagram

```
┌──────────────────────────────────────────────────────┐
│ Consumer UI (Next.js)                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Browser]                                           │
│    ↕ SSE (filtered events)                           │
│  [Next.js Server]                                    │
│    ↕ Proxy + filter (20 lines)                       │
│    ↕ WebSocket (1 persistent connection)             │
│                                                      │
├──────────────────────────────────────────────────────┤
│ Paperclip (EXISTING - don't modify)                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  REST API (345 endpoints)        ← used as-is       │
│  WebSocket /api/live             ← used as-is       │
│  better-auth                     ← used as-is       │
│  Heartbeat scheduler             ← untouched        │
│  Skill store                     ← untouched        │
│  Activity log                    ← read only        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Summary: Build vs Reuse

| Layer | Lines of new code | Reuses from Paperclip |
|-------|-------------------|-----------------------|
| Auth | 0 (proxy only) | 100% -- better-auth |
| Task management | 0 (render only) | 100% -- issues API |
| Agent management | 0 (render only) | 100% -- agents API |
| Real-time | ~50 (WS->SSE bridge) | 90% -- WebSocket events |
| Chat/Thread | ~30 (activity->message map) | 95% -- activity API |
| Filtering/scoping | ~20 (membership filter) | 80% -- memberships exist, just filter |
| Mentions | ~100 (new feature) | 0% -- doesn't exist |
| Notifications | ~200 (plugin + preferences) | 0% -- doesn't exist |
| Sharing | ~50 (project membership reuse) | 70% -- project memberships |
| UI components | ~2000 (React components) | N/A -- presentation layer |
| AG-UI adapter | ~40 (event mapping) | 80% -- events exist, just map |

**Total new backend logic: ~500 lines.**
**Total UI components: ~2000 lines.**
**Paperclip modifications: ZERO.**
