import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immersion Admin | Guest Queue",
  description: "Manage Immersion kiosk registrations and queue status.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-neutral-50 text-neutral-900">{children}</div>;
}
