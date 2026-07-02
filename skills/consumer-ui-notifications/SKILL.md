---
name: Consumer UI Notifications
description: Defines push notification triggers, delivery channels, user preferences, and integration with Teams/Slack/email.
---

# Consumer UI Notifications

## Notification Triggers

| Trigger | Priority | Message |
|---------|----------|---------|
| Agent completed my task | High | "{AgentName} completed: {TaskTitle}" |
| Agent needs my input (approval requested) | Critical | "Action needed: {AgentName} is waiting for your approval" |
| Someone shared output with me | Medium | "{UserName} shared: {TaskTitle}" |
| Agent failed on my task | High | "Error: {AgentName} couldn't complete {TaskTitle}" |
| Weekly summary | Low | "This week: {N} tasks completed, {M} pending" |

## Delivery Channels

### In-App Notifications (always on)

```typescript
interface Notification {
  id: string;
  type: "task_completed" | "input_needed" | "shared" | "error" | "summary";
  title: string;
  body: string;
  issueId: string;
  agentName: string;
  read: boolean;
  createdAt: string;
}
```

Stored in a lightweight table or derived from Paperclip activity log filtered by user.

### Microsoft Teams (webhook)

Integration via Teams Incoming Webhook connector:

```
POST https://outlook.office.com/webhook/{connector-id}
Body: {
  "@type": "MessageCard",
  "summary": "Agent completed: Build pitch for Acme",
  "sections": [{
    "activityTitle": "Pitch Builder completed your request",
    "activitySubtitle": "Build pitch for Acme Corp",
    "facts": [
      { "name": "Status", "value": "Done" },
      { "name": "Time taken", "value": "45 seconds" }
    ]
  }],
  "potentialAction": [{
    "@type": "OpenUri",
    "name": "View Result",
    "targets": [{ "os": "default", "uri": "https://consume.example.com/tasks/RED-123" }]
  }]
}
```

### Slack (webhook)

```
POST https://hooks.slack.com/services/{workspace}/{channel}/{token}
Body: {
  "blocks": [
    { "type": "header", "text": { "type": "plain_text", "text": "Pitch Builder completed your request" } },
    { "type": "section", "text": { "type": "mrkdwn", "text": "*Build pitch for Acme Corp*\nStatus: Done | Time: 45s" } },
    { "type": "actions", "elements": [
      { "type": "button", "text": { "type": "plain_text", "text": "View Result" }, "url": "https://consume.example.com/tasks/RED-123" }
    ]}
  ]
}
```

### Email (SMTP)

```
To: jmitsky@redhat.com
Subject: [AI Agent] Pitch Builder completed: Build pitch for Acme
Body: (HTML template with result preview + link to consumer UI)
```

## User Preferences

Stored per-user in consumer UI database (or as user metadata in Paperclip):

```yaml
notifications:
  channels:
    inApp: true          # always on
    teams: true          # Microsoft Teams webhook
    slack: false         # Slack disabled
    email: true          # Email notifications
  preferences:
    task_completed: [inApp, teams, email]
    input_needed: [inApp, teams, email]   # critical -- all channels
    shared: [inApp]                        # low priority
    error: [inApp, teams]
    weekly_summary: [email]
  quiet_hours:
    enabled: true
    start: "22:00"
    end: "07:00"
    timezone: "America/New_York"
```

## Implementation: Paperclip Plugin for Push Notifications

A Paperclip plugin listens to issue lifecycle events and dispatches notifications:

```
Plugin: consumer-notifications
Trigger: issue.status_changed, approval.requested, comment.added
Logic:
  1. Is this issue's assignee agent in any user's agent_memberships?
  2. If yes, who is the requesting user? (issue creator or touchedBy)
  3. Load user's notification preferences
  4. Dispatch to configured channels
```

The plugin uses `ctx.http.fetch()` for outbound webhook calls and runs as a Paperclip plugin worker.

## Notification Batching

To avoid notification fatigue:
- Group rapid successive events (3+ in 60s) into a single "batch" notification
- "Agent completed 3 tasks" instead of 3 separate notifications
- Weekly summary aggregates all week's activity into one digest
