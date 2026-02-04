# TeamOS

A **multi-tenant SaaS platform** for companies to manage projects, teams, billing, and internal workflows. Built for the portfolio to stand out and impress employers.

## 🎯 Project Goals

- **Multi-tenant architecture** with complete org isolation
- **Enterprise features** (RBAC, audit logs, billing)
- **Clean, scalable code** that shows best practices
- **Production-ready** implementation patterns
- **Portfolio showcase** that gets you noticed

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + Turbopack
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth) with email/password
- **Payments**: Stripe (test mode)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Type Safety**: TypeScript + strict mode
- **Background Jobs**: Database-backed job queue
- **Audit Trail**: Comprehensive audit logging

## 📋 MVP Features

### Core SaaS
- ✅ Multi-tenant organizations
- ✅ User authentication (email/password)
- ✅ Organization creation & switching
- ✅ Team management with RBAC (OWNER/ADMIN/MEMBER)
- ✅ Projects and task management
- ✅ Soft deletes for data safety
- ✅ Feature flags per organization
- ✅ Comprehensive audit logs
- ✅ Stripe billing integration (test mode)
- ✅ Webhook handling for subscriptions
- ✅ Background job processing
- ✅ Usage tracking and limits
- ✅ Rate limiting
- ✅ Modern dashboard UI

### Pages to Build
- `/login` - Email/password authentication
- `/register` - User signup
- `/select-org` - Choose organization
- `/create-org` - Create new organization
- `/dashboard` - Organization overview
- `/dashboard/projects` - Projects list & detail
- `/dashboard/members` - Team management with RBAC
- `/dashboard/billing` - Stripe integration
- `/dashboard/audit-logs` - Compliance & debugging
- `/dashboard/settings` - Organization settings

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repo>
cd team-os
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/team_os

# Auth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Stripe (test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### 3. Database Setup
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed with test data
npx prisma db seed
```

### 4. Install Additional Dependencies
```bash
# Auth and security
npm install bcryptjs next-auth@beta

# Types
npm install -D @types/bcryptjs
```

### 5. Run Dev Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (org)/
│   │   ├── select-org/
│   │   └── create-org/
│   ├── dashboard/
│   │   ├── projects/
│   │   ├── members/
│   │   ├── billing/
│   │   ├── audit-logs/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── webhooks/stripe/
│   │   └── jobs/
│   └── layout.tsx
│
├── lib/
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Auth.js config
│   ├── rbac.ts           # Role-based access control
│   ├── audit.ts          # Audit logging utilities
│   ├── stripe.ts         # Stripe integration
│   ├── jobs.ts           # Background job processing
│   └── utils.ts          # Common utilities
│
├── app/
│   └── actions.ts        # Server actions (mutations)
│
├── components/
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── OrgSwitcher.tsx
│   └── ui/               # shadcn components
│
└── prisma/
    └── schema.prisma     # Database schema
```

## 🔐 Security Features

- **Multi-tenant isolation**: Complete data segregation per org
- **RBAC**: Role-based access control at API layer
- **Owner lockout prevention**: Always keep at least one owner
- **Audit trails**: Log all sensitive actions
- **Password hashing**: bcryptjs with salting
- **Session management**: Secure database sessions
- **Webhook verification**: Stripe signature validation
- **Rate limiting**: Prevent abuse

## 🎓 What This Teaches You

**As a developer**, you'll master:
- Multi-tenant SaaS architecture
- Prisma ORM best practices
- Auth.js authentication
- Stripe payment integration
- Role-based access control
- Audit logging for compliance
- Background job processing
- Server actions in Next.js
- TypeScript best practices
- Modern React patterns

**For interviews**, you can talk about:
- Designing scalable multi-tenant systems
- Building enterprise features
- Handling sensitive operations safely
- Integrating with external services (Stripe)
- Building for compliance (audit logs)
- Code organization and architecture

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Detailed step-by-step implementation
- **[Database Schema](./prisma/schema.prisma)** - Complete data model
- **[API Examples](./lib/)** - Library usage examples

## 🧪 Testing

The project includes patterns for:
- Server action validation
- RBAC checks
- Database transactions
- Audit logging verification
- Webhook handling

## 📦 Database Schema Highlights

- **Organizations** - Multi-tenant containers
- **Members** - Users with roles per org
- **Projects** - Projects within organizations
- **Tasks** - Tasks with status, priority, assignments
- **Comments** - Task discussions
- **Subscriptions** - Stripe billing
- **UsageRecords** - Track usage per plan
- **AuditLogs** - Compliance & debugging
- **WebhookEvents** - External event queue
- **FeatureFlags** - Org-level feature toggles

## 🚀 Deployment Ready

This project is built to deploy on:
- **Vercel** - Zero-config Next.js deployment
- **Self-hosted** - Standard Node.js deployment
- **Docker** - Container ready
- **Serverless** - AWS Lambda, Google Cloud, etc.

## 📊 Status

- [x] Database schema designed
- [x] Core libraries built
- [x] Auth configuration
- [x] Server actions
- [ ] UI components (next)
- [ ] Authentication pages
- [ ] Dashboard layout
- [ ] Feature implementations
- [ ] Stripe integration
- [ ] Testing & polish

## 🎯 Success Criteria

This project will stand out when:
1. All MVP features working end-to-end
2. Proper error handling and validation
3. Clean, responsive UI
4. Audit logging on sensitive actions
5. Stripe integration in test mode
6. Database properly structured
7. Code well-organized
8. Deployed and accessible

## 📞 Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Docs](https://authjs.dev)
- [Stripe API Reference](https://stripe.com/docs/api)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

MIT - Use this for your portfolio and learning.

---

**Built for portfolio success. Built to impress. Built to ship.** 🚀
