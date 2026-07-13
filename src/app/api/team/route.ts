import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createTeamMember,
  listPublicTeamMembers,
  listTeamMembers,
  setTeamMemberActive,
} from "@/lib/db/team";
import { sendTeamInviteEmail } from "@/lib/email";
import { teamMemberSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get("public") === "1";

  try {
    if (publicOnly) {
      const members = await listPublicTeamMembers();
      return NextResponse.json({ members });
    }

    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await listTeamMembers();
    return NextResponse.json({ members });
  } catch (err) {
    console.error("[team GET]", err);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = teamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid team member" },
        { status: 400 }
      );
    }

    const member = await createTeamMember(parsed.data);
    const emailResult = await sendTeamInviteEmail(member);

    return NextResponse.json({ member, email: emailResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add team member";
    console.error("[team POST]", err);
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "That email is already on the booth team" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const active = Boolean(body.active);
    if (!id) {
      return NextResponse.json({ error: "Missing team member id" }, { status: 400 });
    }

    const member = await setTeamMemberActive(id, active);
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (err) {
    console.error("[team PATCH]", err);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}
