"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  ImmersionEvent,
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
  const [testingEmail, setTestingEmail] = useState(false);
  const [events, setEvents] = useState<ImmersionEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<ImmersionEvent | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

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

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.events || []);
      setCurrentEvent(data.currentEvent || null);
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
      loadEvents();
      const interval = setInterval(loadRegistrations, 15000);
      return () => clearInterval(interval);
    }
  }, [authenticated, loadRegistrations, loadTeam, loadEvents]);

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
    setEvents([]);
    setCurrentEvent(null);
  }

  function formatEventDateLabel(value: string | null | undefined) {
    if (!value) return "—";
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  function formatPlayedAt(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  async function handleAddEvent(event: FormEvent) {
    event.preventDefault();
    setAddingEvent(true);
    setEventError(null);
    setEventMessage(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          location: eventLocation,
          event_date: eventDate,
          start_time: eventStart || null,
          end_time: eventEnd || null,
          active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create event");
      setEventName("");
      setEventLocation("");
      setEventDate("");
      setEventStart("");
      setEventEnd("");
      setEventMessage(`${data.event.name} added for ${formatEventDateLabel(data.event.event_date)}.`);
      await loadEvents();
    } catch (err) {
      setEventError(err instanceof Error ? err.message : "Could not create event");
    } finally {
      setAddingEvent(false);
    }
  }

  async function toggleEventActive(item: ImmersionEvent) {
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
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
      if (data.email && data.email.sent === false && !data.email.skipped) {
        alert(`Status updated, but email failed: ${data.email.error || "unknown error"}`);
      } else if (data.email?.skipped) {
        alert("Status updated, but SMTP is not configured on the server — email was skipped.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  async function resendEmail(
    id: string,
    type: "acknowledgment" | "ready" | "thank_you"
  ) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-email", type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      if (data.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === id ? data.registration : r))
        );
      }
      const result = data.email?.[type];
      if (result?.sent) {
        alert("Email resent successfully. Ask the guest to check inbox and spam.");
      } else if (result?.skipped) {
        alert("SMTP is not configured on the server.");
      } else {
        alert(`Email failed: ${result?.error || "unknown error"}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Resend failed");
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

  async function handleTestEmail() {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: session?.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      if (data.email?.sent) {
        alert(`Test email sent to ${data.to}. Check inbox and spam.`);
      } else if (data.email?.skipped) {
        alert("SMTP is not configured on the server (missing SMTP env vars).");
      } else {
        alert(`Test email failed: ${data.email?.error || "unknown error"}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingEmail(false);
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
            onClick={handleTestEmail}
            disabled={testingEmail}
            className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-700 hover:bg-violet-100 disabled:opacity-60"
          >
            {testingEmail ? "Sending…" : "Test email"}
          </button>
          <button
            type="button"
            onClick={() => {
              loadRegistrations();
              loadTeam();
              loadEvents();
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
        <div className="mb-4">
          <h2 className="text-base font-semibold tracking-wide">Events</h2>
          <p className="text-sm text-neutral-500">
            Add event name, location, and date. The kiosk and guest emails use the current event
            {currentEvent ? (
              <>
                {" "}
                (now: <span className="text-neutral-700">{currentEvent.name}</span> at{" "}
                <span className="text-neutral-700">{currentEvent.location}</span>)
              </>
            ) : null}
            .
          </p>
        </div>

        <form
          onSubmit={handleAddEvent}
          className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.2fr_1fr_0.7fr_0.7fr_auto]"
        >
          <input
            required
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Event name"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <input
            required
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Location"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <input
            required
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
          />
          <input
            type="time"
            value={eventStart}
            onChange={(e) => setEventStart(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            title="Start time (optional)"
          />
          <input
            type="time"
            value={eventEnd}
            onChange={(e) => setEventEnd(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            title="End time (optional)"
          />
          <button
            type="submit"
            disabled={addingEvent}
            className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {addingEvent ? "Adding…" : "Add event"}
          </button>
        </form>

        {eventError && <p className="mb-3 text-sm text-red-600">{eventError}</p>}
        {eventMessage && <p className="mb-3 text-sm text-violet-700">{eventMessage}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-2 py-2 font-medium">Event</th>
                <th className="px-2 py-2 font-medium">Location</th>
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Hours</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-neutral-500">
                    No events yet. Add one so check-ins use the real event name.
                  </td>
                </tr>
              ) : (
                events.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-2 py-3 font-medium">
                      {item.name}
                      {currentEvent?.id === item.id ? (
                        <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium tracking-wide text-violet-700 uppercase">
                          Current
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 text-neutral-600">{item.location}</td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {formatEventDateLabel(item.event_date)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-neutral-600">
                      {item.start_time || item.end_time
                        ? `${item.start_time || "—"} – ${item.end_time || "—"}`
                        : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.active
                            ? "bg-violet-50 text-violet-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleEventActive(item)}
                        className="text-xs text-neutral-500 hover:text-neutral-900"
                      >
                        {item.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <th className="px-4 py-3 font-medium">Check-in</th>
              <th className="px-4 py-3 font-medium">Played at</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Event date</th>
              <th className="px-4 py-3 font-medium">Checked in by</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Emails</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-neutral-500">
                  Loading registrations…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-neutral-500">
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
                    <td className="px-4 py-3 whitespace-nowrap">{formatPlayedAt(row.played_at)}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate" title={row.event_name}>
                      {row.event_name}
                    </td>
                    <td className="px-4 py-3 max-w-[9rem] truncate" title={row.location || undefined}>
                      {row.location || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatEventDateLabel(row.event_date)}
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
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => resendEmail(row.id, "acknowledgment")}
                          className="text-left text-xs text-violet-700 hover:underline disabled:opacity-50"
                        >
                          Resend check-in{row.acknowledgment_sent_at ? "" : " (missing)"}
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => resendEmail(row.id, "ready")}
                          className="text-left text-xs text-violet-700 hover:underline disabled:opacity-50"
                        >
                          Resend ready{row.ready_email_sent_at ? "" : " (missing)"}
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === row.id}
                          onClick={() => resendEmail(row.id, "thank_you")}
                          className="text-left text-xs text-violet-700 hover:underline disabled:opacity-50"
                        >
                          Resend thanks{row.thank_you_email_sent_at ? "" : " (missing)"}
                        </button>
                      </div>
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
