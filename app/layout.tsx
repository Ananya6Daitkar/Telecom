import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxHalo | Live Voice Trust Infrastructure",
  description: "Live voice trust infrastructure for scam, spoof, and deepfake call defense"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
