import { Resend } from "npm:resend@4.4.0";

const FIXED_CONTACT_EMAIL = "adityaranawal@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const resendToEmail = FIXED_CONTACT_EMAIL;
  const resendFromEmail = FIXED_CONTACT_EMAIL;

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "Email service is not configured." }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const resend = new Resend(resendApiKey);

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const name = normalizeText(payload.name, 120);
  const email = normalizeText(payload.email, 200);
  const message = normalizeText(payload.message, 5000);
  const website = normalizeText(payload.website, 120);

  if (website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "Please fill out all fields." }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "Please enter a valid email." }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: resendToEmail,
      reply_to: email,
      subject: `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Resend rejected the email request.",
          details: error.message,
        }),
        {
          status: 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown resend error.";

    return new Response(
      JSON.stringify({
        error: "Could not send your message right now.",
        details,
      }),
      {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
