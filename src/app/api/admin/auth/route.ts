import { NextResponse } from "next/server";
import {
  clearAdminSession,
  createAdminSession,
  generateOtpCode,
  getAdminSession,
  normalizeAdminEmail,
  resolveAdminAccess,
  storeAdminOtp,
  verifyAdminOtp,
} from "@/lib/admin-auth";
import { sendAdminOtpEmail } from "@/lib/email";

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({
    authenticated: Boolean(session),
    session: session
      ? {
          email: session.email,
          name: session.name,
          role: session.role,
          teamMemberId: session.teamMemberId,
        }
      : null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "request-otp") {
      const email = normalizeAdminEmail(typeof body.email === "string" ? body.email : "");
      const access = await resolveAdminAccess(email);

      if (!access.allowed) {
        return NextResponse.json(
          {
            error:
              "This email isn't authorized. Use a @nodeclub.co email or an invited booth team email.",
          },
          { status: 400 }
        );
      }

      const code = generateOtpCode();
      await storeAdminOtp(email, code);

      const emailResult = await sendAdminOtpEmail(email, code);
      if (!emailResult.sent) {
        if (process.env.NODE_ENV !== "production") {
          console.info(`[admin-otp] Dev code for ${email}: ${code}`);
          return NextResponse.json({
            ok: true,
            step: "otp",
            devHint: "SMTP unavailable — check the server console for your code",
          });
        }
        return NextResponse.json(
          { error: emailResult.error || "Failed to send one-time code" },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, step: "otp" });
    }

    if (action === "verify-otp") {
      const email = normalizeAdminEmail(typeof body.email === "string" ? body.email : "");
      const code = typeof body.code === "string" ? body.code.trim() : "";
      const access = await resolveAdminAccess(email);

      if (!access.allowed) {
        return NextResponse.json(
          {
            error:
              "This email isn't authorized. Use a @nodeclub.co email or an invited booth team email.",
          },
          { status: 400 }
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
      }

      const valid = await verifyAdminOtp(email, code);
      if (!valid) {
        return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
      }

      await createAdminSession(email, access.teamMember);
      return NextResponse.json({
        ok: true,
        session: {
          email,
          name: access.teamMember?.name || null,
          role: access.teamMember?.role || null,
          teamMemberId: access.teamMember?.id || null,
        },
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin auth]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
