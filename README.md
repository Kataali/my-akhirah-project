# My Akhirah Project

A full-stack charity web platform connecting investors with communities in Northern Ghana.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (custom earth-tone palette) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| Payments | Paystack (card + MTN MoMo + Vodafone Cash) |
| Email | Resend (transactional receipts) |
| Hosting | Vercel (frontend) + Supabase (backend) |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/               # Public-facing pages (Navbar + Footer)
│   │   ├── page.tsx            # Homepage
│   │   ├── campaigns/
│   │   │   ├── page.tsx        # Campaigns listing
│   │   │   └── [slug]/page.tsx # Campaign detail
│   │   ├── invest/[slug]/      # Contribution/checkout page
│   │   ├── impact/             # Impact reports gallery
│   │   └── about/              # About page
│   │
│   ├── (dashboard)/            # Investor portal (auth-protected)
│   │   └── dashboard/page.tsx  # Investor's contribution history
│   │
│   ├── (admin)/                # Admin panel (admin role only)
│   │   └── admin/
│   │       ├── page.tsx        # Overview stats
│   │       ├── campaigns/      # Manage campaigns + new campaign form
│   │       ├── investors/      # View all investors
│   │       └── reports/        # Write & publish impact reports
│   │
│   ├── auth/
│   │   ├── login/page.tsx      # Sign in / Sign up
│   │   └── callback/route.ts   # Email confirmation handler
│   │
│   └── api/
│       ├── payments/
│       │   ├── initialize/     # POST: create Paystack transaction
│       │   └── verify/         # GET: verify after redirect
│       └── webhook/
│           └── paystack/       # POST: server-side webhook events
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── campaigns/
│       └── CampaignCard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase + Admin client
│   ├── paystack.ts             # Paystack API helpers
│   ├── email.ts                # Resend email templates
│   └── utils.ts                # Shared utilities
│
├── types/
│   └── database.ts             # Full TypeScript types for DB
│
└── middleware.ts                # Auth route protection
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yourorg/my-akhirah-project.git
cd my-akhirah-project
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql` to create all tables, triggers, and RLS policies
3. In **Authentication → Providers**, enable Email and optionally Google OAuth
4. In **Storage**, create a bucket called `campaign-images` (public) and `report-photos` (public)
5. Copy your project URL and anon key

### 3. Set up Paystack

1. Create an account at [paystack.com](https://paystack.com)
2. Get your public and secret keys from **Settings → API Keys**
3. In **Settings → Webhooks**, add: `https://yourdomain.com/api/webhook/paystack`

### 4. Set up Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your sending domain
3. Create an API key

### 5. Configure environment

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

### 6. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 7. Make yourself an admin

After signing up, run this in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
# Follow prompts, add all environment variables in Vercel dashboard
```

Set your Paystack webhook URL to your production domain after deploying.

---

## Payment Flow

```
Investor clicks "Invest"
  → POST /api/payments/initialize
    → Creates pending contribution in DB
    → Calls Paystack initialize API
    → Returns authorization_url
  → Browser redirects to Paystack hosted page
  → Investor pays (card / MTN MoMo / Vodafone Cash)
  → Paystack redirects to GET /api/payments/verify?reference=...
    → Verifies with Paystack
    → Marks contribution as "success"
    → DB trigger increments campaign.raised_amount
    → Sends receipt email via Resend
    → Redirects to /dashboard?payment=success
  → Paystack ALSO fires webhook to /api/webhook/paystack
    → Handles idempotent update (in case redirect failed)
    → Marks campaign as "funded" if target reached
```

---

## Key Features by Phase

### Phase 1 — Public
- Landing page with hero, stats, featured campaigns
- Campaigns listing with status filters
- Campaign detail with progress bar, items table, invest CTA
- Impact reports gallery
- About page

### Phase 2 — Investor Portal
- Sign up / sign in (email + Google)
- Invest page with preset + custom amounts, mobile money support
- Personal dashboard with contribution history
- Email receipts (Resend)
- Impact report notifications

### Phase 3 — Admin Panel
- Overview dashboard (live stats)
- Campaign management (create, edit, publish, close)
- Investor list with contribution totals
- Impact report creation with photo URLs
- Publishing triggers investor email notifications
