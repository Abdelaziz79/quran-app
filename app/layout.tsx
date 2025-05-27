import { Footer } from "@/app/_components/Footer";
import { Header } from "@/app/_components/Header";
import { QueryProvider } from "@/app/_hooks/QueryProvider";
import { QuranAudioProvider } from "@/app/_hooks/QuranAudioProvider";
import { ReadingModeProvider } from "@/app/_hooks/ReadingModeProvider";
import { ThemeProvider } from "@/app/_hooks/ThemeProvider";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
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
      <body className={`${cairo.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            <ReadingModeProvider>
              <QuranAudioProvider>
                <div className="main-layout flex flex-col min-h-screen">
                  <Header />
                  <main className="main-content flex-1 flex flex-col items-center w-full">
                    <div className="w-full max-w-7xl mx-auto px-4">
                      {children}
                    </div>
                  </main>
                  <Footer />
                </div>
              </QuranAudioProvider>
            </ReadingModeProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
