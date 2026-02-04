# TeamOS - Getting Started Guide

## 🎯 What You Have Right Now

You have a **complete backend foundation** with all the infrastructure needed for an enterprise SaaS:

### ✅ Already Built (Foundation Phase)
1. **Database Schema** - Complete Prisma schema with all models
2. **Authentication** - Auth.js configuration with email/password
3. **RBAC System** - Role hierarchy with permission checking
4. **Audit Logging** - Complete compliance trail system
5. **Stripe Integration** - Plans, pricing, webhook handlers
6. **Background Jobs** - Webhook processing and usage tracking
7. **Server Actions** - Pre-built CRUD with validation
8. **Middleware** - Tenant isolation and auth checks
9. **Utilities** - Common helpers and formatters
10. **Documentation** - 5 comprehensive guides

### 📦 What's Included in Each File

```
lib/
├── prisma.ts          → Database client (ready to use)
├── auth.ts            → Auth.js config (needs env vars)
├── rbac.ts            → Role permissions system
├── audit.ts           → Audit logging utilities
├── stripe.ts          → Stripe plans & pricing
├── jobs.ts            → Background job handlers
└── utils.ts           → Common utility functions

app/
├── actions.ts         → Server actions (ready to call)
└── middleware.ts      → Auth & tenant isolation

docs/
├── README.md          → Project overview
├── PROJECT_SUMMARY.md → Quick reference
├── IMPLEMENTATION_GUIDE.md → Phase-by-phase guide
├── ARCHITECTURE.md    → System design & flows
├── EXAMPLES.md        → Code usage patterns
└── GETTING_STARTED.md → This file
```

---

## 🚀 Quick Start (Next 30 Minutes)

### Step 1: Install Dependencies (5 min)

```bash
# Navigate to project
cd path/to/team-os

# Install required packages
npm install bcryptjs next-auth@beta
npm install -D @types/bcryptjs

# Verify all dependencies
npm list
```

### Step 2: Setup Environment Variables (5 min)

Create `.env.local` in project root:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/team_os

# Auth (required)
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Stripe (for billing - optional initially)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxx
```

**How to get STRIPE_SECRET_KEY:**
1. Go to [stripe.com/docs](https://stripe.com/docs)
2. Create test account
3. Get test keys from Dashboard → Developers → API Keys
4. Copy secret key to `.env.local`

### Step 3: Setup Database (5 min)

```bash
# Push Prisma schema to database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio to see data
npx prisma studio
```

### Step 4: Start Development Server (5 min)

```bash
# Start the dev server
npm run dev

# In browser, visit:
# http://localhost:3000
```

✅ **You're ready to start building!**

---

## 📋 What to Build Next

### Priority 1: Authentication (Most Important)
**Why**: Users need to log in before using anything else

**Files to create:**
- `app/(auth)/login/page.tsx` - Login form
- `app/(auth)/register/page.tsx` - Sign up form  
- `app/auth.ts` - Auth.js handler (route)

**What users will do:**
1. Sign up with email/password
2. Password gets hashed with bcryptjs
3. User stored in database
4. Session created
5. Redirect to `/select-org`

**Time estimate:** 1-2 hours

**Reference:** See IMPLEMENTATION_GUIDE.md Phase 2

---

### Priority 2: Organization Management (Critical for Multi-tenant)
**Why**: Without this, users can't use the app

**Files to create:**
- `app/(org)/select-org/page.tsx` - List user's organizations
- `app/(org)/create-org/page.tsx` - Create new organization

**What users will do:**
1. After login, see their organizations
2. Can create new organization
3. OrgId saved to cookie
4. Redirect to dashboard

**Time estimate:** 1-2 hours

**Reference:** See IMPLEMENTATION_GUIDE.md Phase 3

---

### Priority 3: Dashboard Layout (Foundation)
**Why**: The main UI that holds everything

**Files to create:**
- `app/dashboard/layout.tsx` - Main layout wrapper
- `components/Sidebar.tsx` - Left navigation
- `components/OrgSwitcher.tsx` - Switch orgs from header
- `components/UserMenu.tsx` - Profile menu

**Time estimate:** 2-3 hours

**Reference:** See IMPLEMENTATION_GUIDE.md Phase 4

---

### Priority 4: Dashboard Pages (Core Features)
**Why**: Where users actually do work

**Create these pages in order:**

1. **`/dashboard`** - Overview page
   - Display org info
   - Show stats (projects, members, plan)
   - Show recent activity (from audit logs)

2. **`/dashboard/projects`** - Projects list
   - List all projects in org
   - Create new project
   - Click to open project

3. **`/dashboard/projects/[id]`** - Project detail
   - List tasks in project
   - Create new task
   - Change task status
   - Assign tasks

4. **`/dashboard/members`** - Team management
   - List team members
   - Invite new members
   - Change member roles
   - Remove members
   - **CRITICAL**: Enforce RBAC (only OWNER/ADMIN see actions)

5. **`/dashboard/billing`** - Stripe integration
   - Show current plan
   - Show usage
   - Show pricing
   - Upgrade button (links to Stripe checkout)

6. **`/dashboard/audit-logs`** - Enterprise feature
   - Display audit log table
   - Read-only view
   - Shows who did what when

7. **`/dashboard/settings`** - Organization settings
   - Edit org name
   - Edit org slug
   - Delete org (owner only)

**Time estimate:** 6-8 hours

**Reference:** See IMPLEMENTATION_GUIDE.md Phase 5-9

---

### Priority 5: Stripe & Billing (Money)
**Why**: This is how you monetize

**Files to create:**
- `app/api/checkout/route.ts` - Create checkout session
- `app/api/webhooks/stripe/route.ts` - Handle webhook events

**What happens:**
1. User clicks "Upgrade" on billing page
2. Redirected to Stripe checkout
3. User enters payment info
4. Payment successful
5. Stripe sends webhook event
6. Create subscription in database
7. Billing page updates with new plan

**Time estimate:** 2-3 hours

**Reference:** See IMPLEMENTATION_GUIDE.md Phase 7 & 10

---

## 📊 Development Roadmap

```
Week 1:
├── Monday: Auth setup (register, login)
├── Tuesday: Org management (select, create)
├── Wednesday: Dashboard layout & sidebar
├── Thursday: Dashboard overview & projects
└── Friday: Members & basic RBAC

Week 2:
├── Monday: Tasks & comments
├── Tuesday: Billing page & plans UI
├── Wednesday: Stripe integration (checkout)
├── Thursday: Stripe webhooks
└── Friday: Audit logs viewer & settings

Week 3:
├── Testing, bug fixes, polish
├── Error handling & validation
├── Responsive design
├── Performance optimization
└── Deploy to Vercel

Total: 2-3 weeks for complete MVP
```

---

## 🛠️ Common Commands You'll Use

```bash
# Start dev server
npm run dev

# Build for production
npm build

# Check for linting errors
npm run lint

# Format code
npm run format

# Prisma database commands
npx prisma migrate dev --name [migration_name]  # Create migration
npx prisma db push                              # Push schema to DB
npx prisma db seed                              # Run seed file
npx prisma studio                               # Open visual editor
npx prisma generate                             # Generate client

# Testing
npm test                                        # Run tests
npm run test:watch                              # Watch mode
```

---

## 📚 Documentation Quick Links

- **README.md** - Project overview & quick start
- **PROJECT_SUMMARY.md** - What's been built & what's next
- **IMPLEMENTATION_GUIDE.md** ⭐ - Detailed phase-by-phase guide
- **ARCHITECTURE.md** - System design, data flows, security layers
- **EXAMPLES.md** - Code snippets and usage patterns
- **GETTING_STARTED.md** - This file

---

## 🎓 Key Concepts to Understand

### Multi-Tenancy
> An organization is a tenant. One codebase serves many orgs. Each org's data is completely isolated.

### RBAC (Role-Based Access Control)
> Users have roles (OWNER, ADMIN, MEMBER). Each role has different permissions. Check permissions before allowing actions.

### Server Actions
> Functions that run on the server, called from client components. Perfect for mutations (create, update, delete).

### Audit Logging
> Every important action is logged: who did what, when, and why. Great for compliance and debugging.

### Soft Deletes
> Mark as deleted (add `deletedAt` date) instead of removing. Data is never lost, just hidden.

### Feature Flags
> Turn features on/off per organization without redeploying code. Great for beta testing.

---

## ⚡ Pro Tips

### Tip 1: Test RBAC Carefully
Create two test users with different roles. Verify that a MEMBER can't access ADMIN-only actions.

### Tip 2: Log Everything Important
Invite a member? Log it. Change role? Log it. Create project? Log it. This audit trail is gold for interviews.

### Tip 3: Verify Org Isolation
Create two orgs, log in as different users, make sure they only see their own data.

### Tip 4: Use TypeScript Strictly
The `Role` enum, `User` type, etc. are all defined. Use them. Catch bugs at compile time.

### Tip 5: Test Stripe in Test Mode
Stripe provides test card numbers (like `4242 4242 4242 4242`). Use them for local testing.

### Tip 6: Start Simple, Add Complexity
Build the happy path first. Then add error handling. Then edge cases.

### Tip 7: Commit Frequently
Every time a page works, commit it. "Add login page", "Add org switcher", etc.

---

## 🆘 Troubleshooting

### Database Connection Error
```
Error: P1000 Authentication failed

Solution:
1. Check DATABASE_URL in .env.local
2. Verify PostgreSQL is running
3. Check user/password/host/database are correct
```

### NEXTAUTH_SECRET Not Set
```
Error: NEXTAUTH_SECRET is not set

Solution:
1. Add to .env.local:
   NEXTAUTH_SECRET=your-random-string-here
2. Or: openssl rand -hex 32
```

### Prisma Client Not Generated
```
Error: Cannot find module '@/generated/prisma'

Solution:
1. Run: npx prisma generate
2. Restart dev server
```

### Stripe Webhook Not Working
```
Error: Webhook signature verification failed

Solution:
1. Check STRIPE_WEBHOOK_SECRET is correct
2. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe
3. Test webhook: stripe trigger charge.succeeded
```

---

## 🎯 Success Checklist

Before moving to next phase, verify:

### Phase: Authentication
- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] Password is hashed in database
- [ ] Session is created and persists
- [ ] Logout works
- [ ] Can't access protected routes without login

### Phase: Organizations
- [ ] User can create organization
- [ ] OrgId is saved to cookie
- [ ] User can see their organizations
- [ ] Can switch between organizations
- [ ] Data is isolated per organization
- [ ] Non-members can't access org

### Phase: Dashboard
- [ ] Dashboard page loads
- [ ] Sidebar shows all navigation links
- [ ] Org switcher works
- [ ] User menu works
- [ ] Can navigate between pages
- [ ] Layout is responsive

### Phase: Features
- [ ] Can create projects
- [ ] Can create tasks in projects
- [ ] Can change task status
- [ ] Can assign tasks to members
- [ ] Can add comments
- [ ] RBAC checks work (try with MEMBER role)

### Phase: Billing
- [ ] Plans display correctly
- [ ] Can click upgrade
- [ ] Stripe checkout opens
- [ ] Test payment succeeds
- [ ] Subscription created in database
- [ ] Status updates on billing page

---

## 🚀 Ready to Go?

You have everything. Start with **Phase 2: Authentication** from IMPLEMENTATION_GUIDE.md.

1. Create the login page
2. Create the register page
3. Test signing up and logging in
4. Commit your code: `git commit -m "add: authentication pages"`

Then move to Phase 3, and so on.

**This project will take 2-3 weeks to complete fully. It will be impressive. It will get you noticed.** 🎉

---

## 💬 Questions?

Refer to:
- **IMPLEMENTATION_GUIDE.md** - How to build each feature
- **EXAMPLES.md** - Code snippets for reference
- **ARCHITECTURE.md** - System design and data flows

**You're going to build something awesome. Let's go!** 🚀
