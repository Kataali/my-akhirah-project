# My Akhira Foundation

A full-stack charity and impact-investing web platform connecting donors ("investors") with underserved communities across Northern Ghana. Built with Next.js 14, Supabase, Paystack, and SendGrid/Resend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Actions, Route Handlers) + TypeScript |
| **Styling & UI** | Tailwind CSS (custom `earth` & `forest` palette), Framer Motion, Lucide Icons |
| **Forms & Validation** | React Hook Form + Zod (`@hookform/resolvers`) |
| **Database & Storage** | Supabase (PostgreSQL, Row-Level Security, Supabase Storage) |
| **Authentication** | Supabase Auth (`@supabase/ssr` — Email/Password, Google OAuth, Password Recovery) |
| **Payments** | Paystack (Card, MTN MoMo, Telecel/Vodafone Cash, AirtelTigo Money) |
| **Transactional Email** | SendGrid (`@sendgrid/mail`) or Resend (`resend`) — automatic fallback |
| **Testing** | Vitest + React Testing Library + JSDOM |
| **Deployment** | Vercel / Render + Supabase |

---

## Project Structure

```text
src/
├── app/
│   ├── (public)/                        # Public-facing pages (with Navbar + Footer)
│   │   ├── page.tsx                     # Landing page: hero, live impact metrics, featured campaigns
│   │   ├── about/page.tsx               # Mission, vision, and how the foundation operates
│   │   ├── campaigns/
│   │   │   ├── page.tsx                 # Filterable campaigns directory (active, funded, completed)
│   │   │   └── [slug]/page.tsx          # Campaign details, items breakdown, live progress, reports
│   │   ├── invest/[slug]/page.tsx       # Contribution checkout page (authenticated or anonymous)
│   │   └── impact/page.tsx              # Public gallery of published campaign & legacy impact reports
│   │
│   ├── (dashboard)/                     # Investor Portal (auth-protected)
│   │   └── dashboard/page.tsx           # Personal contribution metrics, receipts & campaign tracking
│   │
│   ├── (admin)/                         # Admin Panel (role = 'admin' required)
│   │   └── admin/
│   │       ├── page.tsx                 # Executive overview: total raised, active campaigns, recent activity
│   │       ├── campaigns/
│   │       │   ├── page.tsx             # All campaigns list with progress & status badges
│   │       │   ├── new/page.tsx         # Create new campaign (with direct cover image upload)
│   │       │   └── [id]/edit/page.tsx   # Edit campaign details, items, and draft/active status
│   │       ├── investors/page.tsx       # Registered investors directory & contribution aggregates
│   │       └── reports/
│   │           ├── page.tsx             # Campaigns awaiting reports + all existing impact reports
│   │           ├── new/page.tsx         # Create impact report for a funded/completed campaign
│   │           ├── new-legacy/page.tsx  # Create standalone report for historical/off-platform projects
│   │           └── [id]/edit/page.tsx   # Edit & publish impact reports
│   │
│   ├── auth/
│   │   ├── login/page.tsx               # Sign in & Sign up (Email/Password + Google OAuth)
│   │   ├── forgot-password/page.tsx     # Password reset request flow
│   │   ├── update-password/page.tsx     # Set new password after recovery link
│   │   └── callback/route.ts            # OAuth & email verification code exchange
│   │
│   └── api/
│       ├── admin/
│       │   └── upload/route.ts          # POST: Admin-authorized file upload to Supabase Storage
│       ├── auth/
│       │   └── logout/route.ts          # POST: Clear session cookies and sign out
│       ├── payments/
│       │   ├── initialize/route.ts      # POST: Create pending contribution & initialize Paystack checkout
│       │   └── verify/route.ts          # GET: Verify payment on callback, update status & send receipt
│       ├── webhook/
│       │   └── paystack/route.ts        # POST: HMAC-verified Paystack webhook for reliable settlement
│       └── debug/
│           └── paystack-log/route.ts    # Diagnostic endpoint for payment debugging
│
├── components/
│   ├── admin/
│   │   ├── CampaignNewForm.tsx          # Validated client form for new campaigns
│   │   ├── CampaignEditForm.tsx         # Validated client form for editing campaigns
│   │   └── PhotoUploader.tsx            # Multi-photo & cover image uploaders for Supabase Storage
│   ├── campaign/
│   │   └── CampaignStats.tsx            # Real-time campaign progress & funding metrics
│   ├── campaigns/
│   │   └── CampaignCard.tsx             # Campaign preview card component
│   ├── layout/
│   │   ├── Navbar.tsx                   # Responsive navigation bar with auth state
│   │   └── Footer.tsx                   # Site footer
│   └── ui/
│       ├── Providers.tsx                # Progress bar & toast notification providers
│       └── SubmitButton.tsx             # Form submit button with pending/loading state
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser Supabase client
│   │   └── server.ts                    # Server Supabase client, Admin service-role client & requireAdmin()
│   ├── auth.ts                          # Authentication helpers
│   ├── campaign-status.ts               # Automatic campaign transition logic (active → funded)
│   ├── email.ts                         # SendGrid & Resend transactional email templates
│   ├── paystack.ts                      # Paystack API wrapper & webhook signature verification
│   ├── report-items.ts                  # Parser supporting JSON arrays or shorthand lists like [sugar, rice]
│   ├── utils.ts                         # Currency formatting, slug generation, date & progress helpers
│   └── validations.ts                   # Zod schemas for campaigns and impact reports
│
├── test/                                # Unit tests (Vitest)
├── types/
│   └── database.ts                      # TypeScript definitions for Supabase schema
└── middleware.ts                        # Session refresh & route protection (/dashboard, /admin)
```

---

## Core Functionalities

### 1. Campaign Lifecycle & Automated Status Management
Campaigns progress through a strict, automated four-stage lifecycle:
1. **`draft`**: Created by an admin; hidden from public listings while details and cover images are finalized.
2. **`active`**: Published by an admin; visible on `/campaigns` and open to public contributions via Paystack.
3. **`funded`**: Automatically triggered via `markCampaignFundedIfEligible()` as soon as confirmed contributions meet or exceed `target_amount`.
4. **`completed`**: Automatically triggered when an admin publishes an Impact Report linked to the funded campaign.

### 2. Impact Reports & Legacy Reports
- **Campaign Impact Reports (`/admin/reports/new`)**: Created for `funded` or `completed` campaigns. Includes event date, summary, beneficiaries reached, items delivered, and photos. Publishing a report marks the campaign as `completed`.
- **Legacy Impact Reports (`/admin/reports/new-legacy`)**: Allows admins to document historical charitable activities that occurred prior to or outside of an on-site fundraising campaign (stores `campaign_title`, `campaign_location`, and `event_date` directly on the report).
- **Flexible Items Delivered Parser (`src/lib/report-items.ts`)**: Admins can enter delivered items either as structured JSON (`[{"name": "Rice", "quantity": 50, "unit": "bags"}]`) or as a quick shorthand list (`[sugar, rice, cooking oil]`), which is automatically normalized for display on the public `/impact` page.

### 3. Direct Supabase Storage Image Uploads
- Admins no longer need to manually upload files in the Supabase dashboard and copy/paste links.
- Both the **Impact Report forms** (multi-photo) and **Campaign forms** (single cover image) use `PhotoUploader` / `CoverImageUploader` (`src/components/admin/PhotoUploader.tsx`) backed by `POST /api/admin/upload`.
- Files are uploaded directly to the **`My Akhirah Project`** bucket in Supabase Storage using the server-side admin client, returning public URLs immediately with live image previews and one-click removal.

### 4. End-to-End Paystack Payment Pipeline
```text
Investor submits contribution on /invest/[slug]
  → POST /api/payments/initialize
    → Validates campaign is "active"
    → Inserts "pending" contribution record in Supabase
    → Initializes Paystack transaction (Card / MTN MoMo / Telecel Cash)
    → Redirects user to Paystack Checkout
  → Payment Completion (Dual-Verification):
    1. Browser Redirect → GET /api/payments/verify?reference=...
    2. Server Webhook   → POST /api/webhook/paystack (HMAC SHA-512 verified)
  → Post-Payment Actions (Idempotent):
    → Marks contribution status as "success"
    → Database updates campaign.raised_amount
    → Checks if raised_amount >= target_amount → transitions campaign to "funded"
    → Sends HTML donation receipt email to investor (and admin notification if fully funded)
```

### 5. Dual-Provider Transactional Emails (`src/lib/email.ts`)
Supports both **SendGrid** and **Resend** out of the box:
- If `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are configured, emails are sent via SendGrid.
- Otherwise, falls back to `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
- Includes templates for:
  - **Donation Receipts** (`sendDonationReceipt`)
  - **Campaign Fully Funded Admin Alerts** (`sendCampaignFundedNotification`)
  - **Impact Report Published Investor Updates** (`sendImpactReportNotification`)

### 6. Authentication & Role-Based Access Control
- **Investor Auth**: Email/password sign-up, sign-in, Google OAuth, forgot-password email recovery (`/auth/forgot-password`), and password update (`/auth/update-password`).
- **Anonymous Donations**: Donors can also contribute without an account or toggle anonymous display on public campaign pages.
- **Admin Protection**: Enforced at three levels:
  1. `middleware.ts` checks session and `profiles.role === 'admin'` before rendering `/admin/*`.
  2. Server Actions & API routes call `requireAdmin()` (`src/lib/supabase/server.ts`) before executing privileged mutations.
  3. Database Row-Level Security (RLS) policies in Supabase.

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/yourorg/my-akhirah-project.git
cd my-akhirah-project
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run your database schema migrations in the **SQL Editor** to create `profiles`, `campaigns`, `contributions`, and `impact_reports` along with triggers and RLS policies.
3. In **Authentication → Providers**, enable **Email** (and optionally **Google OAuth**).
4. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/update-password` to your Redirect URLs.
5. In **Storage**, ensure a public bucket named **`My Akhirah Project`** exists.

### 3. Configure Paystack

1. Create an account at [paystack.com](https://paystack.com).
2. Copy your Public and Secret keys from **Settings → API Keys & Webhooks**.
3. Set your Webhook URL to `https://yourdomain.com/api/webhook/paystack`.

### 4. Environment Variables

Copy `.env.example` to `.env` (or `.env.local`) and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Email Provider (Configure SendGrid OR Resend)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=donations@yourdomain.org

RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=donations@yourdomain.org

# App Metadata
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="My Akhira Foundation"
```

### 5. Run the development server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Grant Admin Access

After registering your account in the app, promote your user to `admin` in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server on port 3000 |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run unit tests with Vitest |
| `npm run db:types` | Regenerate TypeScript types from your Supabase schema |

---

## Deployment

The project is ready to deploy on **Vercel** or **Render** (`render.yaml` included):

1. Push the repository to GitHub.
2. Import the project into Vercel or Render.
3. Add all environment variables from `.env.example`.
4. Update `NEXT_PUBLIC_APP_URL` to your production URL and configure the Paystack webhook URL (`https://yourdomain.com/api/webhook/paystack`) and Supabase Auth redirect URLs accordingly.
