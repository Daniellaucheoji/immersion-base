import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immersion | Check In",
  description: "Sign in for your Immersion experience and receive your queue number.",
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="play-shell min-h-dvh text-white antialiased">
      {children}
    </div>
  );
}
