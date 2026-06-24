// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toast";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-ink font-body">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
