import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  createEvent,
  getCurrentEvent,
  listEvents,
  setEventActive,
} from "@/lib/db/events";
import { eventSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const current = searchParams.get("current") === "1";
  const publicOnly = searchParams.get("public") === "1";

  try {
    if (current || publicOnly) {
      const event = await getCurrentEvent();
      return NextResponse.json({ event });
    }

    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await listEvents();
    const currentEvent = await getCurrentEvent();
    return NextResponse.json({ events, currentEvent });
  } catch (err) {
    console.error("[events GET]", err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid event" },
        { status: 400 }
      );
    }

    const event = await createEvent({
      ...parsed.data,
      start_time: parsed.data.start_time || null,
      end_time: parsed.data.end_time || null,
    });
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[events POST]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
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
    if (!id) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const event = await setEventActive(id, Boolean(body.active));
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err) {
    console.error("[events PATCH]", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}
