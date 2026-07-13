import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createRegistration,
  listRegistrations,
  markAcknowledgmentSent,
} from "@/lib/db/registrations";
import type { RegistrationStatus } from "@/lib/db/types";
import { sendAcknowledgmentEmail } from "@/lib/email";
import { registrationSchema } from "@/lib/validations";

const VALID_STATUSES: RegistrationStatus[] = [
  "waiting",
  "ready",
  "playing",
  "completed",
  "no_show",
];

export async function GET(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("event");
    const statusParam = searchParams.get("status");
    const status = VALID_STATUSES.find((s) => s === statusParam) ?? null;

    const registrations = await listRegistrations({
      eventName,
      status,
    });

    return NextResponse.json({ registrations });
  } catch (err) {
    console.error("[registrations GET]", err);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration" },
        { status: 400 }
      );
    }

    const eventName =
      (typeof body.event_name === "string" && body.event_name.trim()) ||
      process.env.NEXT_PUBLIC_EVENT_NAME ||
      "Immersion Event";

    const registration = await createRegistration({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      experience: parsed.data.experience,
      event_name: eventName,
      disclaimer_accepted: parsed.data.disclaimer_accepted,
      checked_in_by_team_member_id: parsed.data.checked_in_by_team_member_id || null,
    });

    const emailResult = await sendAcknowledgmentEmail(registration);
    if (emailResult.sent) {
      await markAcknowledgmentSent(registration.id);
    }

    return NextResponse.json({
      registration,
      email: emailResult,
    });
  } catch (err) {
    console.error("[registrations POST]", err);
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    let hint = "Could not complete registration";
    if (lower.includes("missing database_url")) {
      hint =
        "Server is missing DATABASE_URL. Add your Neon connection string in the hosting environment variables, then redeploy.";
    } else if (
      lower.includes("does not exist") ||
      lower.includes("relation") ||
      lower.includes("undefined_table") ||
      lower.includes("undefined_column")
    ) {
      hint =
        "Database schema is incomplete. Run neon/schema.sql in your Neon SQL editor, then try again.";
    } else if (lower.includes("password authentication failed") || lower.includes("connection")) {
      hint =
        "Could not connect to the database. Check DATABASE_URL on the hosting provider.";
    }

    return NextResponse.json(
      {
        error: hint,
        // Safe short code for debugging without exposing secrets
        code: lower.includes("missing database_url")
          ? "MISSING_DATABASE_URL"
          : lower.includes("does not exist") || lower.includes("undefined_")
            ? "MISSING_SCHEMA"
            : "REGISTRATION_FAILED",
      },
      { status: 500 }
    );
  }
}
