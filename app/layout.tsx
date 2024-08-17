import type { Metadata } from "next";
import { Roboto_Mono, Sixtyfour } from "next/font/google";
import "./globals.css";

const roboto = Sixtyfour({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Metronome",
  description: "100% Royalty free generative music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
