# NextGenICT

Modern coaching center platform built with Next.js:
- Promotional ICT-focused landing page (EN/BN)
- Student portal (profile + monthly ledger + payments)
- Admin dashboard (billing operations + manual payment review)
- Content CMS (draft/publish with role-based access)
- Class upload module with unique join code and student online class access
- Class broadcast channel (teacher/admin posts updates, image/video/PDF)
- Live class studio (video + screen share + collaborative whiteboard)
- Live attendance tracking with parent attendance dashboard

## Tech Stack

- Next.js 16 (App Router)
- Prisma + PostgreSQL (Neon)
- Custom JWT session auth
- Stripe Checkout + Webhooks
- Cloudinary for class media hosting
- Jitsi Meet External API for live video classes
- Excalidraw embed for live whiteboard drawing

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
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLASS_UPLOAD_MAX_MB="200"
CLASS_POST_MAX_MB="200"
NEXT_PUBLIC_JITSI_DOMAIN="meet.jit.si"
NEXT_PUBLIC_WHITEBOARD_BASE_URL="https://excalidraw.com"
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
- Student classes: `/portal/classes`
- Parent attendance dashboard: `/parent/attendance?code=...`
- Forgot/reset password: `/portal/forgot-password`, `/portal/reset-password`
- Admin login/dashboard: `/admin/login`, `/admin`
- Content CMS: `/admin/content`
- Admin class upload/manage: `/admin/classes`
- Admin class channel page: `/admin/classes/:classId`
- Admin live room: `/admin/classes/:classId/live`
- Student live room: `/portal/classes/:classId/live`

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
  - `GET /api/profile/parent-access`
  - `POST /api/profile/parent-access`
  - `GET /api/portal/ledger`
  - `GET /api/portal/classes`
  - `POST /api/portal/classes/join`
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
- Class Management
  - `GET /api/admin/classes`
  - `POST /api/admin/classes` (multipart upload to Cloudinary)
  - `PATCH /api/admin/classes/:classId`
  - `GET /api/admin/classes/:classId/live-session`
  - `POST /api/admin/classes/:classId/live-session` (`start` / `end`)
  - `GET /api/classes/:classId/live-session`
  - `POST /api/classes/:classId/live-attendance` (`join` / `heartbeat` / `leave`)
  - `GET /api/classes/:classId/posts`
  - `POST /api/classes/:classId/posts`

## Stripe Local Webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
