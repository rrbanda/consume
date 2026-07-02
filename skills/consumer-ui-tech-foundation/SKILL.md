---
name: Consumer UI Technology Foundation
description: Defines the enterprise-grade UI/UX technology stack, design system architecture, and framework choices for building a world-class AI agent consumer interface.
---

# Consumer UI Technology Foundation

## The Stack (2026 State-of-the-Art for Agent UIs)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Protocol** | AG-UI (Agent-User Interaction Protocol) | Open standard for agent-human interaction. Event-based, supports generative UI, shared state, human-in-the-loop. Adopted by Oracle, AWS, Microsoft. |
| **Framework** | Next.js 15 (App Router, React 19, Server Components) | SSR + streaming + edge runtime. Industry standard for production AI apps. |
| **Agent UI SDK** | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`) | Generative UI, real-time bidirectional state sync, human-in-the-loop workflows. AG-UI native. |
| **Chat Components** | assistant-ui (`@assistant-ui/react`) | Production-grade Thread, Message, Composer primitives. Streaming, auto-scroll, retries, attachments, markdown, code highlight, voice, accessibility. 10K+ stars. |
| **AI Streaming** | Vercel AI SDK 7 (`ai`, `@ai-sdk/react`) | `useChat`, `useObject`, multi-provider streaming, structured output. Framework-agnostic transport. |
| **Design System** | shadcn/ui + Radix UI + Tailwind CSS 4 | Composable, accessible, customizable. Copy-paste components. Dark/light mode. |
| **Animation** | Framer Motion 12 | Physics-based animations, layout transitions, gesture support. |
| **Icons** | Lucide React | Consistent, tree-shakeable, 1500+ icons. |
| **Typography** | Red Hat Display + Red Hat Text (via Google Fonts) | On-brand for the team. |
| **Charts/Data Viz** | Recharts or Tremor | If dashboards needed. |
| **State** | Zustand + React Query (TanStack Query v5) | Lightweight global state + server-state caching with auto-revalidation. |
| **Forms** | React Hook Form + Zod | Type-safe validation, performant re-renders. |
| **Real-time** | Server-Sent Events (SSE) + AG-UI event stream | Native browser API, auto-reconnect, no library overhead. |
| **Testing** | Vitest + Testing Library + Playwright | Unit, integration, E2E. |
| **Build** | Turbopack (via Next.js) | Sub-second HMR, fast production builds. |

## AG-UI Protocol Integration

AG-UI is the standard that connects the Paperclip agent backend to the consumer frontend. It provides:

### Event Types (from AG-UI spec)

```typescript
// Core AG-UI events that flow from agent to UI
type AGUIEvent =
  | { type: "TEXT_MESSAGE_START"; messageId: string; role: "assistant" }
  | { type: "TEXT_MESSAGE_CONTENT"; messageId: string; delta: string }
  | { type: "TEXT_MESSAGE_END"; messageId: string }
  | { type: "TOOL_CALL_START"; toolCallId: string; toolName: string }
  | { type: "TOOL_CALL_ARGS"; toolCallId: string; delta: string }
  | { type: "TOOL_CALL_END"; toolCallId: string }
  | { type: "STATE_SNAPSHOT"; snapshot: Record<string, unknown> }
  | { type: "STATE_DELTA"; delta: JSONPatch[] }
  | { type: "CUSTOM"; name: string; value: unknown }
  | { type: "RUN_STARTED"; runId: string }
  | { type: "RUN_FINISHED"; runId: string }
  | { type: "RUN_ERROR"; message: string };
```

### Paperclip -> AG-UI Adapter

A thin adapter translates Paperclip's heartbeat run events into AG-UI events:

```typescript
// Adapter: Paperclip WebSocket -> AG-UI event stream
function paperclipToAGUI(paperclipEvent: PaperclipLiveEvent): AGUIEvent[] {
  switch (paperclipEvent.type) {
    case "run_started":
      return [{ type: "RUN_STARTED", runId: paperclipEvent.runId }];
    case "comment_added":
      return [
        { type: "TEXT_MESSAGE_START", messageId: paperclipEvent.commentId, role: "assistant" },
        { type: "TEXT_MESSAGE_CONTENT", messageId: paperclipEvent.commentId, delta: paperclipEvent.body },
        { type: "TEXT_MESSAGE_END", messageId: paperclipEvent.commentId },
      ];
    case "run_completed":
      return [{ type: "RUN_FINISHED", runId: paperclipEvent.runId }];
    case "issue_updated":
      return [{ type: "STATE_SNAPSHOT", snapshot: { status: paperclipEvent.newStatus } }];
  }
}
```

## CopilotKit Integration Pattern

CopilotKit provides the "agent-native" UI layer on top of AG-UI:

```typescript
// App-level provider
import { CopilotKit } from "@copilotkit/react-core";

export function App() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilot"  // proxied to Paperclip
      agent="pitch-builder"      // which Paperclip agent
    >
      <ConsumerLayout />
    </CopilotKit>
  );
}
```

### Generative UI (Agent renders components, not just text)

When an agent produces structured output (pitch deck sections, tables, charts), CopilotKit renders them as interactive React components instead of raw markdown:

```typescript
import { useCopilotAction } from "@copilotkit/react-core";

// Agent can "render" a component in the chat
useCopilotAction({
  name: "renderPitchSection",
  description: "Display a formatted pitch section",
  parameters: [
    { name: "title", type: "string" },
    { name: "content", type: "string" },
    { name: "chart_data", type: "object" },
  ],
  render: ({ title, content, chart_data }) => (
    <PitchSectionCard title={title} content={content} chartData={chart_data} />
  ),
});
```

### Shared State (bidirectional sync between user and agent)

```typescript
import { useCopilotReadable } from "@copilotkit/react-core";

// User's current context is always available to the agent
useCopilotReadable({
  description: "The customer the user is currently working on",
  value: { customerName: "Acme Corp", industry: "FSI", size: 500 },
});
```

## assistant-ui Component Architecture

assistant-ui provides production-grade chat primitives that handle all the hard UX problems:

```typescript
import { Thread } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";

// Thread handles: streaming, auto-scroll, retries, interruptions,
// markdown rendering, code blocks, attachments, accessibility
export function TaskThread({ issueId }: { issueId: string }) {
  const runtime = useChatRuntime({
    transport: new PaperclipChatTransport({ issueId }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread
        welcome={{ message: "How can I help you today?" }}
        assistantAvatar={{ src: "/agents/pitch-builder.png" }}
      />
    </AssistantRuntimeProvider>
  );
}
```

### Custom Runtime (connecting to Paperclip)

```typescript
// Custom transport that maps Paperclip issue activity to chat messages
class PaperclipChatTransport implements ChatTransport {
  constructor(private config: { issueId: string }) {}

  async send(messages: UIMessage[]): Promise<ReadableStream<UIMessageChunk>> {
    // POST new comment to Paperclip
    await fetch(`/api/paperclip/issues/${this.config.issueId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: messages.at(-1)?.content }),
    });

    // Return SSE stream of agent response
    return new ReadableStream({
      start(controller) {
        const eventSource = new EventSource(
          `/api/paperclip/issues/${this.config.issueId}/stream`
        );
        eventSource.onmessage = (e) => {
          controller.enqueue(JSON.parse(e.data));
        };
      },
    });
  }
}
```

## Design System Architecture

### Token System (CSS Variables)

```css
:root {
  /* Brand */
  --brand-primary: #ee0000;        /* Red Hat Red */
  --brand-secondary: #4a90d9;      /* AI Blue accent */

  /* Semantic */
  --color-success: #3e8635;
  --color-warning: #f0ab00;
  --color-danger: #c9190b;
  --color-info: #06c;

  /* Agent status */
  --agent-idle: #6a6e73;
  --agent-active: #3e8635;
  --agent-working: #06c;
  --agent-error: #c9190b;

  /* Surfaces */
  --surface-primary: #151515;       /* Dark mode */
  --surface-secondary: #1f1f1f;
  --surface-elevated: #292929;
  --surface-overlay: rgba(0,0,0,0.6);

  /* Typography */
  --font-heading: 'Red Hat Display', sans-serif;
  --font-body: 'Red Hat Text', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}
```

### Animation Standards (Framer Motion)

```typescript
// Consistent motion tokens
export const motion = {
  // Page transitions
  pageEnter: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } },

  // Card hover
  cardHover: { whileHover: { y: -2, shadow: "var(--shadow-lg)" }, transition: { type: "spring", stiffness: 300 } },

  // Status pulse (agent working)
  pulse: { animate: { scale: [1, 1.2, 1] }, transition: { repeat: Infinity, duration: 1.5 } },

  // Message appear
  messageAppear: { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.15 } },

  // Skeleton loading
  skeleton: { animate: { opacity: [0.5, 1, 0.5] }, transition: { repeat: Infinity, duration: 1.5 } },
};
```

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout + providers
│   ├── page.tsx                 # Dashboard (home)
│   ├── agents/
│   │   └── page.tsx             # Agent catalog
│   ├── request/
│   │   └── page.tsx             # New request form
│   ├── tasks/
│   │   ├── page.tsx             # Task list
│   │   └── [id]/
│   │       └── page.tsx         # Task thread (conversation)
│   ├── shared/
│   │   └── page.tsx             # Team shared outputs
│   └── api/
│       ├── copilot/route.ts     # CopilotKit runtime endpoint
│       └── paperclip/[...path]/route.ts  # Proxy to Paperclip
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── agent/                   # Agent-specific components
│   │   ├── agent-card.tsx
│   │   ├── agent-status.tsx
│   │   └── agent-catalog.tsx
│   ├── task/                    # Task-specific components
│   │   ├── task-card.tsx
│   │   ├── task-thread.tsx
│   │   ├── task-status.tsx
│   │   └── deliverable-preview.tsx
│   ├── chat/                    # Chat/conversation components
│   │   ├── thread.tsx           # assistant-ui Thread wrapper
│   │   ├── message.tsx          # Custom message rendering
│   │   └── composer.tsx         # Input with mentions, attachments
│   ├── shared/                  # Sharing components
│   │   ├── share-dialog.tsx
│   │   └── mention-input.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── mobile-nav.tsx
├── lib/
│   ├── paperclip/              # Paperclip API client
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── transport.ts        # AG-UI / assistant-ui transport
│   ├── auth/                   # Auth utilities
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Shared utilities
├── styles/
│   ├── globals.css             # CSS variables + Tailwind base
│   └── tokens.css              # Design tokens
└── public/
    └── agents/                 # Agent avatar images
```

## Performance Architecture

| Technique | Implementation |
|-----------|---------------|
| **Server Components** | All data fetching in server components (no client-side waterfalls) |
| **Streaming SSR** | `loading.tsx` skeletons while data loads |
| **Partial Prerendering** | Static shell + dynamic content |
| **React Query** | Client-side cache with stale-while-revalidate |
| **Virtual scrolling** | For long task lists (react-virtuoso) |
| **Image optimization** | Next.js Image component for agent avatars |
| **Bundle splitting** | Dynamic imports for heavy components (markdown renderer, code highlighter) |
| **Edge caching** | API proxy responses cached at edge for repeat reads |

## Accessibility (WCAG 2.1 AA)

- All components from Radix UI (accessible by default)
- Keyboard navigation for all interactions
- Screen reader announcements for real-time events (aria-live regions)
- Focus management on route changes
- Color contrast ratios >= 4.5:1 (text), >= 3:1 (UI components)
- Reduced motion support (`prefers-reduced-motion` media query)
- assistant-ui handles chat accessibility (auto-scroll pause, focus trap in compose)

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@copilotkit/react-core": "^1.0.0",
    "@copilotkit/react-ui": "^1.0.0",
    "@assistant-ui/react": "^0.8.0",
    "@assistant-ui/react-ai-sdk": "^0.8.0",
    "ai": "^7.0.0",
    "@ai-sdk/react": "^7.0.0",
    "framer-motion": "^12.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "lucide-react": "^0.400.0",
    "react-virtuoso": "^4.0.0",
    "react-markdown": "^9.0.0",
    "rehype-highlight": "^7.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest"
  }
}
```
