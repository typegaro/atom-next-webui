import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atom",
  description: "Atom AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Syntax highlighting stylesheet (Atom One Dark) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
        />
      </head>
      <body className="flex h-screen bg-surface text-text antialiased">
        {children}
      </body>
    </html>
  );
}
