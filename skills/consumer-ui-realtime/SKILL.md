---
name: Consumer UI Real-time
description: Defines WebSocket events for live task progress, agent execution status, and real-time updates in the consumer interface.
---

# Consumer UI Real-time Events

## Connection

Paperclip exposes a WebSocket endpoint for real-time events:

```
wss://{paperclip-host}/api/live
```

Consumer UI proxy maintains a persistent WebSocket connection to Paperclip and forwards filtered events to the browser via Server-Sent Events (SSE) or client WebSocket.

## Event Types Relevant to Consumers

| Event Type | When it fires | Consumer sees |
|---|---|---|
| `issue_updated` | Task status changes (todo -> in_progress -> done) | Status badge update, progress indicator |
| `run_started` | Agent begins working on a task | "Agent is working..." indicator |
| `run_completed` | Agent finishes a task run | "Complete" notification + output available |
| `comment_added` | New comment on an issue | New message in task thread |
| `issue_created` | New child task created by agent | Sub-task appears in thread |
| `approval_requested` | Agent needs user input/approval | "Action needed" notification |

## Event Filtering (Consumer Scoping)

The proxy filters events before forwarding to the consumer:

```python
def should_forward_event(event, user_memberships):
    # Only forward events for issues the user owns or is touched by
    if event.type in ["issue_updated", "comment_added", "run_started", "run_completed"]:
        return event.issue_id in user.touched_issues or \
               event.agent_id in user.agent_memberships
    return False
```

## Client-Side Implementation

### SSE Connection (recommended for simplicity)

```typescript
// Consumer UI client
const eventSource = new EventSource('/api/events/stream');

eventSource.addEventListener('issue_updated', (e) => {
  const data = JSON.parse(e.data);
  // Update task card status badge
  updateTaskStatus(data.issueId, data.newStatus);
});

eventSource.addEventListener('run_started', (e) => {
  const data = JSON.parse(e.data);
  // Show "Agent is working..." animation
  showAgentWorking(data.issueId);
});

eventSource.addEventListener('run_completed', (e) => {
  const data = JSON.parse(e.data);
  // Show completion, enable "View Output" button
  showTaskComplete(data.issueId);
  incrementUnreadCount();
});

eventSource.addEventListener('comment_added', (e) => {
  const data = JSON.parse(e.data);
  // Append message to task thread
  appendMessage(data.issueId, data.comment);
});
```

## Progress Indicators

For long-running agent tasks, show meaningful progress:

### Agent Execution States

```
idle        -> [user creates task]
queued      -> "Queued - waiting for agent..."
running     -> "Agent is working..."
             -> Poll /heartbeat-runs/{id}/log for live output
completed   -> "Done - view results"
failed      -> "Error - agent encountered an issue"
```

### Live Log Streaming (Optional, for power users)

```
GET /api/heartbeat-runs/{runId}/log?offset={lastOffset}&limitBytes=256000
Response: { content: "Step 1: Gathering account data...\nStep 2: Building slides...", offset: 4096 }
```

Poll every 3 seconds while run is active. Display as a collapsible "progress log" in the task thread.

## Reconnection

- SSE auto-reconnects on disconnect (built into EventSource API)
- Include `Last-Event-ID` header on reconnect to resume from last received event
- Consumer UI shows "Reconnecting..." banner during disconnection
- Fallback: poll `/api/companies/{id}/issues?updatedAfter={lastPollTime}` every 10s if SSE fails

## Typing Indicator (Agent is composing)

When a run is active and producing log output:
- Show animated "..." typing indicator in task thread
- Disappear when run completes or no new log output for 10s
