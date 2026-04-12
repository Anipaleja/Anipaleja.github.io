# Personal Website

<img width="800" height="659" alt="image" src="https://github.com/user-attachments/assets/4d5ffefc-9233-49d5-b882-641c1d0d73d6" />

Mainly uses React + TS.

## Contact Form Email Setup (Resend)

To receive emails from the contact form, add these to your `.env.local`:

```dotenv
RESEND_API_KEY=your_resend_api_key
RESEND_TO_EMAIL=you@yourdomain.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Notes:
- `RESEND_TO_EMAIL` is where contact form messages are delivered.
- For production, set `RESEND_FROM_EMAIL` to a verified sender/domain in Resend.
- The API route is at `/api/contact` and includes basic validation and rate limiting.

Check it out: <https://apaleja.tech>
