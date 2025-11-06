# Email Notifications (Wave-3)

## Summary
- SMTP-based email via Nodemailer.
- Queue-backed sending using BullMQ (`email` queue).
- Simple HTML templates (test, reminder).
- Test endpoint to verify SMTP delivery.

## Environment
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM`

## Endpoints
- POST `/api/v1/notifications/test-email` (JWT)
  - Sends a test email to the authenticated user's email address.
  - Response: `{ success: boolean }`

## Templates
- Implemented minimal inline templates in `MailerService`:
  - `sendTestEmail(to)` → simple HTML "Test Email".
  - `sendReminderEmail(to, { title, start, location? })` → calendar reminder.

You can replace these inline templates with MJML/Handlebars build pipeline later (compile MJML → HTML at build time) and call `sendHtml()`.

## Worker
- `backend/src/workers/email.worker.ts`
  - Processes `email` queue jobs with fields `{ to, from, subject, text?, html? }`.
  - Retries with exponential backoff; failed jobs are recorded in dead-letter queue.

## Usage Examples
- Queue generic text email from code:
```ts
await mailer.sendGeneric('user@example.com', 'Hello', 'This is a test')
```
- Queue HTML email:
```ts
await mailer.sendHtml('user@example.com', 'Welcome', '<h1>Welcome!</h1>')
```
