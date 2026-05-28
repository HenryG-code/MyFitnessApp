import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiftLog | Free Fitness Tracker",
  description:
    "A free portfolio fitness tracker for workouts, weight, and habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
