import { getSql } from "@/lib/db/client";
import type { CreateEventInput, ImmersionEvent } from "@/lib/db/types";

const EVENT_TIMEZONE = process.env.EVENT_TIMEZONE || "America/Los_Angeles";

function mapEvent(row: Record<string, unknown>): ImmersionEvent {
  const eventDate =
    row.event_date instanceof Date
      ? row.event_date.toISOString().slice(0, 10)
      : String(row.event_date).slice(0, 10);

  return {
    id: String(row.id),
    name: String(row.name),
    location: String(row.location),
    event_date: eventDate,
    start_time: row.start_time == null ? null : String(row.start_time).slice(0, 5),
    end_time: row.end_time == null ? null : String(row.end_time).slice(0, 5),
    active: Boolean(row.active),
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

/** Today's calendar date in the event timezone (YYYY-MM-DD). */
export function todayInEventTimezone(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatEventDateLabel(eventDate: string) {
  const [year, month, day] = eventDate.split("-").map(Number);
  if (!year || !month || !day) return eventDate;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export async function listEvents() {
  const sql = getSql();
  const rows = await sql`
    select *
    from immersion_events
    order by event_date desc, created_at desc
  `;
  return rows.map((row) => mapEvent(row as Record<string, unknown>));
}

export async function getEventById(id: string) {
  const sql = getSql();
  const rows = await sql`
    select * from immersion_events
    where id = ${id}::uuid
    limit 1
  `;
  const row = rows[0];
  return row ? mapEvent(row as Record<string, unknown>) : null;
}

/**
 * Current kiosk event:
 * 1) active event on today's date
 * 2) nearest upcoming active event
 * 3) most recent past active event
 */
export async function getCurrentEvent() {
  const sql = getSql();
  const today = todayInEventTimezone();

  const todayRows = await sql`
    select * from immersion_events
    where active = true
      and event_date = ${today}::date
    order by start_time nulls last, created_at desc
    limit 1
  `;
  if (todayRows[0]) return mapEvent(todayRows[0] as Record<string, unknown>);

  const upcoming = await sql`
    select * from immersion_events
    where active = true
      and event_date > ${today}::date
    order by event_date asc, start_time nulls last
    limit 1
  `;
  if (upcoming[0]) return mapEvent(upcoming[0] as Record<string, unknown>);

  const recent = await sql`
    select * from immersion_events
    where active = true
      and event_date < ${today}::date
    order by event_date desc, start_time nulls last
    limit 1
  `;
  return recent[0] ? mapEvent(recent[0] as Record<string, unknown>) : null;
}

export async function createEvent(input: CreateEventInput) {
  const sql = getSql();
  const rows = await sql`
    insert into immersion_events (
      name,
      location,
      event_date,
      start_time,
      end_time,
      active
    ) values (
      ${input.name.trim()},
      ${input.location.trim()},
      ${input.event_date}::date,
      ${input.start_time || null}::time,
      ${input.end_time || null}::time,
      ${input.active ?? true}
    )
    returning *
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not create event");
  return mapEvent(row as Record<string, unknown>);
}

export async function setEventActive(id: string, active: boolean) {
  const sql = getSql();
  const rows = await sql`
    update immersion_events
    set active = ${active}
    where id = ${id}::uuid
    returning *
  `;
  const row = rows[0];
  return row ? mapEvent(row as Record<string, unknown>) : null;
}
