import type { Metadata } from "next";
import "./globals.css";
import { ProblemProvider } from "@/lib/problem-context";

export const metadata: Metadata = {
  title: "Socratical",
  description: "Philosophize your toughest subjects",
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
