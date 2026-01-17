import type { Metadata } from "next";
import "./globals.css";
import { ProblemProvider } from "@/lib/problem-context";

export const metadata: Metadata = {
  title: "Socratic Whiteboard",
  description: "AI-powered math tutoring workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ProblemProvider>{children}</ProblemProvider>
      </body>
    </html>
  );
}
