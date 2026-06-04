# Production Deployment Checklist — Project Akhirah

Follow these steps to successfully launch your platform.

## 1. Supabase Environment Variables
In your Vercel/Hosting dashboard, add these keys:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Project API key (Anon).
- `SUPABASE_SERVICE_ROLE_KEY`: Your secret key (Service Role) — **Never expose this to the browser!**
- `NEXT_PUBLIC_APP_URL`: The full URL of your deployed site (e.g., `https://my-akhirah.vercel.app`).
- `PAYSTACK_SECRET_KEY`: Your live Paystack secret key.

## 2. Supabase Settings
- **Auth**:
  - Update "Site URL" to your production URL.
  - Add your production URL to "Redirect URLs".
- **Realtime**:
  - Ensure the `campaigns` table has Realtime enabled (Check the 'Broadcast' and 'Presence' boxes in the Supabase Table Editor).

## 3. Paystack Webhook
- In your Paystack Dashboard, set the Webhook URL to: 
  `https://your-domain.com/api/webhook/paystack`
- Copy the Webhook signature and add it to your server as `PAYSTACK_WEBHOOK_SECRET` (if you implement signature verification later).

## 4. Build Check
Ensure the build passes locally with no errors:
```bash
npm run build
```

## 5. Deployment
- Connect your GitHub repository to **Vercel**.
- Vercel will automatically detect the Next.js project.
- Click "Deploy".

---
**Platform Health:**
- [x] TypeScript clean (no @ts-nochecks)
- [x] RLS Policies active
- [x] Real-time updates tested
- [x] Mobile-responsive UI verified
