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
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap w-full bg-card rounded-lg">
        <button
          onClick={() => setActiveTab("font")}
          className={`flex items-center justify-center gap-2 flex-1 p-3 rounded-lg ${
            activeTab === "font"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <Book className="h-4 w-4" />
          خط المصحف
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center justify-center gap-2 flex-1 p-3 rounded-lg ${
            activeTab === "audio"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <Volume2 className="h-4 w-4" />
          الصوت والتلاوة
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center justify-center gap-2 flex-1 p-3 rounded-lg ${
            activeTab === "preferences"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/50"
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          إعدادات عامة
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "font" && (
          <Card>
            <CardContent className="pt-6">
              <QuranSettingsProvider>
                <FontSettingsSection />
              </QuranSettingsProvider>
            </CardContent>
          </Card>
        )}

        {activeTab === "audio" && (
          <Card>
            <CardContent className="pt-6">
              <QuranAudioProvider>
                <AudioSettingsSection />
              </QuranAudioProvider>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <Card>
            <CardContent className="pt-6">
              <PreferencesSection />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
