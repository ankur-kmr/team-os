# Onboarding & Organization Context - Complete Guide

## 🎯 The Big Picture: Multi-Tenant Architecture

In a multi-tenant SaaS like TeamOS, every user can belong to **multiple organizations**. We need to answer:

**"Which organization is the user currently working in?"**

This is called the **tenant context** and it's the backbone of your entire app.

---

## 📊 The Flow: Register → Login → Onboarding → Dashboard

```
┌─────────────┐
│  /register  │
│  /login     │  ← User authenticates
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  /onboarding    │  ← Smart routing based on org count
└────────┬────────┘
         │
         ├─ 0 orgs  → Show "Create Organization" form
         │
         ├─ 1 org   → Auto-select and redirect to /dashboard
         │
         └─ 2+ orgs → Show "Select Organization" list
                      │
                      ▼
                ┌─────────────┐
                │  /dashboard │  ← Now they have orgId context
                └─────────────┘
```

---

## 🔑 Why `/onboarding` is Better Than Multiple Routes

### ❌ Old Approach (Multiple Routes):
```
/select-org     ← User manually navigates here
/create-org     ← User manually navigates here
```

**Problems:**
- User has to know where to go
- More routes to maintain
- Redundant logic across pages

### ✅ New Approach (Single Intelligent Route):
```
/onboarding     ← ONE route that handles ALL cases
```

**Benefits:**
- ✅ Automatic logic - no user confusion
- ✅ Single source of truth
- ✅ Industry standard (Slack, Linear, Notion all use this)
- ✅ Better UX - fewer clicks

---

## 🏗️ File Structure You Now Have

```
app/
├── (auth)/
│   ├── login/page.tsx          ✅ Login form
│   └── register/page.tsx        ✅ Registration + auto sign-in
│
├── onboarding/
│   ├── page.tsx                 ✅ Smart routing logic
│   ├── actions.ts               ✅ setActiveOrganization()
│   └── components/
│       ├── OrgSelector.tsx      ✅ Multi-org selector
│       └── CreateOrgForm.tsx    ✅ New org form
│
├── dashboard/
│   └── [future pages]           🔜 Next step

middleware.ts                     ✅ Route protection & org validation

lib/
├── org-context.ts                ✅ Org context utilities
├── auth.ts                       ✅ Auth configuration
└── actions.ts (or lib/actions/)  ✅ Server actions
```

---

## 🎮 How It Works: Step-by-Step

### Step 1: User Registers/Logs In
- User creates account at `/register`
- After registration, auto sign-in happens
- Redirects to `/onboarding`

### Step 2: Onboarding Logic (`/onboarding/page.tsx`)
```typescript
// Fetch user's organizations
const userOrgs = await prisma.member.findMany({
  where: { userId: session.user.id },
  include: { organization: true },
})

// Case 1: No organizations
if (userOrgs.length === 0) {
  return <CreateOrgForm />  // Show form to create first org
}

// Case 2: Exactly one organization
if (userOrgs.length === 1) {
  cookies().set("orgId", org.id)  // Auto-select
  redirect("/dashboard")          // Go to dashboard
}

// Case 3: Multiple organizations
return <OrgSelector orgList={organizations} />
```

### Step 3: Organization Created or Selected
- **orgId** is stored in a **cookie** (httpOnly, secure)
- This cookie persists for 30 days
- Every request now knows which org the user is in

### Step 4: Dashboard Access
- User accesses `/dashboard`
- Middleware checks for `orgId` cookie
- All queries are scoped to this org: `where: { organizationId: orgId }`

---

## 🔒 Why middleware.ts at Root?

**Location:** `/middleware.ts` (root of project, NOT in `/app`)

### Purpose:
Middleware runs **before every request** to:
1. ✅ Check if user is authenticated
2. ✅ Redirect unauthenticated users to `/login`
3. ✅ Ensure dashboard routes have orgId cookie
4. ✅ Prevent access to orgs user doesn't belong to

### How It Works:

```typescript
export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // 1. Public routes - allow anyone
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next()
  }

  // 2. No session? Redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 3. Dashboard requires orgId
  if (pathname.startsWith("/dashboard")) {
    const orgId = request.cookies.get("orgId")?.value
    
    if (!orgId) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return NextResponse.next()
}
```

### Why It's Critical:
- ✅ **Security**: Prevents unauthorized access
- ✅ **UX**: Auto-redirects to correct page
- ✅ **Tenant Isolation**: Ensures orgId is always present
- ✅ **Performance**: Runs at edge (fast)

---

## 🎯 What is lib/org-context.ts?

**Purpose:** Utility functions to get and validate organization context

### Key Functions:

#### 1. `getCurrentOrgId()`
```typescript
const orgId = await getCurrentOrgId()
// Returns: "org_123abc" or null
```
Gets orgId from cookie. Used in components/actions.

#### 2. `requireOrganization()`
```typescript
const { organization, member, userId } = await requireOrganization()
// Returns: Full org details + user's role
// Throws: Error if no org or no access
```
Use in server components that REQUIRE org context.

#### 3. `verifyOrgAccess(orgId, userId)`
```typescript
const hasAccess = await verifyOrgAccess("org_123", "user_456")
// Returns: true/false
```
Use in server actions to validate user belongs to org.

#### 4. `getUserOrganizations(userId)`
```typescript
const orgs = await getUserOrganizations(userId)
// Returns: Array of orgs with user's role in each
```
Use in onboarding and org switcher.

#### 5. `switchOrganization(orgId, userId)`
```typescript
await switchOrganization("org_789", userId)
// Sets orgId cookie, verifies access
```
Use when user switches between orgs.

---

## 🔐 Tenant Isolation: The Critical Pattern

**Every database query in your app must be scoped to orgId:**

### ❌ WRONG (Security Risk):
```typescript
// This returns ALL projects from ALL organizations!
const projects = await prisma.project.findMany()
```

### ✅ CORRECT (Tenant-Safe):
```typescript
const { organization } = await requireOrganization()

const projects = await prisma.project.findMany({
  where: {
    organizationId: organization.id  // ← CRITICAL
  }
})
```

### Why This Matters:
- Without this, Org A could see Org B's data
- This is a **security vulnerability**
- Called "tenant isolation" or "multi-tenant data segregation"
- Recruiters specifically look for this in code reviews

---

## 🎨 Usage Examples

### Example 1: Dashboard Page
```typescript
// app/dashboard/page.tsx
import { requireOrganization } from "@/lib/org-context"

export default async function DashboardPage() {
  const { organization, member } = await requireOrganization()

  // Get projects for THIS organization only
  const projects = await prisma.project.findMany({
    where: { organizationId: organization.id }
  })

  return (
    <div>
      <h1>Welcome to {organization.name}</h1>
      <p>Your role: {member.role}</p>
    </div>
  )
}
```

### Example 2: Server Action
```typescript
// lib/actions/projects.ts
"use server"

import { requireOrganization } from "@/lib/org-context"

export async function createProject(name: string) {
  const { organization, userId } = await requireOrganization()

  // Project is automatically scoped to current org
  const project = await prisma.project.create({
    data: {
      name,
      organizationId: organization.id,  // ← From context
    }
  })

  return { success: true, project }
}
```

### Example 3: Org Switcher Component
```typescript
// components/OrgSwitcher.tsx
"use client"

import { getUserOrganizations } from "@/lib/org-context"
import { switchOrganization } from "@/app/onboarding/actions"

export default function OrgSwitcher({ userId }: { userId: string }) {
  const orgs = await getUserOrganizations(userId)

  async function handleSwitch(orgId: string) {
    await switchOrganization(orgId, userId)
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <select onChange={(e) => handleSwitch(e.target.value)}>
      {orgs.map(org => (
        <option key={org.id} value={org.id}>{org.name}</option>
      ))}
    </select>
  )
}
```

---

## 🚀 What You've Built

✅ Complete authentication flow
✅ Smart onboarding with 3 cases handled
✅ Organization context management
✅ Tenant isolation via middleware
✅ Cookie-based org selection
✅ Auto-redirect logic
✅ Utility functions for org context

---

## 🎯 Next Steps

Now that org context is working, you can build:

1. **Dashboard Layout** - Shows current org name, user role
2. **Projects Page** - Scoped to current org
3. **Members Page** - Manage team in current org
4. **Org Switcher** - Dropdown to switch orgs
5. **Settings Page** - Update org details

Every page will use:
```typescript
const { organization, member } = await requireOrganization()
```

---

## 💡 Why This Architecture Matters for Your Resume

Recruiters look for:
- ✅ **Multi-tenant architecture** - You understand tenant isolation
- ✅ **Middleware usage** - You know edge computing
- ✅ **Cookie-based context** - You understand stateful web apps
- ✅ **Security patterns** - You prevent data leaks
- ✅ **Smart routing** - You think about UX

This is **enterprise-grade** architecture. Most junior devs don't build this.

---

## 📚 Quick Reference

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, auth checks |
| `lib/org-context.ts` | Org context utilities |
| `app/onboarding/page.tsx` | Smart org selection/creation |
| `app/onboarding/actions.ts` | Set org cookie |
| Cookie `orgId` | Stores current organization |

---

**You now have a production-ready multi-tenant onboarding system!** 🎉
