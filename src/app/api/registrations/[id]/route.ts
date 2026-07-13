import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  markReadyEmailSent,
  markThankYouEmailSent,
  updateRegistrationStatus,
} from "@/lib/db/registrations";
import type { RegistrationStatus } from "@/lib/db/types";
import { sendReadyEmail, sendThankYouEmail } from "@/lib/email";
import { statusUpdateSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const status = parsed.data.status as RegistrationStatus;
    const playedAt =
      status === "playing" || status === "completed"
        ? new Date().toISOString()
        : null;

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

    if (status === "ready" && !registration.ready_email_sent_at) {
      email = await sendReadyEmail(registration);
      if (email.sent) {
        await markReadyEmailSent(registration.id);
      }
    }

    if (status === "completed" && !registration.thank_you_email_sent_at) {
      email = await sendThankYouEmail(registration);
      if (email.sent) {
        await markThankYouEmailSent(registration.id);
      }
    }

    return NextResponse.json({ registration, email });
  } catch (err) {
    console.error("[registrations PATCH]", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
