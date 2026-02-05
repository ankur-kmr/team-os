# Organization Context & RBAC Guide

## 📚 Overview

This guide explains how to use the organization context and RBAC (Role-Based Access Control) helpers in your server actions and pages.

## 🎯 When to Use Each Helper

### 1. `requireAuth()` - Lightweight Auth Check

**Use when:** You just need to verify the user is authenticated and get their orgId.

**Best for:** 
- Simple read operations
- Listing data (all members can view)
- No permission checks needed

**Example:**
```typescript
"use server"

import { requireAuth } from "@/lib/org-context"

export async function getProjects() {
  // ✅ Just verify auth and get orgId
  const { orgId } = await requireAuth()
  
  // All members can view projects
  return await prisma.project.findMany({
    where: { organizationId: orgId }
  })
}
```

---

### 2. `getOrgContext()` - Full Context with Role

**Use when:** You need the user's role to make decisions, but want manual control over permission checking.

**Best for:**
- Conditional logic based on role
- Need access to full member data
- Custom permission checks

**Example:**
```typescript
"use server"

import { getOrgContext } from "@/lib/org-context"
import { hasAccess } from "@/lib/rbac"

export async function updateProject(projectId: string, data: any) {
  const { orgId, member } = await getOrgContext()
  
  // ✅ Custom permission logic
  if (!hasAccess(member.role, ["OWNER", "ADMIN"])) {
    throw new Error("Only owners and admins can update projects")
  }
  
  return await prisma.project.update({
    where: { id: projectId, organizationId: orgId },
    data,
  })
}
```

---

### 3. `requireRole(allowedRoles)` - Enforce Role Requirement

**Use when:** You want automatic role enforcement with clear error messages.

**Best for:**
- Write operations (create, update, delete)
- Admin/Owner-only actions
- Cleaner code with automatic checks

**Example:**
```typescript
"use server"

import { requireRole } from "@/lib/org-context"

export async function deleteProject(projectId: string) {
  // ✅ Automatically throws if user isn't OWNER or ADMIN
  const { orgId } = await requireRole(["OWNER", "ADMIN"])
  
  return await prisma.project.delete({
    where: { id: projectId, organizationId: orgId }
  })
}
```

---

## 📊 Comparison Table

| Helper | Returns | Permission Check | Best Use Case |
|--------|---------|------------------|---------------|
| `requireAuth()` | `userId`, `orgId` | ❌ None | Simple read operations |
| `getOrgContext()` | Full context + role | ⚠️ Manual | Conditional logic by role |
| `requireRole([roles])` | Full context + role | ✅ Automatic | Write operations, admin actions |

---

## 🔐 Common Permission Patterns

### Pattern 1: Everyone Can Read, Only Admins Can Write

```typescript
// Read (all members)
export async function getProjects() {
  const { orgId } = await requireAuth()
  return await prisma.project.findMany({ where: { organizationId: orgId } })
}

// Write (admins only)
export async function createProject(name: string) {
  const { orgId } = await requireRole(["OWNER", "ADMIN"])
  return await prisma.project.create({ data: { name, organizationId: orgId } })
}
```

### Pattern 2: Different Actions for Different Roles

```typescript
export async function updateMember(memberId: string, newRole: Role) {
  const { orgId, member } = await getOrgContext()
  
  // Get target member
  const targetMember = await prisma.member.findUnique({ where: { id: memberId } })
  
  // Check permissions using canManageRole from rbac.ts
  if (!canManageRole(member.role, targetMember.role)) {
    throw new Error("You can only manage members with lower roles")
  }
  
  return await prisma.member.update({
    where: { id: memberId },
    data: { role: newRole }
  })
}
```

### Pattern 3: Owner-Only Actions

```typescript
export async function deleteOrganization() {
  // ✅ Only owners can delete the organization
  const { orgId } = await requireRole(["OWNER"])
  
  return await prisma.organization.delete({
    where: { id: orgId }
  })
}
```

---

## 🚨 Error Handling

All helpers throw errors that should be caught and handled:

```typescript
"use server"

export async function someAction() {
  try {
    const { orgId } = await requireRole(["OWNER", "ADMIN"])
    
    // Do work...
    
    return { success: true }
  } catch (error) {
    console.error("Action failed:", error)
    
    // Return user-friendly error
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Permission denied" 
    }
  }
}
```

---

## 🎨 Usage in Client Components

Client components should call server actions, which use these helpers:

```typescript
// app/projects/CreateProjectButton.tsx
"use client"

import { createProject } from "@/lib/actions/projects"
import { useState } from "react"

export function CreateProjectButton() {
  const [error, setError] = useState("")
  
  async function handleCreate() {
    try {
      // ✅ Server action handles auth + RBAC
      const result = await createProject("New Project")
      
      if (result.error) {
        setError(result.error)
      }
    } catch (error) {
      setError("Failed to create project")
    }
  }
  
  return (
    <div>
      <button onClick={handleCreate}>Create Project</button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
```

---

## 🔍 Full Example: Projects Module

```typescript
// lib/actions/projects.ts
"use server"

import { requireAuth, requireRole, getOrgContext } from "@/lib/org-context"
import { hasAccess } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"

// ✅ Read: All members can list
export async function getProjects() {
  const { orgId } = await requireAuth()
  
  return await prisma.project.findMany({
    where: { organizationId: orgId },
    include: { tasks: true },
  })
}

// ✅ Create: Only OWNER/ADMIN
export async function createProject(name: string) {
  const { orgId } = await requireRole(["OWNER", "ADMIN"])
  
  return await prisma.project.create({
    data: { name, organizationId: orgId }
  })
}

// ✅ Update: Only OWNER/ADMIN
export async function updateProject(projectId: string, data: { name: string }) {
  const { orgId } = await requireRole(["OWNER", "ADMIN"])
  
  return await prisma.project.update({
    where: { id: projectId, organizationId: orgId },
    data,
  })
}

// ✅ Archive: OWNER/ADMIN can archive, but show who archived it
export async function archiveProject(projectId: string) {
  const { orgId, member } = await requireRole(["OWNER", "ADMIN"])
  
  return await prisma.project.update({
    where: { id: projectId, organizationId: orgId },
    data: { 
      archived: true,
      archivedAt: new Date(),
      archivedBy: member.userId,
    },
  })
}

// ✅ Delete: Only OWNER
export async function deleteProject(projectId: string) {
  const { orgId } = await requireRole(["OWNER"])
  
  return await prisma.project.delete({
    where: { id: projectId, organizationId: orgId }
  })
}
```

---

## 🎯 Best Practices

### ✅ DO:
1. **Always scope queries to `orgId`** - Prevents data leaks between organizations
2. **Use the lightest helper needed** - `requireAuth()` when no role check is needed
3. **Check permissions early** - Fail fast with clear error messages
4. **Return structured errors** - `{ success: false, error: "message" }`
5. **Log permission failures** - For security auditing

### ❌ DON'T:
1. **Don't skip tenant scoping** - Always include `organizationId` in queries
2. **Don't hardcode role checks** - Use `hasAccess()` from `rbac.ts`
3. **Don't expose raw errors to users** - Return user-friendly messages
4. **Don't check permissions on client** - Always enforce on server
5. **Don't assume role** - Always fetch and verify

---

## 📝 Quick Reference

```typescript
// Lightweight auth check
const { userId, orgId } = await requireAuth()

// Full context with manual permission check
const { orgId, member, role } = await getOrgContext()
if (!hasAccess(role, ["OWNER"])) { /* ... */ }

// Automatic role enforcement
const { orgId } = await requireRole(["OWNER", "ADMIN"])
```

---

## 🔗 Related Files

- `lib/org-context.ts` - All context helpers
- `lib/rbac.ts` - Role utilities (hasAccess, canManageRole, etc.)
- `lib/auth.ts` - NextAuth configuration
- `middleware.ts` - Route protection

---

## 📚 Additional Resources

- [Multi-tenant SaaS Architecture](./ONBOARDING_AND_CONTEXT.md)
- [Actions Architecture](./ACTIONS_ARCHITECTURE.md)
- [RBAC Best Practices](../lib/rbac.ts)
