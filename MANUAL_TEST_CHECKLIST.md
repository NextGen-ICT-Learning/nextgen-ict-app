# Manual Test Checklist (Browser)

## 0) Boot and Seed

1. Run:
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```
2. Open `http://localhost:3000`.

## 1) Landing and Content

1. Verify homepage sections load (hero, programs, testimonials, FAQ).
2. Toggle `EN` <-> `BN`; confirm language changes and persists after refresh.
3. Open legal pages:
   - `/terms`
   - `/privacy`
   - `/refund`

## 2) Student Auth and Profile

1. Open `/portal/login`.
2. Login with student account:
   - `student@nextgenict.local`
   - `Student123!`
3. Confirm redirect to `/portal`.
4. Open `/portal/profile`, update fields (phone/guardian/program/batch), save, refresh and confirm persistence.
5. Logout.
6. Forgot password flow:
   - open `/portal/forgot-password`
   - submit student email
   - use returned reset URL in dev mode
   - set a new password on `/portal/reset-password`
   - login with new password

## 3) Stripe Online Payment

1. Ensure `.env` includes valid `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
2. Run Stripe forwarding:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
3. In `/portal`, click `Pay BDT ...`.
4. Complete Stripe checkout with a test card.
5. Return to `/portal` and refresh.
6. Confirm invoice status becomes `PAID` and timeline shows Stripe payment.

## 4) Manual Payment Submission (Student)

1. Login as student and go to `/portal`.
2. In `Manual Payment Update` card:
   - upload receipt file (`.jpg/.png/.webp/.pdf`, < 5MB)
   - add optional note
   - click `Upload Receipt`
3. Confirm success message.
4. Confirm invoice status shows `PENDING`.

## 5) Manual Payment Review (Admin)

1. Login `/admin/login` with:
   - `admin@nextgenict.local`
   - `Admin123!`
2. In admin dashboard, open `Manual payment review queue`.
3. Verify submitted receipt appears with `View receipt` link.
4. Click `Approve` and refresh.
5. Confirm:
   - invoice status becomes `PAID`
   - payment appears in recent activity
6. Repeat with another submission and click `Reject`; confirm invoice returns to due/overdue state.

## 6) Invoice Generation + Status Engine

1. In admin dashboard, click `Generate Current + Next Invoices`.
2. Confirm success stats message appears.
3. Verify student invoice table reflects updated/open statuses correctly (`PENDING`, `DUE`, `OVERDUE`, `PAID`).
4. Check student `/portal` ledger reflects same statuses.

## 7) Role Protection and Session Guard

1. Logout.
2. Open `/portal` directly; confirm redirect to `/portal/login`.
3. Login as student and try `/admin`; confirm blocked/redirected.
4. Login as content editor and verify access to `/admin/content` but not full admin billing actions.

## 8) Class Upload + Join by Code (Cloudinary)

1. Ensure `.env` has Cloudinary keys:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Login as admin and open `/admin/classes`.
3. Upload a class with title, description, and image/video file.
4. Confirm success message and generated class code appears.
5. Login as student and open `/portal/classes`.
6. Enter class code and click `Join Class`.
7. Confirm joined class appears in list and media is viewable (video plays / image renders).

## 9) Class Channel + Class Edit

1. As admin, open `/admin/classes`.
2. Click `Open Channel` for a class.
3. Edit title/description/code and save; verify changes persist.
4. Replace class media with a PDF and save.
5. Publish a class channel post:
   - text-only
   - image/video/pdf attachment
6. Login as student and open `/portal/classes/{classId}` from `Open Class Channel`.
7. Confirm updated class info is visible.
8. Confirm broadcast posts appear in timeline and attachments open correctly.

## 10) Credentials

- Admin: `admin@nextgenict.local` / `Admin123!`
- Content Editor: `editor@nextgenict.local` / `Editor123!`
- Student: `student@nextgenict.local` / `Student123!`

## 11) Live Class (Video + Screen Share + Whiteboard)

1. Login as admin and open `/admin/classes`.
2. Open any class channel via `Open Channel`.
3. In `Live Class Studio`:
   - optionally set session title
   - click `Start Live Class`
4. Confirm:
   - status badge shows `Live now`
   - `Open Live Room` button appears
5. Click `Open Live Room` and verify:
   - Jitsi video call loads
   - mic/camera controls work
6. Test screen sharing:
   - click `Share screen` from Jitsi toolbar
   - choose tab/window and confirm share starts
7. Test whiteboard:
   - use split view or whiteboard focus
   - draw in embedded board
8. Login as student in another browser/session and open `/portal/classes`.
9. Confirm class card shows `Live now` and `Join Live`.
10. Click `Join Live`, confirm student enters same meeting room and can see screen share.
11. Verify student can open whiteboard tab and see drawing updates.
12. End session from admin class channel using `End Live Session`.
13. Confirm:
   - student live page no longer allows joining
   - channel timeline contains live started/ended system posts.

## 12) Attendance Tracking + Parent View

1. Login as student and open `/portal/profile`.
2. In parent section, copy `Parent attendance link`.
3. Open that link in a new browser where no user is logged in.
4. Confirm parent page opens and shows student attendance dashboard.
5. Start a live class as admin from `/admin/classes/{classId}`.
6. Join the live class as student from `/portal/classes/{classId}/live`.
7. Stay for at least 2 minutes, then leave the page.
8. Refresh student class page and confirm `Attendance Summary` metrics update.
9. Refresh parent attendance page and confirm new session appears with minutes.
10. In admin class channel, verify `Live Attendance History` lists student attendance rows.
11. Regenerate parent link from student profile and confirm old link no longer works.
