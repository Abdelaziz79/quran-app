import { Footer } from "@/app/_components/Footer";
import { Header } from "@/app/_components/Header";
import { QueryProvider } from "@/app/_hooks/QueryProvider";
import { QuranAudioProvider } from "@/app/_hooks/QuranAudioProvider";
import { QuranSettingsProvider } from "@/app/_hooks/QuranSettingsProvider";
import { ReadingModeProvider } from "@/app/_hooks/ReadingModeProvider";
import { ThemeProvider } from "@/app/_hooks/ThemeProvider";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Cairo, Lateef, Scheherazade_New } from "next/font/google";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const lateef = Lateef({
  variable: "--font-lateef",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const scheherazadeNew = Scheherazade_New({
  variable: "--font-scheherazade-new",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "القرآن الكريم | الموقع الرسمي للقرآن الكريم",
  description: "موقع القرآن الكريم مع التفسير",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${lateef.variable} ${scheherazadeNew.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <ReadingModeProvider>
              <QuranSettingsProvider>
                <QuranAudioProvider>
                  <div className="main-layout flex flex-col min-h-screen">
                    <Header />
                    <main className="main-content flex-1 flex flex-col items-center w-full">
                      <div className="w-full max-w-7xl mx-auto px-4 pb-24">
                        {children}
                      </div>
                    </main>
                    <Footer />
                  </div>
                </QuranAudioProvider>
              </QuranSettingsProvider>
            </ReadingModeProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
