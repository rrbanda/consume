---
name: Consumer UI Components
description: Defines each UI component, its data source, visual states, interactions, and responsive behavior for the enterprise-grade consumer frontend.
---

# Consumer UI Component Specification

## Design System Foundation

- **Framework:** Next.js 15 (App Router, Server Components)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Typography:** Red Hat Display (headings) + Red Hat Text (body)
- **Color system:** Dark mode default with light mode toggle. Brand accent from Red Hat palette.
- **Responsive:** Mobile-first. Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Accessibility:** WCAG 2.1 AA. All interactive elements keyboard-navigable. ARIA labels on icons.

## Component Catalog

### 1. AgentCard

**Purpose:** Displays a single agent in the catalog grid.

**Data source:** `GET /api/companies/{id}/agents` filtered by user memberships

**Props:**
```typescript
interface AgentCardProps {
  id: string;
  name: string;
  title: string;
  role: string;
  status: "idle" | "active" | "error";
  capabilities: string;
  lastTaskAt: string | null;
}
```

**Visual states:**
- Idle: subtle border, muted status dot (gray)
- Active: highlighted border, animated status dot (green pulse)
- Error: red status dot, muted card
- Hover: elevated shadow, "Request Work" button appears

**Interactions:**
- Click card -> navigate to `/agents/{id}` (agent detail + past tasks)
- Click "Request Work" -> navigate to `/request?agent={id}`

**Responsive:** 3-column grid on desktop, 2 on tablet, 1 on mobile (stacked cards)

---

### 2. TaskCard

**Purpose:** Shows a task summary in the dashboard or task list.

**Data source:** `GET /api/companies/{id}/issues?touchedByUserId=me`

**Props:**
```typescript
interface TaskCardProps {
  id: string;
  identifier: string;      // "RED-123"
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked" | "error";
  priority: "low" | "medium" | "high" | "critical";
  agentName: string;
  createdAt: string;
  updatedAt: string;
  hasUnread: boolean;
}
```

**Visual states:**
- Todo: gray badge
- In Progress: blue badge + subtle animation
- Done: green badge + checkmark
- Blocked: amber badge
- Error: red badge
- Unread: bold title + dot indicator

**Interactions:**
- Click -> navigate to `/tasks/{identifier}` (task thread)
- Swipe right (mobile): archive/mark read
- Priority shown as colored left border

---

### 3. TaskThread

**Purpose:** Full conversation view between user and agent.

**Data source:** 
- `GET /api/issues/{id}` (header)
- `GET /api/issues/{id}/activity` (messages)
- SSE stream for real-time updates

**Layout:**
```
┌─────────────────────────────────────┐
│ [← Back]  RED-123  Status: Done     │  <- Header
├─────────────────────────────────────┤
│                                     │
│ [Agent avatar] Agent message...     │  <- Messages scroll
│                                     │
│ [User avatar] Your comment...       │
│                                     │
│ [Agent avatar] Here is the result:  │
│ ┌─────────────────────────────────┐ │
│ │  [Rich Preview Card]            │ │  <- Embedded deliverable
│ │  "Pitch Deck for Acme Corp"     │ │
│ │  [View Full] [Share] [Export]   │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [Type a message...]     [Send]      │  <- Input
└─────────────────────────────────────┘
```

**Interactions:**
- Send message -> `POST /api/issues/{id}/comments`
- Click "View Full" -> full-screen deliverable preview
- Click "Share" -> share dialog
- Click "Export" -> download as PDF/markdown

---

### 4. DeliverablePreview

**Purpose:** Rich rendering of agent output (pitch decks, reports, RFQ responses).

**Data source:** Comment content (markdown) from activity feed

**Rendering:**
- Markdown -> HTML via `react-markdown` with custom components
- Code blocks with syntax highlighting
- Tables rendered as proper HTML tables
- Headers get anchor links
- Images rendered inline (if URLs)

**Actions toolbar:**
```
[Copy] [Export PDF] [Share] [Thumbs Up] [Thumbs Down]
```

**Responsive:** Full-width on mobile, max-width 800px on desktop with comfortable reading margins.

---

### 5. RequestForm

**Purpose:** Create a new task request.

**Fields:**
```
Agent:       [Dropdown - my agents]           <- required
Title:       [Text input]                     <- required
Description: [Rich text editor]              <- required
Priority:    [Low | Medium | High | Critical] <- default: medium
Project:     [Dropdown - my projects]         <- optional
Attachments: [File upload zone]               <- optional (future)
```

**Validation:**
- Agent must be from user's memberships
- Title: 5-200 characters
- Description: 10-10000 characters

**Submit:** `POST /api/companies/{id}/issues`

---

### 6. NotificationBell

**Purpose:** Shows unread count + dropdown of recent notifications.

**Data source:** SSE events + `/api/companies/{id}/issues?unreadForUserId=me`

**States:**
- No unread: bell icon (muted)
- Has unread: bell icon + red badge with count
- Dropdown open: list of recent notifications with "mark all read"

---

### 7. AgentStatusIndicator

**Purpose:** Shows what an agent is currently doing.

**States:**
- Idle: gray dot + "Available"
- Working on my task: green pulse + "Working on RED-123..."
- Working on other: yellow dot + "Busy"
- Error: red dot + "Unavailable"

---

### 8. SearchBar

**Purpose:** Search across my tasks, agents, and outputs.

**Implementation:** Client-side filter on already-loaded tasks (for speed) + server-side search for full-text:

```
GET /api/companies/{id}/issues?touchedByUserId=me&search={query}
```

---

## Page Layouts

### Desktop (>= 1024px)
```
┌──────┬──────────────────────────────────┐
│      │                                  │
│ Nav  │         Content Area             │
│      │                                  │
│ ───  │                                  │
│ Home │                                  │
│ Agts │                                  │
│ Tasks│                                  │
│ Team │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────────────────────────┐
│ [☰]  Consumer UI          [🔔] [👤]     │  <- Top bar
├──────────────────────────────────────────┤
│                                          │
│              Content Area                │
│         (full width, scrollable)         │
│                                          │
├──────────────────────────────────────────┤
│ [Home] [Agents] [Request] [Tasks] [More] │  <- Bottom nav
└──────────────────────────────────────────┘
```

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| API response (p95) | < 500ms |
| Real-time event delivery | < 1s |
