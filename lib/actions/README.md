# Server Actions Architecture

This directory contains all **core business logic** server actions organized by domain.

## 📁 Structure

```
lib/actions/
├── index.ts              # Re-exports all actions for convenience
├── auth.ts               # User authentication & registration
├── organizations.ts      # Organization CRUD
├── members.ts            # Team member management
├── projects.ts           # Project CRUD
└── tasks.ts              # Task management & status updates
```

## 🎯 Usage

### Import from index (Recommended)
```typescript
import { registerUser, createOrganization } from "@/lib/actions"
```

### Import from specific file
```typescript
import { registerUser } from "@/lib/actions/auth"
import { createProject } from "@/lib/actions/projects"
```

## 📋 When to Add Actions Here

**✅ Add actions here if:**
- Core business logic (CRUD operations)
- Reusable across multiple routes
- Interacts directly with database
- Requires RBAC checks
- Needs audit logging

**❌ Don't add actions here if:**
- UI-specific helpers (e.g., toggle sidebar)
- Route-specific mutations (use `app/[route]/actions.ts`)
- Simple cookie setters (use route-level actions)

## 🔐 Security Patterns

All actions in this folder should:

1. **Validate permissions**
   ```typescript
   const member = await prisma.member.findFirst({
     where: { userId, organizationId: orgId }
   })
   if (!member) return { error: "Unauthorized" }
   ```

2. **Scope queries to organization**
   ```typescript
   where: { 
     organizationId: orgId  // ← Always include
   }
   ```

3. **Log sensitive actions**
   ```typescript
   await logAudit({
     organizationId: orgId,
     actorId: userId,
     action: "project_deleted",
     metadata: { projectId }
   })
   ```

4. **Return consistent format**
   ```typescript
   // Success
   return { success: true, data: result }
   
   // Error
   return { error: "Error message" }
   ```

## 📦 Available Actions

### auth.ts
- `registerUser(input)` - Create new user account

### organizations.ts
- `createOrganization(userId, name, slug)` - Create new organization
- `updateOrganization(orgId, userId, updates)` - Update org settings

### members.ts
- `inviteMember(orgId, userId, email, role)` - Invite team member
- `changeMemberRole(orgId, actorId, memberId, newRole)` - Change role
- `removeMember(orgId, actorId, memberId)` - Remove member

### projects.ts
- `createProject(orgId, userId, name, description?)` - Create project

### tasks.ts
- `createTask(orgId, userId, projectId, title, ...)` - Create task
- `updateTaskStatus(orgId, userId, taskId, status)` - Update status

## 🚀 Adding New Actions

1. Create new file or add to existing: `lib/actions/[domain].ts`
2. Export function with proper types and error handling
3. Add export to `index.ts`
4. Import where needed: `import { myAction } from "@/lib/actions"`

## 🔄 Migration Notes

**Old Location:** `app/actions.ts` (monolithic, 537 lines)  
**New Location:** `lib/actions/[domain].ts` (modular, organized)

All imports have been updated automatically.
