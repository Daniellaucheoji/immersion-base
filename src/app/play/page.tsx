"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import type {
  ExperienceType,
  ImmersionEvent,
  ImmersionKioskRegistration,
} from "@/lib/db/types";

type Step = "landing" | "form" | "confirm";

const DISCLAIMER_POINTS = [
  {
    title: "Photosensitivity / epilepsy",
    body: "VR and interactive experiences may include flashing lights, strobing effects, and rapid visual changes that can trigger seizures in people with photosensitive epilepsy. Do not participate if you have a history of epilepsy, seizures, or unexplained blackouts.",
  },
  {
    title: "Motion sickness & discomfort",
    body: "Some guests experience dizziness, nausea, eye strain, headache, balance issues, or disorientation during or after VR. Stop immediately if you feel unwell and notify Immersion staff.",
  },
  {
    title: "Health conditions",
    body: "Consult a physician before playing if you are pregnant, have heart conditions, binocular vision abnormalities, psychiatric disorders, or recent surgery/injury. Immersion experiences involve physical movement and headset equipment.",
  },
  {
    title: "Age, supervision & equipment",
    body: "Follow posted age guidelines. Minors must have a parent/guardian present if required by the event. Remove jewelry that may catch on equipment, secure long hair, and follow staff instructions at all times.",
  },
  {
    title: "Assumption of risk",
    body: "By checking in, you acknowledge these risks, confirm you are participating voluntarily, and agree Immersion and event hosts are not liable for injury or illness arising from participation, except where prohibited by law.",
  },
];

function formatEventDate(eventDate: string) {
  const [year, month, day] = eventDate.split("-").map(Number);
  if (!year || !month || !day) return eventDate;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function PlayPage() {
  const [step, setStep] = useState<Step>("landing");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState<ExperienceType | null>(null);
  const [staffId, setStaffId] = useState("");
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; role: string }>>(
    []
  );
  const [currentEvent, setCurrentEvent] = useState<ImmersionEvent | null>(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ImmersionKioskRegistration | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [step]);

  useEffect(() => {
    fetch("/api/team?public=1")
      .then((res) => res.json())
      .then((data) => setTeamMembers(data.members || []))
      .catch(() => setTeamMembers([]));
  }, []);

  useEffect(() => {
    fetch("/api/events?current=1")
      .then((res) => res.json())
      .then((data) => setCurrentEvent(data.event || null))
      .catch(() => setCurrentEvent(null));
  }, []);

  useEffect(() => {
    if (!disclaimerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [disclaimerOpen]);

  function openDisclaimer(event: FormEvent) {
    event.preventDefault();
    if (!experience) {
      setError("Please select VR or FIFA");
      return;
    }
    if (teamMembers.length > 0 && !staffId) {
      setError("Select the team member checking this guest in");
      return;
    }
    setError(null);
    setDisclaimerAccepted(false);
    setDisclaimerOpen(true);
  }

  async function confirmAndJoin() {
    if (!experience || !disclaimerAccepted) return;
    if (teamMembers.length > 0 && !staffId) {
      setError("Select the team member checking this guest in");
      setDisclaimerOpen(false);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          experience,
          disclaimer_accepted: true,
          checked_in_by_team_member_id: staffId || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Registration failed");
      }

      setDisclaimerOpen(false);
      setRegistration(payload.registration);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDisclaimerOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  function resetKiosk() {
    setName("");
    setEmail("");
    setPhone("");
    setExperience(null);
    setStaffId("");
    setDisclaimerOpen(false);
    setDisclaimerAccepted(false);
    setRegistration(null);
    setError(null);
    setStep("landing");
  }

  const eventLabel =
    currentEvent?.name ||
    process.env.NEXT_PUBLIC_EVENT_NAME ||
    "Immersion Event";
  const eventMeta = currentEvent
    ? [
        currentEvent.location,
        currentEvent.event_date ? formatEventDate(currentEvent.event_date) : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-6 py-12">
      <div className="play-atmosphere" aria-hidden />

      {step === "landing" && (
        <section
          className={`relative z-10 flex w-full flex-col items-center text-center transition-all duration-700 ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Image
            src="/logo.png"
            alt="Immersion"
            width={120}
            height={150}
            priority
            className="h-28 w-auto drop-shadow-[0_0_40px_rgba(167,139,250,0.35)] sm:h-36"
          />
          <p className="mt-8 text-[11px] font-medium tracking-[0.35em] text-violet-300/90">
            IMMERSION
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
            Welcome. Tap below to check in for your experience.
          </p>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="btn-primary mt-10 w-full max-w-xs rounded-full bg-violet-600 px-8 py-4 text-sm font-medium tracking-wide text-white"
          >
            Check In
          </button>
          <p className="mt-6 text-sm text-neutral-300">{eventLabel}</p>
          {eventMeta && <p className="mt-1 text-xs text-neutral-600">{eventMeta}</p>}
        </section>
      )}

      {step === "form" && (
        <section
          className={`relative z-10 w-full transition-all duration-500 ${
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/logo.png"
              alt="Immersion"
              width={64}
              height={80}
              className="h-14 w-auto"
            />
            <h1 className="mt-5 text-xl font-light tracking-wide">Guest check-in</h1>
            <p className="mt-2 text-sm text-neutral-400">
              A few details and we&apos;ll hold your place in line.
            </p>
            <p className="mt-3 text-sm text-violet-200/90">{eventLabel}</p>
            {eventMeta && <p className="mt-1 text-xs text-neutral-500">{eventMeta}</p>}
          </div>

          <form onSubmit={openDisclaimer} className="space-y-5">
            <Field label="Name" htmlFor="name">
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="play-input"
                placeholder="Your name"
              />
            </Field>

            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="play-input"
                placeholder="you@email.com"
              />
            </Field>

            <Field label="Phone number" htmlFor="phone">
              <input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="play-input"
                placeholder="(555) 123-4567"
              />
            </Field>

            <fieldset>
              <legend className="mb-3 text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
                Experience
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(["VR", "FIFA"] as const).map((option) => {
                  const selected = experience === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setExperience(option)}
                      className={`rounded-2xl border px-4 py-5 text-sm font-medium transition-all duration-300 ${
                        selected
                          ? "border-violet-400 bg-violet-600/20 text-white shadow-[0_0_24px_rgba(124,58,237,0.25)]"
                          : "border-white/10 bg-white/5 text-neutral-300 hover:border-white/25"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {teamMembers.length > 0 && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
                  Checked in by
                </span>
                <select
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="play-input appearance-none"
                >
                  <option value="">Select booth team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id} className="bg-[#0c0c12] text-white">
                      {member.name} · {member.role}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="flex-1 rounded-full border border-white/15 px-5 py-3.5 text-sm text-neutral-300 transition hover:border-white/30"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary flex-[1.4] rounded-full bg-violet-600 px-5 py-3.5 text-sm font-medium"
              >
                Join Queue
              </button>
            </div>
          </form>
        </section>
      )}

      {step === "confirm" && registration && (
        <section
          className={`relative z-10 flex w-full flex-col items-center text-center transition-all duration-700 ${
            entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <Image
            src="/logo.png"
            alt="Immersion"
            width={72}
            height={90}
            className="h-16 w-auto"
          />
          <p className="mt-6 text-xs tracking-[0.3em] text-violet-300/90 uppercase">
            You&apos;re checked in
          </p>
          <p className="mt-3 text-sm text-neutral-400">
            Hi {registration.name}, your place is confirmed.
          </p>

          <div className="mt-10 w-full rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm">
            <p className="text-xs tracking-[0.25em] text-neutral-500 uppercase">Queue number</p>
            <p className="mt-3 font-light text-6xl tracking-tight text-white sm:text-7xl">
              #{registration.queue_number}
            </p>
            <p className="mt-6 text-sm text-neutral-300">{registration.event_name}</p>
            <p className="mt-2 text-sm text-neutral-400">
              {registration.experience}
              {registration.location ? ` · ${registration.location}` : ""}
            </p>
            {registration.event_date && (
              <p className="mt-1 text-xs text-neutral-500">
                {formatEventDate(registration.event_date)}
              </p>
            )}
          </div>

          <p className="mt-8 max-w-sm text-sm leading-relaxed text-neutral-400">
            We sent a confirmation to <span className="text-neutral-200">{registration.email}</span>.
            You&apos;ll get another email when your station is ready.
          </p>

          <button
            type="button"
            onClick={resetKiosk}
            className="btn-primary mt-10 w-full max-w-xs rounded-full bg-violet-600 px-8 py-4 text-sm font-medium"
          >
            Done · Next Guest
          </button>
        </section>
      )}

      {disclaimerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
          onClick={() => !submitting && setDisclaimerOpen(false)}
        >
          <div
            className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-violet-400/30 bg-[#0c0c12] shadow-[0_0_48px_rgba(124,58,237,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 px-5 py-4">
              <p
                id="disclaimer-title"
                className="text-xs font-medium tracking-[0.22em] text-violet-300 uppercase"
              >
                Health & safety disclaimer
              </p>
              {experience === "VR" && (
                <p className="mt-2 text-sm text-violet-100/90">
                  Important for VR: flashing lights and rapid visual effects can trigger seizures.
                </p>
              )}
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {DISCLAIMER_POINTS.map((point) => (
                <div key={point.title}>
                  <p className="text-sm font-medium text-white">{point.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{point.body}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-white/10 px-5 py-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-400/20 bg-violet-600/10 p-3">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-violet-300/40 bg-transparent accent-violet-500"
                />
                <span className="text-xs leading-relaxed text-neutral-300">
                  I have read and understand this disclaimer. I confirm I can safely participate
                  and accept the risks described above.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setDisclaimerOpen(false)}
                  className="flex-1 rounded-full border border-white/15 px-4 py-3 text-sm text-neutral-300 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!disclaimerAccepted || submitting}
                  onClick={confirmAndJoin}
                  className="btn-primary flex-[1.4] rounded-full bg-violet-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Accept & Join"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 block text-xs font-medium tracking-[0.2em] text-neutral-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
