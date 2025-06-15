import { Footer } from "@/app/_components/Footer";
import { Header } from "@/app/_components/Header";
import { ThemeProvider } from "@/app/_hooks/ThemeProvider";
import { MemorizationProvider } from "@/app/_hooks/MemorizationProvider";
import { QueryProvider } from "@/app/_hooks/QueryProvider";
import { QuranAudioProvider } from "@/app/_hooks/QuranAudioProvider";
import { QuranSettingsProvider } from "@/app/_hooks/QuranSettingsProvider";
import { ReadingModeProvider } from "@/app/_hooks/ReadingModeProvider";
import "@/app/globals.css";
import { Metadata } from "next";
import { Cairo, Lateef, Scheherazade_New } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
});

const lateef = Lateef({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-lateef",
});

const scheherazadeNew = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-scheherazade",
});

export const metadata: Metadata = {
  title: "القرآن الكريم - للقراءة والحفظ والمراجعة",
  description: "تطبيق لقراءة وحفظ ومراجعة القرآن الكريم",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "القرآن الكريم",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="القرآن الكريم" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${cairo.variable} ${lateef.variable} ${scheherazadeNew.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <ReadingModeProvider>
              <QuranSettingsProvider>
                <QuranAudioProvider>
                  <MemorizationProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                  </MemorizationProvider>
                </QuranAudioProvider>
              </QuranSettingsProvider>
            </ReadingModeProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
