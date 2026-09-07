import type { Metadata } from "next";
import "./globals.css";
import SideNav from "@/components/layout/SideNav";

export const metadata: Metadata = {
  title: "AI Guardrails — Student Support Assistant",
  description: "Build, attack, and protect an AI student support assistant with layered guardrails.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-void bg-command-center min-h-screen">
        <div className="flex min-h-screen">
          <SideNav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
