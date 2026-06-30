import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe — Connect, Share, Feel the Vibe",
  description:
    "Vibe is a social platform to share moments, connect with friends, and feel the vibe of your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
