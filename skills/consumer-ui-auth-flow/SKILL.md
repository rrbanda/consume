---
name: Consumer UI Auth Flow
description: Documents the SSO authentication flow from consumer login through Paperclip session establishment and scoped API access.
---

# Consumer UI Authentication Flow

## Architecture

```
Consumer Browser
    |
    v
Consumer UI (Next.js on OpenShift)
    |
    v  (proxy API calls)
Paperclip REST API (http://paperclip:3100)
    |
    v  (session validation)
better-auth (Paperclip's auth system)
```

The consumer UI does NOT have its own auth system. It uses Paperclip's `better-auth` directly.

## Login Flow

### Step 1: User opens Consumer UI

Consumer navigates to `https://consume.apps.cluster.example.com`. The middleware checks for a valid session cookie.

### Step 2: No session -> redirect to login page

Consumer UI shows its own login form (branded for the team). The form collects email + password.

### Step 3: Authenticate against Paperclip

```
POST {PAPERCLIP_API_URL}/api/auth/sign-in/email
Headers: { "Content-Type": "application/json" }
Body: { "email": "jmitsky@redhat.com", "password": "..." }
Response: {
  "token": "session-token-value",
  "user": { "id": "...", "name": "Jason Mitsky", "email": "jmitsky@redhat.com" }
}
Set-Cookie: better-auth.session_token=...; HttpOnly; Secure; SameSite=Lax
```

### Step 4: Consumer UI stores session

- Store the session token in an HTTP-only cookie on the consumer domain
- All subsequent API calls to Paperclip include this token as `Authorization: Bearer {token}` OR forward the cookie if same-domain proxy

### Step 5: Fetch user context

```
GET {PAPERCLIP_API_URL}/api/auth/get-session
Headers: { "Authorization": "Bearer {token}" }
Response: {
  "user": { "id": "...", "name": "Jason Mitsky", "email": "jmitsky@redhat.com" },
  "session": { ... }
}
```

### Step 6: Fetch user memberships (scoping)

```
GET {PAPERCLIP_API_URL}/api/companies
Response: [{ "id": "52d75bd0-...", "name": "Red Hat Americas AI Platform Team" }]

// Then fetch what this user can access:
GET {PAPERCLIP_API_URL}/api/companies/{companyId}/agents
// Client filters by agent_memberships (or server-side if Paperclip adds consumer role filtering)
```

## Session Management

| Concern | Implementation |
|---------|---------------|
| Session duration | Inherit from Paperclip's better-auth config (default: 7 days) |
| Refresh | better-auth handles token refresh automatically |
| Logout | `POST /api/auth/sign-out` + clear consumer UI cookie |
| Session invalidation | If Paperclip returns 401, redirect to login |

## API Proxy Pattern

The consumer UI backend (Next.js server) proxies all Paperclip API calls:

```
Consumer Browser -> Consumer UI Server -> Paperclip API
```

Why proxy (not direct browser -> Paperclip):
- Hides Paperclip's internal service URL from the browser
- Allows consumer UI to inject scoping (add `?touchedByUserId=me` to every request)
- Enables response transformation (strip fields consumers shouldn't see)
- CORS is not an issue (same-origin from browser perspective)

### Proxy implementation (Next.js API route):

```typescript
// app/api/paperclip/[...path]/route.ts
export async function GET(req: Request) {
  const session = await getSession(req); // validate consumer cookie
  if (!session) return Response.redirect('/login');

  const paperclipUrl = `${PAPERCLIP_API_URL}/api/${path}`;
  const response = await fetch(paperclipUrl, {
    headers: { 'Authorization': `Bearer ${session.token}` }
  });

  // Optionally enforce scoping:
  // If path is /issues and no touchedByUserId param, add it
  return response;
}
```

## Consumer Role Enforcement

Until Paperclip natively supports a "consumer" role that restricts API access server-side, the consumer UI proxy enforces:

| Rule | Enforcement |
|------|-------------|
| Can't list all issues without user filter | Proxy injects `?touchedByUserId=me` |
| Can't modify agent config | Proxy blocks PATCH /agents/{id} |
| Can't access admin routes | Proxy blocks /api/admin/* |
| Can't see other users' data | Proxy strips non-owned items from responses |
| CAN create issues | Proxy allows POST /issues (validates assigneeAgentId is in user's memberships) |
| CAN comment on own issues | Proxy allows POST /issues/{id}/comments (validates ownership) |

## Security Considerations

- Consumer UI runs on OpenShift with its own Route (separate from Paperclip's Route)
- Session cookies are HttpOnly + Secure + SameSite=Lax
- No Paperclip API keys or secrets in browser JavaScript
- Proxy validates every request against user's membership scope
- Audit trail: all API calls logged with user identity by Paperclip's activity log
