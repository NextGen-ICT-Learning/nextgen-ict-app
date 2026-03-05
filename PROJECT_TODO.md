# NextGenICT - 4 Phase Execution Plan

## Phase 1 - Promotional Landing + Branding (Completed)
- [x] Coaching-first promotional landing page (ICT focus)
- [x] Program/service storytelling sections with icons and visual highlights
- [x] EN/BN language toggle with persisted preference
- [x] Legal pages (`/terms`, `/privacy`, `/refund`)
- [x] Responsive layout polish and improved visual hierarchy

## Phase 2 - CMS + Content Operations (Completed)
- [x] Centralized content model in code
- [x] Locale-aware content API (`/api/content?lang=en|bn`)
- [x] Admin content editor panel (`/admin/content`)
- [x] Draft + publish workflow with revision history
- [x] Admin/content-editor role access control

## Phase 3 - Auth + Student/Admin Accounts (Completed)
- [x] Email/password signup + login with JWT session
- [x] Student/admin/content-editor role protection
- [x] Forgot password API + reset password flow
- [x] Student profile management (phone, guardian info, program, batch)
- [x] Login activity logging + admin audit view

## Phase 4 - Payment Core + Portal Operations (Completed)
- [x] Stripe checkout session integration
- [x] Stripe webhook verification + idempotent payment recording
- [x] Student monthly ledger API (`/api/portal/ledger`)
- [x] Monthly invoice generation endpoint for all students (`/api/admin/invoices/generate`)
- [x] Due status engine (`DUE`, `PENDING`, `OVERDUE`, `PAID`, `WAIVED`)
- [x] Student manual payment submission with receipt upload
- [x] Admin manual payment review queue (approve/reject)
- [x] Admin direct manual mark-paid fallback action

## Remaining Backlog (Next)
- [ ] Add bKash payment gateway
- [ ] Add email/SMS reminders for due invoices
- [ ] Add receipt storage to cloud (S3/Cloudinary) instead of local disk
- [ ] Add automated tests (unit/integration/e2e)
- [ ] Add production deployment hardening (CI/CD, monitoring, backups)
