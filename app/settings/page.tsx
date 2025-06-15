"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Book, SettingsIcon, Volume2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import FontSettingsSection from "./_components/FontSettingsSection";
import AudioSettingsSection from "./_components/AudioSettingsSection";
import PreferencesSection from "./_components/PreferencesSection";
import { QuranSettingsProvider } from "@/app/_hooks/QuranSettingsProvider";
import { QuranAudioProvider } from "@/app/_hooks/QuranAudioProvider";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("font");

  return (
    <div
      className="container mx-auto py-4 md:py-8 px-3 md:px-4 max-w-4xl"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">الإعدادات</h1>
        <Link
          href="/"
          className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center sm:justify-start w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>

      <div className="mb-4 md:mb-6 flex flex-wrap w-full bg-card rounded-lg overflow-hidden">
        <button
          onClick={() => setActiveTab("font")}
          className={`flex items-center justify-center gap-1 md:gap-2 flex-1 p-2 md:p-3 text-sm md:text-base ${
            activeTab === "font"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <Book className="h-3.5 w-3.5 md:h-4 md:w-4" />
          خط المصحف
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center justify-center gap-1 md:gap-2 flex-1 p-2 md:p-3 text-sm md:text-base ${
            activeTab === "audio"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          الصوت والتلاوة
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center justify-center gap-1 md:gap-2 flex-1 p-2 md:p-3 text-sm md:text-base ${
            activeTab === "preferences"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <SettingsIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
          إعدادات عامة
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "font" && (
          <Card>
            <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
              <QuranSettingsProvider>
                <FontSettingsSection />
              </QuranSettingsProvider>
            </CardContent>
          </Card>
        )}

        {activeTab === "audio" && (
          <Card>
            <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
              <QuranAudioProvider>
                <AudioSettingsSection />
              </QuranAudioProvider>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <Card>
            <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
              <PreferencesSection />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
