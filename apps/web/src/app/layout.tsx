import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { AuthLayoutWrapper } from "@/components/auth-layout-wrapper";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Homefixu",
  description: "Premium home maintenance and smart services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Pass null to satisfy TypeScript without rendering a header */}
          <AuthLayoutWrapper header={null}>{children}</AuthLayoutWrapper>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
