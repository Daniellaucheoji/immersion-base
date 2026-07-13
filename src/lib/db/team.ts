import { getSql } from "@/lib/db/client";
import type { CreateTeamMemberInput, TeamMember } from "@/lib/db/types";

function mapTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    active: Boolean(row.active),
    invited_at: row.invited_at ? new Date(String(row.invited_at)).toISOString() : null,
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

export async function listTeamMembers(options?: { activeOnly?: boolean }) {
  const sql = getSql();
  const rows = options?.activeOnly
    ? await sql`
        select * from immersion_team_members
        where active = true
        order by name asc
      `
    : await sql`
        select * from immersion_team_members
        order by created_at desc
      `;
  return rows.map((row) => mapTeamMember(row as Record<string, unknown>));
}

export async function listPublicTeamMembers() {
  const sql = getSql();
  const rows = await sql`
    select id, name, role
    from immersion_team_members
    where active = true
    order by name asc
  `;
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
  }));
}

export async function findTeamMemberByEmail(email: string) {
  const sql = getSql();
  const normalized = email.trim().toLowerCase();
  const rows = await sql`
    select * from immersion_team_members
    where lower(email) = ${normalized}
      and active = true
    limit 1
  `;
  const row = rows[0];
  return row ? mapTeamMember(row as Record<string, unknown>) : null;
}

export async function findTeamMemberById(id: string) {
  const sql = getSql();
  const rows = await sql`
    select * from immersion_team_members
    where id = ${id}::uuid
    limit 1
  `;
  const row = rows[0];
  return row ? mapTeamMember(row as Record<string, unknown>) : null;
}

export async function createTeamMember(input: CreateTeamMemberInput) {
  const sql = getSql();
  const rows = await sql`
    insert into immersion_team_members (name, email, role, active, invited_at)
    values (
      ${input.name.trim()},
      ${input.email.trim().toLowerCase()},
      ${input.role.trim()},
      true,
      now()
    )
    returning *
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not create team member");
  return mapTeamMember(row as Record<string, unknown>);
}

export async function setTeamMemberActive(id: string, active: boolean) {
  const sql = getSql();
  const rows = await sql`
    update immersion_team_members
    set active = ${active}
    where id = ${id}::uuid
    returning *
  `;
  const row = rows[0];
  return row ? mapTeamMember(row as Record<string, unknown>) : null;
}
