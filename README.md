# NextGenICT

Modern coaching center platform built with Next.js:
- Promotional ICT-focused landing page (EN/BN)
- Student portal (profile + monthly ledger + payments)
- Admin dashboard (billing operations + manual payment review)
- Content CMS (draft/publish with role-based access)

## Tech Stack

- Next.js 16 (App Router)
- Prisma + SQLite
- Custom JWT session auth
- Stripe Checkout + Webhooks

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Required keys in `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

3. Sync database and seed:

```bash
npm run db:push
npm run db:seed
```

4. Run development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

- Admin: `admin@nextgenict.local` / `Admin123!`
- Content Editor: `editor@nextgenict.local` / `Editor123!`
- Student: `student@nextgenict.local` / `Student123!`

## Main Routes

- Landing: `/`
- Student login/signup: `/portal/login`, `/portal/signup`
- Student dashboard: `/portal`
- Student profile: `/portal/profile`
- Forgot/reset password: `/portal/forgot-password`, `/portal/reset-password`
- Admin login/dashboard: `/admin/login`, `/admin`
- Content CMS: `/admin/content`

## API Routes (Core)

- Auth
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
- Student
  - `GET /api/profile`
  - `PUT /api/profile`
  - `GET /api/portal/ledger`
  - `POST /api/portal/manual-payment`
- Payments
  - `POST /api/stripe/checkout`
  - `POST /api/stripe/webhook`
  - `POST /api/admin/manual-payment`
  - `POST /api/admin/manual-payment/review`
  - `POST /api/admin/invoices/generate`
- Content
  - `GET /api/content?lang=en|bn`
  - `GET /api/admin/content?locale=en|bn`
  - `POST /api/admin/content` (`saveDraft` or `publish`)

## Stripe Local Webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
# nextgen-ict-app
