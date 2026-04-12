# Personal Website

<img width="800" height="659" alt="image" src="https://github.com/user-attachments/assets/4d5ffefc-9233-49d5-b882-641c1d0d73d6" />

Mainly uses React + TS.

## Contact Form Email Setup (Resend)

For local development with Next API route, add these to your `.env.local`:

```dotenv
RESEND_API_KEY=your_resend_api_key
RESEND_TO_EMAIL=you@yourdomain.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Notes:
- `RESEND_TO_EMAIL` is where contact form messages are delivered.
- For production, set `RESEND_FROM_EMAIL` to a verified sender/domain in Resend.
- The API route is at `/api/contact` and includes basic validation and rate limiting.

## GitHub Pages + Resend (Production)

GitHub Pages cannot run Next.js API routes, so production form submissions should go to a Supabase Edge Function.

### 1) Deploy the edge function

The function source is in `supabase/functions/contact/index.ts`.

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy contact --no-verify-jwt
```

### 2) Set function secrets in Supabase

```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase secrets set RESEND_TO_EMAIL=anipaleja@gmail.com
npx supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 3) Point the frontend to the function endpoint

At build-time, set one of:
- `NEXT_PUBLIC_CONTACT_ENDPOINT=https://<your-project-ref>.supabase.co/functions/v1/contact`
- or `NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co` (the app derives `/functions/v1/contact` automatically)

On GitHub Actions for Pages, add this env var in your workflow build step if needed.

Check it out: <https://apaleja.tech>
