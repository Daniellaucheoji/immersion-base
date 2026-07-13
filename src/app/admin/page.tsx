"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  ImmersionKioskRegistration,
  RegistrationStatus,
  TeamMember,
} from "@/lib/db/types";

const STATUS_OPTIONS: RegistrationStatus[] = [
  "waiting",
  "ready",
  "playing",
  "completed",
  "no_show",
];

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  waiting: "Waiting",
  ready: "Ready",
  playing: "Playing",
  completed: "Completed",
  no_show: "No show",
};

const ROLE_SUGGESTIONS = [
  "Guest Experience Lead",
  "Booth Staff",
  "VR Host",
  "FIFA Host",
  "Floor Manager",
];

type AdminSessionInfo = {
  email: string;
  name: string | null;
  role: string | null;
  teamMemberId: string | null;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [session, setSession] = useState<AdminSessionInfo | null>(null);
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginInfo, setLoginInfo] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [registrations, setRegistrations] = useState<ImmersionKioskRegistration[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("Booth Staff");
  const [addingTeam, setAddingTeam] = useState(false);
  const [teamMessage, setTeamMessage] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/auth");
    const data = await res.json();
    setAuthenticated(Boolean(data.authenticated));
    setSession(data.session || null);
  }, []);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/registrations");
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRegistrations(data.registrations || []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (!res.ok) return;
      const data = await res.json();
      setTeamMembers(data.members || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authenticated) {
      loadRegistrations();
      loadTeam();
      const interval = setInterval(loadRegistrations, 15000);
      return () => clearInterval(interval);
    }
  }, [authenticated, loadRegistrations, loadTeam]);

  const eventNames = useMemo(() => {
    const names = new Set(registrations.map((r) => r.event_name));
    return Array.from(names).sort();
  }, [registrations]);

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (eventFilter !== "all" && r.event_name !== eventFilter) return false;
      return true;
    });
  }, [registrations, statusFilter, eventFilter]);

  const stats = useMemo(() => {
    const waiting = registrations.filter((r) => r.status === "waiting").length;
    const ready = registrations.filter((r) => r.status === "ready").length;
    const playing = registrations.filter((r) => r.status === "playing").length;
    const completed = registrations.filter((r) => r.status === "completed").length;
    return { waiting, ready, playing, completed, total: registrations.length };
  }, [registrations]);

  async function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    setLoginInfo(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setLoginStep("otp");
      setOtpCode("");
      if (data.devHint) setLoginInfo(data.devHint);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setOtpCode("");
      setSession(data.session || null);
      setAuthenticated(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setSession(null);
    setLoginStep("email");
    setEmail("");
    setOtpCode("");
    setRegistrations([]);
    setTeamMembers([]);
  }

  async function updateStatus(id: string, status: RegistrationStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? data.registration : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAddTeamMember(event: FormEvent) {
    event.preventDefault();
    setAddingTeam(true);
    setTeamError(null);
    setTeamMessage(null);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          email: teamEmail,
          role: teamRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add team member");
      setTeamMembers((prev) => [data.member, ...prev]);
      setTeamName("");
      setTeamEmail("");
      setTeamRole("Booth Staff");
      setTeamMessage(
        data.email?.sent
          ? `${data.member.name} added and invited by email.`
          : `${data.member.name} added. Invite email could not be sent — check SMTP.`
      );
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : "Could not add team member");
    } finally {
      setAddingTeam(false);
    }
  }

  async function toggleTeamActive(member: TeamMember) {
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, active: !member.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === member.id ? data.member : m))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (authenticated === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo.png" alt="Immersion" width={48} height={60} className="h-12 w-auto" />
          <h1 className="mt-4 text-lg font-semibold tracking-wide">Admin</h1>
          <p className="mt-1 text-sm text-neutral-500">Guest Experience Lead</p>
        </div>

        {loginStep === "email" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-neutral-500 uppercase">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="you@nodeclub.co or booth team email"
              />
            </label>
            <p className="text-xs text-neutral-400">
              Sign in with a <span className="text-neutral-600">@nodeclub.co</span> email or any
              invited booth team member email.
            </p>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loggingIn ? "Sending code…" : "Send one-time code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-neutral-500">
              We sent a 6-digit code to <span className="text-neutral-800">{email}</span>
            </p>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-neutral-500 uppercase">
                One-time code
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="\d{6}"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-lg tracking-[0.35em] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                placeholder="000000"
              />
            </label>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            {loginInfo && <p className="text-sm text-amber-700">{loginInfo}</p>}
            <button
              type="submit"
              disabled={loggingIn || otpCode.length !== 6}
              className="btn-primary w-full rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {loggingIn ? "Verifying…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginStep("email");
                setOtpCode("");
                setLoginError(null);
                setLoginInfo(null);
              }}
              className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-800"
            >
              Use a different email
            </button>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Immersion" width={36} height={45} className="h-9 w-auto" />
          <div>
            <h1 className="text-lg font-semibold tracking-wide">Guest Queue</h1>
            <p className="text-sm text-neutral-500">
              {session?.name
                ? `${session.name}${session.role ? ` · ${session.role}` : ""}`
                : session?.email || "enterimmersion.com/admin"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadRegistrations();
              loadTeam();
            }}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: stats.total },
          { label: "Waiting", value: stats.waiting },
          { label: "Ready", value: stats.ready },
          { label: "Playing", value: stats.playing },
          { label: "Completed", value: stats.completed },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-xs tracking-wide text-neutral-500 uppercase">{stat.label}</p>
            <p className="mt-1 text-2xl font-light">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-wide">Booth team</h2>
            <p className="text-sm text-neutral-500">
              Add staff working tonight. They get an invite email with their role and can sign in
              with OTP.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddTeamMember}
          className="mb-5 grid gap-3 sm:grid-cols-[1.2fr_1.4fr_1fr_auto]"
        >
          <input
            required
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Name"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <input
            required
            type="email"
            value={teamEmail}
            onChange={(e) => setTeamEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <input
            required
            list="role-suggestions"
            value={teamRole}
            onChange={(e) => setTeamRole(e.target.value)}
            placeholder="Role"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <datalist id="role-suggestions">
            {ROLE_SUGGESTIONS.map((role) => (
              <option key={role} value={role} />
            ))}
          </datalist>
          <button
            type="submit"
            disabled={addingTeam}
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {addingTeam ? "Adding…" : "Add"}
          </button>
        </form>

        {teamError && <p className="mb-3 text-sm text-red-600">{teamError}</p>}
        {teamMessage && <p className="mb-3 text-sm text-violet-700">{teamMessage}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Role</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-neutral-500">
                    No booth team members yet.
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-2 py-3 font-medium">{member.name}</td>
                    <td className="px-2 py-3 text-neutral-600">{member.email}</td>
                    <td className="px-2 py-3">{member.role}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          member.active
                            ? "bg-violet-50 text-violet-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {member.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleTeamActive(member)}
                        className="text-xs text-neutral-500 hover:text-neutral-900"
                      >
                        {member.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All events</option>
          {eventNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </section>

      {fetchError && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchError}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Queue</th>
              <th className="px-4 py-3 font-medium">Guest</th>
              <th className="px-4 py-3 font-medium">Played</th>
              <th className="px-4 py-3 font-medium">Times</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Checked in by</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-neutral-500">
                  Loading registrations…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-neutral-500">
                  No registrations yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const created = new Date(row.created_at);
                return (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium">#{row.queue_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-neutral-500">{row.email}</div>
                      <div className="text-xs text-violet-600">{row.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {row.experience}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.play_count}×</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {created.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {created.toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 max-w-[10rem] truncate" title={row.event_name}>
                      {row.event_name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {row.checked_in_by_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        disabled={updatingId === row.id}
                        onChange={(e) =>
                          updateStatus(row.id, e.target.value as RegistrationStatus)
                        }
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-neutral-400">
        <strong>Ready</strong> emails the guest that their station is ready.
        <strong> Completed</strong> sends a thank-you note with a link to follow{" "}
        <a
          href="https://www.instagram.com/landofimmersion/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          @landofimmersion
        </a>
        . Guest check-ins on the kiosk record the selected booth team member.
      </p>
    </main>
  );
}
