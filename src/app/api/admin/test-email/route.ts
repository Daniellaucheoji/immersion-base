import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sendTestEmail } from "@/lib/email";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const to =
      (typeof body.to === "string" && body.to.trim()) ||
      session.email ||
      process.env.SMTP_USER;

    if (!to) {
      return NextResponse.json({ error: "No recipient email" }, { status: 400 });
    }

    const result = await sendTestEmail(to);
    return NextResponse.json({
      ok: result.sent,
      to,
      email: result,
      smtpConfigured: Boolean(
        process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
      ),
    });
  } catch (err) {
    console.error("[test-email]", err);
    return NextResponse.json({ error: "Test email failed" }, { status: 500 });
  }
}
