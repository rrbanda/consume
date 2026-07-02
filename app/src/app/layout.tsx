import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { NotificationBell } from "@/components/notification-bell";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const redHatText = Red_Hat_Text({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paperclip Console",
  description: "AI agent control plane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${redHatDisplay.variable} ${redHatText.variable} h-full`}
    >
      <body
        className="h-full bg-[#151515] text-white antialiased"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Sidebar />

        {/* Main content area */}
        <div className="lg:pl-60">
          {/* Top header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#151515]/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ee0000]">
                <span className="text-sm font-bold text-white">P</span>
              </div>
            </div>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
              <NotificationBell count={3} />
              <div className="h-8 w-8 rounded-full bg-[#292929] flex items-center justify-center text-xs font-semibold text-gray-300">
                RB
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
