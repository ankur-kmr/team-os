# TeamOS - Architecture Overview

## 🏗️ High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  React Components (Next.js 15 App Router)                   │
│  ├── Auth Pages (Login, Register)                           │
│  ├── Org Pages (Select, Create)                             │
│  └── Dashboard Pages (Projects, Members, Billing, etc)      │
└────────────────────┬────────────────────────────────────────┘
                     │ (Form submissions, Server Actions)
                     │
┌────────────────────▼────────────────────────────────────────┐
│               SERVER ACTION LAYER                           │
│  Server Actions (app/actions.ts)                            │
│  ├── Validation                                             │
│  ├── RBAC Checks                                            │
│  ├── Business Logic                                         │
│  └── Audit Logging                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ RBAC Lib │ │Audit Lib │ │ Jobs Lib │
  │ (rbac.ts)│ │(audit.ts)│ │(jobs.ts) │
  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │
       └────────────┼────────────┘
                    │
┌────────────────────▼────────────────────────────────────────┐
│             DATABASE LAYER (Prisma ORM)                     │
│  PostgreSQL Database with:                                  │
│  ├── Users & Authentication                                 │
│  ├── Organizations (Tenant)                                 │
│  ├── Members (User-Org relationships with roles)            │
│  ├── Projects & Tasks                                       │
│  ├── Comments                                               │
│  ├── Subscriptions (Stripe)                                 │
│  ├── AuditLogs                                              │
│  ├── WebhookEvents (Queue)                                  │
│  └── FeatureFlags                                           │
└─────────────────────────────────────────────────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
   │ Stripe │ │Email Svc │ │Analytics │ │Metrics │
   └────────┘ └──────────┘ └──────────┘ └────────┘
```

---

## 🔐 Multi-Tenant Isolation

### Tenant Boundary: Organization

```
┌──────────────────────────────────────────────────────┐
│         Organization A (Tenant)                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Users (Members)                              │   │
│  │ ├── alice@company.com (OWNER)               │   │
│  │ ├── bob@company.com (ADMIN)                 │   │
│  │ └── carol@company.com (MEMBER)              │   │
│  │ Projects                                     │   │
│  │ ├── Website Revamp                          │   │
│  │ └── Mobile App                              │   │
│  │ Subscription: Pro ($29/month)               │   │
│  │ Usage: 15,234 / 50,000 API calls            │   │
│  │ Audit Logs: 234 events                      │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│         Organization B (Different Tenant)            │
│  ┌──────────────────────────────────────────────┐   │
│  │ Users (Members) - Different from Org A       │   │
│  │ ├── dave@startup.io (OWNER)                 │   │
│  │ └── eve@startup.io (MEMBER)                 │   │
│  │ Projects - Different from Org A             │   │
│  │ └── MVP Product                             │   │
│  │ Subscription: Free                          │   │
│  │ Usage: 890 / 1,000 API calls                │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

✅ Complete isolation - data in Org A NEVER visible to users in Org B
✅ Single codebase serves both organizations
✅ Org context passed through request (orgId cookie)
```

---

## 👥 Role-Based Access Control (RBAC)

### Role Hierarchy

```
OWNER
  ↓
ADMIN
  ↓
MEMBER

Permissions by Role:
┌─────────────────────────────────────────────────────────┐
│ OWNER - Full Control                                    │
│ • Manage members (invite, remove, change roles)        │
│ • Manage projects and tasks                            │
│ • Manage billing and subscription                      │
│ • Delete organization                                  │
│ • View audit logs                                      │
│ • Manage feature flags                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADMIN - Day-to-Day Management                          │
│ • Manage members (invite, remove, change roles)        │
│ • Manage projects and tasks                            │
│ • View audit logs                                      │
│ • Cannot delete org or manage billing                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MEMBER - Contributor                                    │
│ • Create and manage own tasks                          │
│ • Create projects                                      │
│ • View organization                                    │
│ • Cannot manage team or billing                        │
└─────────────────────────────────────────────────────────┘
```

### RBAC Enforcement Points

```
Request comes in
      │
      ▼
┌─────────────────────────────┐
│ Middleware (middleware.ts)  │
│ Check: User authenticated?  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Server Action Entry         │
│ Check: User is org member?  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ RBAC Check (lib/rbac.ts)    │
│ Check: Role has permission? │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Action Allowed              │
│ Execute & Log               │
└─────────────────────────────┘
```

---

## 📊 Database Schema (Simplified)

### Core Models

```
User
├── id
├── email (unique)
├── passwordHash
├── name
└── Relations: memberships[], comments[], tasks[]

Organization (TENANT)
├── id
├── name
├── slug (unique)
├── deletedAt (soft delete)
└── Relations: members[], projects[], subscriptions, auditLogs[]

Member (User-Org Relationship with Role)
├── id
├── userId → User
├── organizationId → Organization
├── role (OWNER | ADMIN | MEMBER)
└── @@unique [userId, organizationId]

Project
├── id
├── name
├── organizationId → Organization
├── deletedAt
└── Relations: tasks[]

Task
├── id
├── title
├── priority (LOW | MEDIUM | HIGH | URGENT)
├── status (TODO | IN_PROGRESS | DONE)
├── projectId → Project
├── assignedToId → User (optional)
└── Relations: comments[]

Comment
├── id
├── content
├── taskId → Task
├── authorId → User
└── createdAt

Subscription
├── id
├── organizationId → Organization (unique)
├── stripeCustomerId
├── plan (free | pro | enterprise)
├── status (active | cancelled | etc)
└── Relations: usageRecords[]

UsageRecord
├── id
├── subscriptionId → Subscription
├── units (API calls, etc)
└── createdAt

AuditLog
├── id
├── organizationId
├── actorId → User
├── action (string)
├── metadata (JSON)
└── createdAt

WebhookEvent
├── id
├── source (stripe, etc)
├── eventType (checkout.session.completed, etc)
├── payload (JSON)
├── processed (boolean)
└── createdAt

FeatureFlag
├── id
├── name
├── organizationId
├── enabled
└── @@unique [name, organizationId]
```

---

## 🔄 Data Flow Examples

### Creating a Task (Full Flow)

```
1. User submits form
   ├── Frontend: <form action={createTask}>
   └── Form contains: title, projectId, priority

2. Server Action (app/actions.ts)
   ├── Verify user is authenticated (session)
   ├── Get orgId from context
   ├── Check: User is member of org? (RBAC)
   ├── Check: User can access project?
   ├── Create task in database
   ├── Call: logAudit() → Create AuditLog
   ├── Call: recordUsage(orgId, 1) → Update usage
   └── Return: { success: true, task }

3. Audit Logging (lib/audit.ts)
   └── Insert: AuditLog
       ├── organizationId
       ├── actorId (user who created)
       ├── action: "task_created"
       └── metadata: { taskId, title, projectId }

4. Usage Tracking (lib/jobs.ts)
   └── Insert: UsageRecord
       ├── subscriptionId
       ├── units: 1
       └── Used for: Plan limits, billing

5. Response to Client
   └── Component updates UI with new task
```

### Stripe Webhook Flow

```
1. User upgrades plan
   └── Stripe payment successful
        └── POST /api/webhooks/stripe

2. Webhook Handler (app/api/webhooks/stripe/route.ts)
   ├── Verify signature (Stripe.webhooks.constructEvent)
   ├── Save: WebhookEvent { processed: false }
   └── Return: { received: true }

3. Background Job Processing (lib/jobs.ts)
   ├── Find: WebhookEvent where processed = false
   ├── Call: processWebhookEvent(eventId)
   │   ├── Event type: checkout.session.completed
   │   ├── Extract: stripeCustomerId, plan
   │   └── Create: Subscription
   │       ├── organizationId
   │       ├── stripeCustomerId
   │       ├── plan: "pro"
   │       └── status: "active"
   └── Mark: WebhookEvent { processed: true }

4. Update Subscription Status
   └── Audit log: "subscription_created"
        └── Available for: Billing page, reports
```

### Audit Trail for Compliance

```
Every sensitive action logged:

Action: Member invited
└── AuditLog
    ├── organizationId: "org_123"
    ├── actorId: "user_alice" (who invited)
    ├── action: "member_invited"
    ├── metadata:
    │   ├── email: "newmember@company.com"
    │   ├── role: "MEMBER"
    │   └── memberId: "member_456"
    └── createdAt: 2024-01-15T10:30:00Z

Compliance Usage:
├── Check: Who has access to what?
├── Check: What changed and when?
├── Check: Who made the change?
├── Audit: Monthly access review
└── Debug: Trace user actions
```

---

## 🔐 Security Layers

### 1. Authentication Layer
- Email/password with bcryptjs hashing
- Database sessions (no JWTs)
- Secure cookies

### 2. Tenant Isolation Layer
- Middleware checks orgId presence
- OrgId passed through cookie
- Verified on every action

### 3. RBAC Layer
- Role checked in server actions
- hasAccess() validation
- Role hierarchy enforced
- Owner lockout prevention

### 4. Input Validation Layer
- Server action parameter validation
- Email format checks
- Slug uniqueness checks
- Type checking with TypeScript

### 5. Audit Layer
- All sensitive actions logged
- Metadata captured for debugging
- Compliance trail maintained
- Cannot be bypassed (always in try/catch)

```
User Request
    ↓
Auth Check (Is user logged in?)
    ↓
Tenant Check (Is orgId valid?)
    ↓
RBAC Check (Does role allow this?)
    ↓
Validation (Is data correct?)
    ↓
Database Action (Create/Update/Delete)
    ↓
Audit Logging (Always log)
    ↓
Response (Success or Error)
```

---

## 📈 Scalability Considerations

### Database Optimization
- ✅ Proper indices on frequently queried fields
- ✅ Soft deletes prevent data loss
- ✅ Relationships defined clearly
- ✅ Pagination support ready
- ✅ Composite keys where needed (@unique)

### Application Patterns
- ✅ Server actions for validated mutations
- ✅ Database sessions (stateless)
- ✅ Feature flags for gradual rollout
- ✅ Usage tracking for metering
- ✅ Async job processing available

### Ready for Growth
- ✅ Multi-tenant from day one
- ✅ No single-tenant code in the codebase
- ✅ Audit logs for future compliance needs
- ✅ Webhooks for external integrations
- ✅ Feature flags for A/B testing

---

## 🚀 Deployment Architecture

### Single Deployment Serves All Tenants

```
Internet
    ↓
Vercel (or Server)
    ├── Next.js App
    ├── API Routes
    ├── Webhooks
    └── Static Files
        ↓
    PostgreSQL Database
        ├── Org A data
        ├── Org B data
        └── Org C data
```

### Data Isolation Maintained
```
Org A User → Request → Middleware → Check orgId_A
            └─→ Database → SELECT * FROM projects WHERE organizationId = 'org_a'
            └─→ Response (only Org A data)

Org B User → Request → Middleware → Check orgId_B
            └─→ Database → SELECT * FROM projects WHERE organizationId = 'org_b'
            └─→ Response (only Org B data)

(No user can access other org's data - enforced at multiple levels)
```

---

## 📚 Communication Between Layers

### Frontend → Server Action

```typescript
// Client component
'use client'

import { createProject } from '@/app/actions'

export default function CreateForm({ orgId, userId }) {
  async function handleSubmit(formData) {
    const result = await createProject(
      orgId,
      userId,
      formData.get('name')
    )
    // result: { success: true, project } or { error: string }
  }
}
```

### Server Action → Libraries

```typescript
// Server action uses library functions
'use server'

import { hasAccess } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'
import { recordUsage } from '@/lib/jobs'

export async function createTask(...) {
  // Check RBAC
  if (!hasAccess(userRole, ['OWNER', 'ADMIN'])) {
    return { error: 'Unauthorized' }
  }

  // Do work
  const task = await prisma.task.create(...)

  // Log it
  await logAudit({...})

  // Track usage
  await recordUsage(orgId, 1)

  return { success: true, task }
}
```

### Libraries → Database

```typescript
// Prisma used consistently

// In rbac.ts
await prisma.member.findFirst({ where: {...} })

// In audit.ts
await prisma.auditLog.create({ data: {...} })

// In jobs.ts
await prisma.subscription.findUnique({...})
```

---

## ✅ Validation Points

```
Input Validation
├── Type validation (TypeScript)
├── Format validation (email, slug)
├── Existence validation (record exists?)
├── Permission validation (RBAC)
└── Business logic validation (owner lockout)

Output Validation
├── Success response formatted
└── Error response includes reason

Database Transaction Safety
├── All-or-nothing operations
├── Audit log created even on failure
└── No partial state in database
```

---

## 🎯 This Architecture Demonstrates

1. **Enterprise-grade design** - Multi-tenant, RBAC, audit logs
2. **Security best practices** - Layered validation, isolation
3. **Scalable patterns** - Server actions, indexed queries
4. **Production-ready code** - Error handling, type safety
5. **Clean separation** - Frontend, business logic, database
6. **Compliance-ready** - Audit trail for all actions

**This is exactly what senior engineers build. This will impress interviewers.** 🚀
