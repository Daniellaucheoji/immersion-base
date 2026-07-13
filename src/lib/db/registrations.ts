import { getSql } from "@/lib/db/client";
import type {
  CreateRegistrationInput,
  ImmersionKioskRegistration,
  RegistrationStatus,
  UpdateRegistrationStatusInput,
} from "@/lib/db/types";

function mapRow(row: Record<string, unknown>): ImmersionKioskRegistration {
  return {
    id: String(row.id),
    queue_number: Number(row.queue_number),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ""),
    experience: row.experience as ImmersionKioskRegistration["experience"],
    status: row.status as ImmersionKioskRegistration["status"],
    event_name: String(row.event_name),
    play_count: Number(row.play_count),
    checked_in_by_team_member_id: row.checked_in_by_team_member_id
      ? String(row.checked_in_by_team_member_id)
      : null,
    checked_in_by_name: row.checked_in_by_name ? String(row.checked_in_by_name) : null,
    disclaimer_accepted_at: row.disclaimer_accepted_at
      ? new Date(String(row.disclaimer_accepted_at)).toISOString()
      : null,
    acknowledgment_sent_at: row.acknowledgment_sent_at
      ? new Date(String(row.acknowledgment_sent_at)).toISOString()
      : null,
    ready_email_sent_at: row.ready_email_sent_at
      ? new Date(String(row.ready_email_sent_at)).toISOString()
      : null,
    thank_you_email_sent_at: row.thank_you_email_sent_at
      ? new Date(String(row.thank_you_email_sent_at)).toISOString()
      : null,
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
    played_at: row.played_at ? new Date(String(row.played_at)).toISOString() : null,
  };
}

async function getRegistrationById(id: string) {
  const sql = getSql();
  const rows = await sql`
    select
      r.*,
      t.name as checked_in_by_name
    from immersion_kiosk_registrations r
    left join immersion_team_members t on t.id = r.checked_in_by_team_member_id
    where r.id = ${id}::uuid
    limit 1
  `;
  const row = rows[0];
  return row ? mapRow(row as Record<string, unknown>) : null;
}

export { getRegistrationById };

export async function listRegistrations(filters?: {
  eventName?: string | null;
  status?: RegistrationStatus | null;
}) {
  const sql = getSql();

  if (filters?.eventName && filters?.status) {
    const rows = await sql`
      select
        r.*,
        t.name as checked_in_by_name
      from immersion_kiosk_registrations r
      left join immersion_team_members t on t.id = r.checked_in_by_team_member_id
      where r.event_name = ${filters.eventName}
        and r.status = ${filters.status}
      order by r.created_at desc
    `;
    return rows.map((row) => mapRow(row as Record<string, unknown>));
  }

  if (filters?.eventName) {
    const rows = await sql`
      select
        r.*,
        t.name as checked_in_by_name
      from immersion_kiosk_registrations r
      left join immersion_team_members t on t.id = r.checked_in_by_team_member_id
      where r.event_name = ${filters.eventName}
      order by r.created_at desc
    `;
    return rows.map((row) => mapRow(row as Record<string, unknown>));
  }

  if (filters?.status) {
    const rows = await sql`
      select
        r.*,
        t.name as checked_in_by_name
      from immersion_kiosk_registrations r
      left join immersion_team_members t on t.id = r.checked_in_by_team_member_id
      where r.status = ${filters.status}
      order by r.created_at desc
    `;
    return rows.map((row) => mapRow(row as Record<string, unknown>));
  }

  const rows = await sql`
    select
      r.*,
      t.name as checked_in_by_name
    from immersion_kiosk_registrations r
    left join immersion_team_members t on t.id = r.checked_in_by_team_member_id
    order by r.created_at desc
  `;
  return rows.map((row) => mapRow(row as Record<string, unknown>));
}

export async function createRegistration(input: CreateRegistrationInput) {
  if (!input.disclaimer_accepted) {
    throw new Error("Disclaimer must be accepted");
  }

  const sql = getSql();
  const checkedInBy = input.checked_in_by_team_member_id || null;

  const rows = checkedInBy
    ? await sql`
        insert into immersion_kiosk_registrations (
          name, email, phone, experience, event_name, status,
          disclaimer_accepted_at, checked_in_by_team_member_id
        ) values (
          ${input.name},
          ${input.email.toLowerCase()},
          ${input.phone},
          ${input.experience},
          ${input.event_name},
          'waiting',
          now(),
          ${checkedInBy}::uuid
        )
        returning id
      `
    : await sql`
        insert into immersion_kiosk_registrations (
          name, email, phone, experience, event_name, status,
          disclaimer_accepted_at
        ) values (
          ${input.name},
          ${input.email.toLowerCase()},
          ${input.phone},
          ${input.experience},
          ${input.event_name},
          'waiting',
          now()
        )
        returning id
      `;

  const id = String(rows[0]?.id);
  if (!id) throw new Error("Insert returned no row");

  const registration = await getRegistrationById(id);
  if (!registration) throw new Error("Insert returned no row");
  return registration;
}

export async function updateRegistrationStatus(input: UpdateRegistrationStatusInput) {
  const sql = getSql();
  const staffId = input.checked_in_by_team_member_id || null;

  if (input.played_at && staffId) {
    await sql`
      update immersion_kiosk_registrations
      set
        status = ${input.status},
        played_at = ${input.played_at}::timestamptz,
        checked_in_by_team_member_id = coalesce(checked_in_by_team_member_id, ${staffId}::uuid)
      where id = ${input.id}::uuid
    `;
  } else if (input.played_at) {
    await sql`
      update immersion_kiosk_registrations
      set
        status = ${input.status},
        played_at = ${input.played_at}::timestamptz
      where id = ${input.id}::uuid
    `;
  } else if (staffId) {
    await sql`
      update immersion_kiosk_registrations
      set
        status = ${input.status},
        checked_in_by_team_member_id = coalesce(checked_in_by_team_member_id, ${staffId}::uuid)
      where id = ${input.id}::uuid
    `;
  } else {
    await sql`
      update immersion_kiosk_registrations
      set status = ${input.status}
      where id = ${input.id}::uuid
    `;
  }

  return getRegistrationById(input.id);
}

export async function markAcknowledgmentSent(id: string) {
  const sql = getSql();
  await sql`
    update immersion_kiosk_registrations
    set acknowledgment_sent_at = now()
    where id = ${id}::uuid
  `;
}

export async function markReadyEmailSent(id: string) {
  const sql = getSql();
  await sql`
    update immersion_kiosk_registrations
    set ready_email_sent_at = now()
    where id = ${id}::uuid
  `;
}

export async function markThankYouEmailSent(id: string) {
  const sql = getSql();
  await sql`
    update immersion_kiosk_registrations
    set thank_you_email_sent_at = now()
    where id = ${id}::uuid
  `;
}
