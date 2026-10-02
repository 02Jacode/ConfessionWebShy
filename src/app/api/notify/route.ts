// Emails you when she says yes. Needs EMAILSHY_API_KEY (a Resend key) and NOTIFY_EMAIL
// in .env.local (and in Netlify's environment variables when deployed).

import { buildEmail } from "./emailTemplate";

export async function POST(request: Request) {
  const apiKey = process.env.EMAILSHY_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    return Response.json({ error: "Email is not set up yet" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const kind = ["message", "think", "no", "slow"].includes(body.kind) ? body.kind : "yes";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  if (kind === "message" && !message) {
    return Response.json({ error: "Message is empty" }, { status: 400 });
  }
  const sentAt = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "long",
    timeStyle: "short",
  });

  const { subject, html, text } = buildEmail({ kind, message, sentAt });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Gumamela 🌺 <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: "Could not send email" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
