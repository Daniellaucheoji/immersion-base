import { createHash, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db/client";
import { findTeamMemberByEmail } from "@/lib/db/team";
import type { TeamMember } from "@/lib/db/types";

const COOKIE_NAME = "immersion_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const ALLOWED_EMAIL_DOMAIN = "nodeclub.co";

export type AdminSession = {
  email: string;
  teamMemberId: string | null;
  name: string | null;
  role: string | null;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-insecure-secret";
}

function sign(value: string) {
  return createHash("sha256").update(`${value}.${getSecret()}`).digest("hex");
}

function hashOtp(email: string, code: string) {
  return createHash("sha256")
    .update(`${email.toLowerCase()}:${code}:${getSecret()}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isNodeclubEmail(email: string) {
  const normalized = normalizeAdminEmail(email);
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) &&
    normalized.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
  );
}

/** @deprecated use canAccessAdmin */
export function isAllowedAdminEmail(email: string) {
  return isNodeclubEmail(email);
}

export async function resolveAdminAccess(email: string): Promise<{
  allowed: boolean;
  teamMember: TeamMember | null;
}> {
  const normalized = normalizeAdminEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { allowed: false, teamMember: null };
  }

  const teamMember = await findTeamMemberByEmail(normalized);
  if (teamMember) {
    return { allowed: true, teamMember };
  }

  if (isNodeclubEmail(normalized)) {
    return { allowed: true, teamMember: null };
  }

  return { allowed: false, teamMember: null };
}

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export async function storeAdminOtp(email: string, code: string) {
  const sql = getSql();
  const normalized = normalizeAdminEmail(email);
  const codeHash = hashOtp(normalized, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  await sql`
    delete from immersion_admin_otps
    where email = ${normalized}
       or expires_at < now()
  `;

  await sql`
    insert into immersion_admin_otps (email, code_hash, expires_at)
    values (${normalized}, ${codeHash}, ${expiresAt}::timestamptz)
  `;
}

export async function verifyAdminOtp(email: string, code: string) {
  const sql = getSql();
  const normalized = normalizeAdminEmail(email);
  const codeHash = hashOtp(normalized, code.trim());

  const rows = await sql`
    select id, code_hash, expires_at, used_at
    from immersion_admin_otps
    where email = ${normalized}
    order by created_at desc
    limit 1
  `;

  const row = rows[0] as
    | { id: string; code_hash: string; expires_at: string; used_at: string | null }
    | undefined;

  if (!row || row.used_at) return false;
  if (new Date(row.expires_at).getTime() < Date.now()) return false;
  if (!safeEqual(String(row.code_hash), codeHash)) return false;

  await sql`
    update immersion_admin_otps
    set used_at = now()
    where id = ${row.id}::uuid
  `;

  return true;
}

export async function createAdminSession(email: string, teamMember?: TeamMember | null) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const normalized = normalizeAdminEmail(email);
  const memberId = teamMember?.id || "none";
  const payload = `admin:${normalized}:${memberId}:${issuedAt}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;

  const parts = payload.split(":");
  if (parts[0] !== "admin" || parts.length < 4) return null;

  const issuedAt = Number(parts[parts.length - 1]);
  const teamMemberIdRaw = parts[parts.length - 2];
  const email = parts.slice(1, -2).join(":");
  if (!Number.isFinite(issuedAt)) return null;

  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age > MAX_AGE_SECONDS) return null;

  const access = await resolveAdminAccess(email);
  if (!access.allowed) return null;

  const teamMemberId =
    teamMemberIdRaw !== "none"
      ? teamMemberIdRaw
      : access.teamMember?.id || null;

  return {
    email,
    teamMemberId,
    name: access.teamMember?.name || null,
    role: access.teamMember?.role || (isNodeclubEmail(email) ? "Admin" : null),
  };
}

export async function isAdminAuthenticated() {
  const session = await getAdminSession();
  return Boolean(session);
}
