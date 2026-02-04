# TeamOS - Implementation Guide

## ✅ Completed Foundation (Phase 1)

### Database Schema (`prisma/schema.prisma`)
- ✅ Multi-tenant organization model
- ✅ RBAC with roles (OWNER, ADMIN, MEMBER)
- ✅ Projects → Tasks with assignments, priority, and comments
- ✅ Soft delete support (`deletedAt` fields)
- ✅ Audit logging for compliance
- ✅ Subscription & usage tracking
- ✅ Webhook event queue
- ✅ Background job tracking
- ✅ Feature flags per organization
- ✅ Proper indices and relationships

### Core Libraries (`lib/`)
- ✅ **auth.ts**: Auth.js configuration with Credentials provider
- ✅ **rbac.ts**: Role-based access control utilities
  - `hasAccess()` - Check role permissions
  - `canManageRole()` - Hierarchical role management
  - `canRemoveMember()` - Prevent owner lockout
  - `getPermissions()` - Get role capabilities
- ✅ **audit.ts**: Audit logging utilities
  - `logAudit()` - Create audit events
  - `getActivityFeed()` - Fetch activity for dashboard
  - `getActionDescription()` - Human-readable audit actions
- ✅ **stripe.ts**: Stripe integration
  - Plans definition (Free, Pro, Enterprise)
  - Price formatting for India (INR)
  - Feature access checking
- ✅ **jobs.ts**: Background job processing
  - Stripe webhook event handlers
  - Usage tracking and limits
  - Old webhook cleanup
- ✅ **utils.ts**: Common utilities
  - `cn()` - Tailwind CSS class merging
  - `formatDate()`, `formatRelativeTime()` - Date formatting
  - `slugify()` - URL-safe strings
  - `paginate()` - Pagination helper
  - Email validation

---

## 🚀 Next Steps (Phase 2 & 3)

### Phase 2: Authentication & Onboarding

#### Install required packages
```bash
npm install bcryptjs next-auth@beta
npm install -D @types/bcryptjs
```

#### Files to create:
1. **app/auth/login/page.tsx** - Login page
2. **app/auth/register/page.tsx** - Registration page (with password hashing)
3. **middleware.ts** - Tenant isolation and auth middleware
4. **auth.ts** - Auth.js route handler

#### Key features:
- Email/password signup and login
- Password hashing with bcryptjs
- Session-based authentication
- Redirect to org selection after login

---

### Phase 3: Organization Management

#### Files to create:
1. **app/(org)/select-org/page.tsx** - List user's organizations
2. **app/(org)/create-org/page.tsx** - Create new organization
3. **app/api/orgs/route.ts** - API for org operations

#### Key features:
- Create organization (with slug validation)
- List user's organizations
- Switch between organizations (via cookie)
- Invite members by email
- Accept/reject member invitations

---

### Phase 4: Dashboard & Core UI

#### Components to build:
1. **components/DashboardLayout.tsx** - Main dashboard wrapper
2. **components/Sidebar.tsx** - Navigation sidebar
3. **components/OrgSwitcher.tsx** - Organization selector
4. **components/UserMenu.tsx** - Profile dropdown

#### Pages to create:
1. **app/dashboard/page.tsx** - Dashboard overview
   - Organization stats
   - Recent activity (from audit logs)
   - Current plan status
2. **app/dashboard/layout.tsx** - Dashboard layout wrapper

#### Key features:
- Responsive sidebar navigation
- Org/user dropdown menus
- Activity feed from audit logs
- Plan status indicator

---

### Phase 5: Members & RBAC

#### Files to create:
1. **app/dashboard/members/page.tsx** - Members management
2. **app/api/members/route.ts** - Member operations
3. **components/InviteMemberDialog.tsx** - Invite UI
4. **components/MembersTable.tsx** - Members list

#### Key features:
- List organization members
- Invite new members by email
- Change member roles (ADMIN / MEMBER)
- Remove members (with owner lockout prevention)
- Role-based UI (only OWNER/ADMIN see actions)
- Audit logging for all changes

---

### Phase 6: Projects & Tasks

#### Files to create:
1. **app/dashboard/projects/page.tsx** - Projects list
2. **app/dashboard/projects/[id]/page.tsx** - Project detail
3. **app/api/projects/route.ts** - Project operations
4. **components/ProjectCard.tsx** - Project display
5. **components/TaskCard.tsx** - Task display
6. **components/TaskDialog.tsx** - Create/edit task

#### Key features:
- Create projects
- List tasks per project
- Change task status (TODO → IN_PROGRESS → DONE)
- Assign tasks to team members
- Set task priority
- Add comments to tasks
- Soft delete support

---

### Phase 7: Billing & Stripe

#### Files to create:
1. **app/dashboard/billing/page.tsx** - Billing page
2. **app/api/checkout/route.ts** - Stripe checkout endpoint
3. **app/api/webhooks/stripe/route.ts** - Stripe webhook handler
4. **components/PlanCard.tsx** - Plan display

#### Key features:
- Display current plan and usage
- Plan comparison table
- Upgrade to Pro (Stripe checkout in test mode)
- Cancel subscription
- Webhook handling for subscription events
- Update subscription status in database

#### Stripe Setup (Test Mode):
1. Get test keys from Stripe dashboard
2. Set env variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
3. Create price IDs for Pro and Enterprise plans
4. Set webhook endpoint in Stripe: `https://yourdomain.com/api/webhooks/stripe`

---

### Phase 8: Audit Logs (Enterprise Feature ⭐)

#### Files to create:
1. **app/dashboard/audit-logs/page.tsx** - Audit logs viewer
2. **components/AuditLogsTable.tsx** - Audit table component

#### Key features:
- Read-only audit log table
- Filter by action type
- Filter by date range
- Pagination
- Export to CSV (optional)

#### Why this stands out:
- Shows compliance & security awareness
- Enterprise customers love audit trails
- Demonstrates attention to detail

---

### Phase 9: Organization Settings

#### Files to create:
1. **app/dashboard/settings/page.tsx** - Settings page
2. **app/api/organizations/route.ts** - Org update endpoint

#### Key features:
- Edit organization name
- Edit slug (with validation)
- Delete organization (owner only)
- View subscription info

---

### Phase 10: Stripe Webhooks & Background Jobs

#### Setup:
1. Create API route at `/api/webhooks/stripe/route.ts`
2. Handle these events:
   - `checkout.session.completed` → Create subscription
   - `customer.subscription.updated` → Update plan/status
   - `customer.subscription.deleted` → Cancel subscription
   - `invoice.paid` → Update status
   - `invoice.payment_failed` → Update status

#### Testing locally:
```bash
# Install Stripe CLI
# Forward webhooks to your local app
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### Phase 11: Usage Tracking

#### Features:
- Track API calls per organization
- Enforce plan limits
- Record usage in database
- Display usage on billing page

#### Implementation:
- Call `recordUsage()` when important actions happen
- Check `getMonthlyUsage()` before allowing actions on free plan
- Show remaining quota on billing page

---

## 🏗️ Architecture Patterns

### Tenant Isolation (Middleware)
```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  // Check orgId in cookie/session
  // Verify user is member of org
  // Pass orgId to route handlers
}
```

### Server Actions for Mutations
```typescript
// app/dashboard/actions.ts
'use server'

export async function createProject(orgId: string, name: string) {
  // Verify user access
  // Create project
  // Log audit event
  // Return result
}
```

### RBAC in API Routes
```typescript
// app/api/members/route.ts
const member = await getMemberRole(userId, orgId);
if (!hasAccess(member.role, ['OWNER', 'ADMIN'])) {
  return new Response('Unauthorized', { status: 403 });
}
```

---

## 📊 Key Audit Events to Log

When creating audit log entries, use these action types:

- `organization_created` - New org
- `member_invited` - User invited
- `member_role_changed` - Role updated
- `member_removed` - User removed
- `project_created` - New project
- `task_created` - New task
- `task_updated` - Task status/assignee changed
- `subscription_created` - Plan purchased
- `subscription_upgraded` - Plan changed
- `subscription_cancelled` - Plan cancelled

---

## 💡 Portfolio Presentation Points

When discussing this project in interviews/resume:

1. **Architecture**: "Designed a multi-tenant SaaS architecture with complete org isolation"
2. **Database**: "Built scalable Prisma schema with RBAC, audit logging, and soft deletes"
3. **Security**: "Implemented role-based access control with owner lockout prevention"
4. **Payments**: "Integrated Stripe subscriptions with webhook-based reconciliation in test mode"
5. **Enterprise Features**: "Added comprehensive audit logs for compliance and debugging"
6. **Code Quality**: "Followed clean architecture patterns with separation of concerns"
7. **Performance**: "Optimized database queries with proper indexing"
8. **Extensibility**: "Designed to be AI-ready with RAG support and LLM integration hooks"

---

## 🧪 Testing Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Login redirects to org selection
- [ ] Logout clears session

### Organization
- [ ] Create org with unique slug
- [ ] Switch between orgs
- [ ] User data isolated per org

### Members & RBAC
- [ ] Invite member by email
- [ ] Change member role
- [ ] Remove member (except last owner)
- [ ] Only OWNER/ADMIN see member actions

### Projects & Tasks
- [ ] Create project in org
- [ ] Create task in project
- [ ] Change task status
- [ ] Assign task to member
- [ ] Add comments to task

### Billing
- [ ] View current plan
- [ ] Upgrade to Pro (Stripe test)
- [ ] Receive webhook confirmation
- [ ] Subscription status updates
- [ ] Cancel subscription

### Audit Logs
- [ ] Audit events created for key actions
- [ ] Activity feed shows recent actions
- [ ] Audit log page displays all events
- [ ] Filter by action (optional)

---

## 🎯 Success Criteria

Your project will stand out when:
1. ✅ All MVP features working end-to-end
2. ✅ Audit logs on every sensitive action
3. ✅ Stripe integration working in test mode
4. ✅ Clean, responsive UI with shadcn components
5. ✅ Proper error handling and validation
6. ✅ Database migrations managed
7. ✅ Env variables properly configured
8. ✅ Code well-organized and documented

This will demonstrate:
- Full-stack abilities (Next.js, Prisma, Stripe, Auth)
- Enterprise thinking (audit logs, RBAC, multi-tenant)
- Attention to detail (error handling, UX, security)
- Scalable architecture (proper schema design, indexing)

---

## 📚 Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Stripe API Reference](https://stripe.com/docs/api)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

**Good luck! You're building something impressive. Focus on quality over quantity. Better to have 5 features working perfectly than 10 features half-built. This project will definitely get you noticed by employers! 🚀**
