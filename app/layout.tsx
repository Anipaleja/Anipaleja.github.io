import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { AnimatedNav } from "@/components/ui/AnimatedNav";
import { CursorDot } from "@/components/ui/CursorDot";
import { SiteFooter } from "@/components/ui/SiteFooter";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Anish Paleja",
  description:
    "Personal website of Anish Paleja, building at the intersection of AI, robotics, and infrastructure.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        <div className="flex min-h-screen flex-col">
          <CursorDot />
          <AnimatedNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
