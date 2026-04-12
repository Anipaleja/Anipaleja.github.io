import { NextResponse } from "next/server";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const resendToEmail = process.env.RESEND_TO_EMAIL ?? "anipaleja@gmail.com";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const ipRateLimit = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const firstIp = forwardedFor.split(",")[0]?.trim();

  if (firstIp) {
    return firstIp;
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = ipRateLimit.get(ip);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    ipRateLimit.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  existing.count += 1;
  ipRateLimit.set(ip, existing);
  return false;
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!resend || !resendToEmail) {
    return NextResponse.json(
      { error: "Email service is not configured yet." },
      { status: 500 },
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a bit and try again." },
      { status: 429 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const name = normalizeText(payload.name, 120);
  const email = normalizeText(payload.email, 200);
  const message = normalizeText(payload.message, 5000);
  const website = normalizeText(payload.website, 120);

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill out all fields." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  try {
    const subject = `New contact form message from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n");

    // Resend requires a verified sender. Keep visitor email as reply-to.
    await resend.emails.send({
      from: resendFromEmail,
      to: resendToEmail,
      replyTo: email,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email provider error.";

    return NextResponse.json(
      {
        error:
          "Email provider rejected the sender. Set RESEND_FROM_EMAIL to a verified Resend sender/domain (for testing use onboarding@resend.dev).",
        details: message,
      },
      { status: 502 },
    );
  }
}
