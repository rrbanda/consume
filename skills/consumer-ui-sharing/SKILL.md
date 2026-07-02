---
name: Consumer UI Sharing
description: Defines how agent outputs are shared between users, tagging, mentions, and team collaboration features.
---

# Consumer UI Sharing Model

## Sharing Primitives

### 1. Share via Project Membership

When a task belongs to a shared project, ALL project members can see it:

```
Project: "Q3 Enterprise Pitches"
Members: [jmitsky, pbyrnes, hshishir]
-> Any task in this project is visible to all 3 users
```

Implementation: `GET /api/companies/{id}/issues?projectId={sharedProjectId}` returns tasks visible to all project members.

### 2. Share via Direct Mention (@tag)

A user mentions a teammate in a task comment:

```
User comment: "@pbyrnes take a look at this pitch -- feedback?"
```

Implementation:
- Consumer UI parses `@username` patterns in comment text
- On submit, the backend records a "mention" (either as a label on the issue or a separate mentions table)
- The mentioned user sees this task in their "Shared with me" view
- Triggers a notification to the mentioned user

### 3. Share via Forward

User explicitly forwards an agent output to a teammate:

```
Action: "Share with..." button on deliverable preview
Select: Patrick Byrnes
Optional message: "This pitch looks good for your Acme meeting"
```

Implementation:
- Creates a comment on the issue: "[Shared by Jason Mitsky with Patrick Byrnes]: This pitch looks good..."
- Adds Patrick to `touchedByUserId` list for this issue (or adds a project membership)
- Triggers notification to Patrick

### 4. Share via Link

User copies a shareable link to the task/output:

```
URL: https://consume.example.com/tasks/RED-123
```

- Anyone with a consumer account AND appropriate membership can view
- If recipient is not a member, they see "Request Access" prompt

## Data Model

### Mentions (new, in consumer UI database)

```sql
CREATE TABLE mentions (
  id UUID PRIMARY KEY,
  issue_id UUID NOT NULL,        -- Paperclip issue ID
  mentioned_user_id TEXT NOT NULL,
  mentioned_by_user_id TEXT NOT NULL,
  comment_id UUID,               -- which comment contains the mention
  message TEXT,                   -- optional sharing message
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Shared Items View Query

```sql
-- Tasks shared with me (via mentions)
SELECT DISTINCT m.issue_id
FROM mentions m
WHERE m.mentioned_user_id = :currentUserId
  AND m.read = FALSE;

-- Combined with project-shared tasks:
-- UNION issues from my project memberships
```

## Permission Rules

| Action | Who can do it |
|---|---|
| Share within same project | Any project member |
| Share outside project (@mention) | Any user who owns the task |
| Forward to teammate | Task owner or anyone already shared with |
| View shared output | Only if mentioned, project member, or task owner |
| Comment on shared task | Anyone with view access |
| Re-share (forward again) | Anyone with view access |

## UI Components

### Share Button (on deliverable preview)

```
[Share] -> dropdown:
  - Copy link
  - Share with teammate (opens user picker)
  - Share to project (moves task to a shared project)
```

### "Shared with me" Feed

```
[Avatar] Patrick Byrnes shared "Acme Corp Pitch Deck" with you
  "Take a look before Thursday's meeting"
  [View] [Dismiss]
```

### @Mention Autocomplete

In comment input field:
- Type `@` -> shows list of team members
- Filter by typing name
- Select -> inserts `@username` mention
- On submit -> creates mention record + notification

## Privacy

- Sharing does NOT grant access to the full task thread history (only from the share point forward)
- Agent-internal reasoning (run logs) is never shared -- only the final output/comments
- Users cannot see which OTHER people a task was shared with (unless they're in the same project)
