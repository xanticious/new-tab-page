import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "New Tab Page",
  description: "New Tab Page for your browser",
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
