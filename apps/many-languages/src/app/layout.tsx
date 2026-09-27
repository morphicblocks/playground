import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Many Languages · Morphic Blocks",
  description: "The same blocks speak English, Deutsch, Español, Ελληνικά, 中文 and العربية.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // The editor sets lang to the chosen language, so React leaves it alone.
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
