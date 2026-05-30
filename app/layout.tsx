import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiftLog",
  description: "Full-stack fitness tracker built with Next.js and Supabase.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LiftLog",
  },
  openGraph: {
    title: "LiftLog",
    description: "Full-stack fitness tracker built with Next.js and Supabase.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
