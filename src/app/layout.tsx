import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialFeed — Connect, Share, Stay Updated",
  description:
    "SocialFeed is a social platform to share moments, connect with friends, and stay updated with your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
