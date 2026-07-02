# Consume - Paperclip Consumer UI

Enterprise-grade consumer frontend for the Paperclip AI agent control plane.

## What This Is

A separate application that gives sales reps, SSAs, and managers a scoped view of their AI agents -- without exposing the full operator control plane.

**Consumers see:** their agents, their tasks, their outputs.
**Consumers don't see:** other people's work, agent configs, infrastructure, budgets.

## Architecture

```
Consumer UI (this app)  -->  Paperclip REST API  -->  Paperclip Backend
     |                             |
     v                             v
  Consumer's browser         Agent execution
```

The consumer UI is a Next.js application that proxies all requests through Paperclip's existing REST API, scoped to the authenticated user's memberships.

## Skills (Requirements Contract)

Each skill defines a precise aspect of the consumer UI requirements:

| Skill | What it defines |
|-------|----------------|
| `consumer-ui-api-contract` | Every API call per screen, request/response shapes |
| `consumer-ui-components` | UI components, layouts, states, responsive behavior |
| `consumer-ui-auth-flow` | SSO authentication, session management, scoping |
| `consumer-ui-realtime` | WebSocket events, live progress, typing indicators |
| `consumer-ui-notifications` | Push notifications (Teams/Slack/email), preferences |
| `consumer-ui-sharing` | Output sharing, @mentions, team collaboration |

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Proxied through Paperclip's better-auth
- **Real-time:** Server-Sent Events (SSE) from Paperclip WebSocket
- **Deployment:** OpenShift (containerized, GitOps-managed)

## Development

```bash
npm install
npm run dev
```

Requires `PAPERCLIP_API_URL` environment variable pointing to a running Paperclip instance.

## Deployment

Deployed via ArgoCD from the `paperclip-gitops` repo (`platform/base/apps/consumer-ui.yaml`).
