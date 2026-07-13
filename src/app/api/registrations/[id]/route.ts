import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getRegistrationById,
  markAcknowledgmentSent,
  markReadyEmailSent,
  markThankYouEmailSent,
  updateRegistrationStatus,
} from "@/lib/db/registrations";
import type { RegistrationStatus } from "@/lib/db/types";
import {
  sendAcknowledgmentEmail,
  sendReadyEmail,
  sendThankYouEmail,
} from "@/lib/email";
import { statusUpdateSchema } from "@/lib/validations";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resendSchema = z.object({
  action: z.literal("resend-email"),
  type: z.enum(["acknowledgment", "ready", "thank_you", "all"]),
});

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();

    const resend = resendSchema.safeParse(body);
    if (resend.success) {
      const registration = await getRegistrationById(id);
      if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      const results: Record<string, { sent: boolean; skipped?: boolean; error?: string }> = {};

      const sendOne = async (type: "acknowledgment" | "ready" | "thank_you") => {
        if (type === "acknowledgment") {
          const email = await sendAcknowledgmentEmail(registration);
          if (email.sent) await markAcknowledgmentSent(registration.id);
          results.acknowledgment = email;
        }
        if (type === "ready") {
          const email = await sendReadyEmail(registration);
          if (email.sent) await markReadyEmailSent(registration.id);
          results.ready = email;
        }
        if (type === "thank_you") {
          const email = await sendThankYouEmail(registration);
          if (email.sent) await markThankYouEmailSent(registration.id);
          results.thank_you = email;
        }
      };

      if (resend.data.type === "all") {
        await sendOne("acknowledgment");
        await sendOne("ready");
        await sendOne("thank_you");
      } else {
        await sendOne(resend.data.type);
      }

      const updated = await getRegistrationById(id);
      return NextResponse.json({ registration: updated, email: results });
    }

    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const status = parsed.data.status as RegistrationStatus;
    const playedAt =
      status === "playing" || status === "completed"
        ? new Date().toISOString()
        : null;

    // Capture pre-update email flags so we still send if this transition should trigger mail.
    const before = await getRegistrationById(id);
    if (!before) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const registration = await updateRegistrationStatus({
      id,
      status,
      played_at: playedAt,
      checked_in_by_team_member_id: session.teamMemberId,
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    let email: { sent: boolean; skipped?: boolean; error?: string } = {
      sent: false,
      skipped: true,
    };

    if (status === "ready" && !before.ready_email_sent_at) {
      email = await sendReadyEmail(registration);
      if (email.sent) {
        await markReadyEmailSent(registration.id);
      } else {
        console.error("[registrations PATCH] ready email failed", email);
      }
    }

    if (status === "completed" && !before.thank_you_email_sent_at) {
      email = await sendThankYouEmail(registration);
      if (email.sent) {
        await markThankYouEmailSent(registration.id);
      } else {
        console.error("[registrations PATCH] thank-you email failed", email);
      }
    }

    const updated = await getRegistrationById(id);
    return NextResponse.json({ registration: updated, email });
  } catch (err) {
    console.error("[registrations PATCH]", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
