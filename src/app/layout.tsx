import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ByteBrief // Tech Intelligence",
    template: "%s | ByteBrief",
  },
  description:
    "A focused intelligence dashboard for technology and computer science news.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
