import nodemailer from "nodemailer";
import type { ImmersionKioskRegistration } from "@/lib/db/types";

const INSTAGRAM_URL = "https://www.instagram.com/landofimmersion/";

type EmailResult = { sent: boolean; skipped?: boolean; error?: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  // Gmail app passwords are often copied with spaces — strip them.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  });
}

async function sendMail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  const transporter = getTransporter();
  const from =
    process.env.EMAIL_FROM || process.env.SMTP_USER || "Immersion <hello@enterimmersion.com>";

  if (!transporter) {
    console.info(
      "[email] SMTP not configured — skipping send:",
      payload.subject,
      "→",
      payload.to
    );
    return { sent: false, skipped: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: payload.to,
      replyTo: process.env.SMTP_USER || undefined,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    console.info("[email] sent:", payload.subject, "→", payload.to, info.messageId);
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[email] nodemailer error:", message, "→", payload.to);
    return { sent: false, error: message };
  }
}

function brandShell(options: {
  preheader: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}) {
  const ctaBlock = options.cta
    ? `
      <tr>
        <td style="padding:8px 0 28px;">
          <a href="${options.cta.href}"
             style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.02em;padding:14px 28px;border-radius:999px;">
            ${escapeHtml(options.cta.label)}
          </a>
        </td>
      </tr>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:#050508;color:#f5f5f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0c0c12;border:1px solid rgba(167,139,250,0.22);border-radius:24px;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed);"></td>
          </tr>
          <tr>
            <td style="padding:36px 32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.32em;color:#a78bfa;font-weight:600;">IMMERSION</p>
              ${
                options.eyebrow
                  ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8b8b9a;">${escapeHtml(options.eyebrow)}</p>`
                  : ""
              }
              <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:500;color:#ffffff;">${escapeHtml(options.title)}</h1>
              <div style="font-size:15px;line-height:1.7;color:#c4c4d0;">
                ${options.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${ctaBlock}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
              <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
                <p style="margin:0 0 6px;font-size:12px;color:#8b8b9a;">Interactive experiences by Immersion</p>
                <p style="margin:0;font-size:12px;">
                  <a href="https://enterimmersion.com" style="color:#a78bfa;text-decoration:none;">enterimmersion.com</a>
                  &nbsp;·&nbsp;
                  <a href="${INSTAGRAM_URL}" style="color:#a78bfa;text-decoration:none;">@landofimmersion</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function queueBadge(queueNumber: number) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:rgba(124,58,237,0.12);border:1px solid rgba(167,139,250,0.28);border-radius:16px;padding:22px 20px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a78bfa;">Queue number</p>
          <p style="margin:0;font-size:40px;line-height:1;font-weight:500;color:#ffffff;">#${queueNumber}</p>
        </td>
      </tr>
    </table>
  `;
}

export async function sendAcknowledgmentEmail(registration: ImmersionKioskRegistration) {
  const name = escapeHtml(registration.name);
  const eventName = escapeHtml(registration.event_name);
  const experience = escapeHtml(registration.experience);

  return sendMail({
    to: registration.email,
    subject: `Welcome to Immersion — Queue #${registration.queue_number}`,
    text: `Hi ${registration.name},

Welcome to Immersion. You're officially checked in for ${registration.event_name}.

Your queue number is #${registration.queue_number}
Experience: ${registration.experience}

Hold onto this email — it's your digital ticket for the night. We'll send another message as soon as your station is ready.

See you soon,
Immersion
${INSTAGRAM_URL}`,
    html: brandShell({
      preheader: `You're checked in for ${registration.experience}. Queue #${registration.queue_number}.`,
      eyebrow: "Check-in confirmed",
      title: "Welcome in",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${name},</p>
        <p style="margin:0 0 14px;">You're officially checked in for <strong style="color:#ffffff;">${eventName}</strong>. We've saved your place and your digital ticket is ready.</p>
        ${queueBadge(registration.queue_number)}
        <p style="margin:0 0 14px;">Tonight's experience: <strong style="color:#ffffff;">${experience}</strong></p>
        <p style="margin:0;">Sit tight — we'll email you the moment your station is ready for you.</p>
      `,
    }),
  });
}

export async function sendReadyEmail(registration: ImmersionKioskRegistration) {
  const name = escapeHtml(registration.name);
  const experience = escapeHtml(registration.experience);

  return sendMail({
    to: registration.email,
    subject: "You're up — your Immersion experience is ready",
    text: `Hi ${registration.name},

You're up. Your ${registration.experience} station is ready.

Queue #${registration.queue_number}

Please head back to Immersion check-in and our team will get you started.

See you shortly,
Immersion
${INSTAGRAM_URL}`,
    html: brandShell({
      preheader: `You're up for ${registration.experience}. Please return to check-in.`,
      eyebrow: "You're next",
      title: "Your experience is ready",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${name},</p>
        <p style="margin:0 0 14px;">You're up. Your <strong style="color:#ffffff;">${experience}</strong> station is ready and waiting for you.</p>
        ${queueBadge(registration.queue_number)}
        <p style="margin:0;">Please return to Immersion check-in — our team will take it from there.</p>
      `,
    }),
  });
}

export async function sendThankYouEmail(registration: ImmersionKioskRegistration) {
  const name = escapeHtml(registration.name);
  const experience = escapeHtml(registration.experience);

  return sendMail({
    to: registration.email,
    subject: "Thanks for hanging with us tonight",
    text: `Hi ${registration.name},

Thank you for hanging with us. We hope you loved your ${registration.experience} experience.

If you want more Immersion moments, follow us on Instagram:
${INSTAGRAM_URL}

Stay close — we've got more events and experiences coming soon.

With love,
Immersion`,
    html: brandShell({
      preheader: "Thanks for hanging with us. Follow @landofimmersion for what's next.",
      eyebrow: "Until next time",
      title: "Thanks for hanging with us",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${name},</p>
        <p style="margin:0 0 14px;">Thank you for spending time with us tonight. We hope you enjoyed every second of your <strong style="color:#ffffff;">${experience}</strong> experience.</p>
        <p style="margin:0 0 14px;">Follow us on Instagram to stay in the loop — and keep an eye out for more Immersion events and experiences coming soon.</p>
      `,
      cta: {
        label: "Follow us on Instagram",
        href: INSTAGRAM_URL,
      },
    }),
  });
}

export async function sendAdminOtpEmail(email: string, code: string) {
  return sendMail({
    to: email,
    subject: `${code} is your Immersion admin code`,
    text: `Your Immersion admin code is ${code}. It expires in 10 minutes.`,
    html: brandShell({
      preheader: "Your Immersion admin one-time code",
      eyebrow: "Secure sign-in",
      title: "Your one-time code",
      bodyHtml: `
        <p style="margin:0 0 14px;">Use this code to access Immersion admin.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td style="background:rgba(124,58,237,0.12);border:1px solid rgba(167,139,250,0.28);border-radius:16px;padding:22px 20px;text-align:center;">
              <p style="margin:0;font-size:36px;letter-spacing:0.28em;font-weight:600;color:#ffffff;">${escapeHtml(code)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;">This code expires in 10 minutes. If you didn&apos;t request it, you can safely ignore this email.</p>
      `,
    }),
  });
}

export async function sendTeamInviteEmail(member: {
  name: string;
  email: string;
  role: string;
}) {
  const name = escapeHtml(member.name);
  const role = escapeHtml(member.role);
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://enterimmersion.com/admin";

  return sendMail({
    to: member.email,
    subject: `You're on the Immersion booth team — ${member.role}`,
    text: `Hi ${member.name},

You've been added to the Immersion booth team.

Role: ${member.role}

You can sign in to the admin portal with this email address using a one-time code:
${adminUrl}

Welcome to the team,
Immersion`,
    html: brandShell({
      preheader: `You've been added as ${member.role} on the Immersion booth team.`,
      eyebrow: "Booth team invite",
      title: "You're on the team",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${name},</p>
        <p style="margin:0 0 14px;">You've been added to the Immersion booth team for tonight's experience.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
          <tr>
            <td style="background:rgba(124,58,237,0.12);border:1px solid rgba(167,139,250,0.28);border-radius:16px;padding:22px 20px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a78bfa;">Your role</p>
              <p style="margin:0;font-size:22px;line-height:1.3;font-weight:500;color:#ffffff;">${role}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;">Sign in to the admin portal with this email — we'll send you a one-time code when you're ready.</p>
      `,
      cta: {
        label: "Open admin portal",
        href: adminUrl,
      },
    }),
  });
}
