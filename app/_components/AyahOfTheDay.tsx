"use client";

import { useRandomAyah } from "@/app/_hooks/useQuranData";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { AyahVerse } from "@/app/_components/AyahVerse";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/app/_components/Loading";
import ErrorComp from "@/app/_components/ErrorComp";
import { useTheme } from "@/app/_hooks/useTheme";

export function AyahOfTheDay() {
  const { ayahData, isLoading, error, refresh } = useRandomAyah();
  const [showTranslation, setShowTranslation] = useState(true);
  const { theme } = useTheme();

  // Track if component is mounted to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render during SSR to avoid hydration mismatch
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 mb-12">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">آية اليوم</h2>
          <p className="text-muted-foreground">Ayah of the Day</p>
        </div>
        <div className="flex justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !ayahData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 mb-12">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">آية اليوم</h2>
          <p className="text-muted-foreground">Ayah of the Day</p>
        </div>
        <ErrorComp error={error || "Failed to load ayah"} />
        <div className="flex justify-center mt-4">
          <Button
            onClick={refresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            <span>تحديث</span>
          </Button>
        </div>
      </div>
    );
  }

  const verse = {
    id: ayahData.ayahId,
    text: ayahData.ayahText,
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12 px-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">آية اليوم</h2>
        <p className="text-muted-foreground">Ayah of the Day</p>
      </div>

      <div className="mb-6 bg-card shadow-md rounded-lg border overflow-hidden">
        <div className="bg-primary/10 p-4 text-center">
          <Link
            href={`/surah/${ayahData.surahId}?ayah=${ayahData.ayahId}`}
            className="text-xl font-semibold text-primary hover:underline"
          >
            {ayahData.surahName} ({toArabicDigits(parseInt(ayahData.surahId))}:
            {toArabicDigits(ayahData.ayahId)})
          </Link>
          <p className="text-sm text-muted-foreground">
            {ayahData.surahNameEn}
          </p>
        </div>

        <div className="p-2">
          <AyahVerse
            verse={verse}
            translationText={ayahData.translationText}
            showTranslation={showTranslation}
            isActive={false}
            isBookmarked={false}
            isHighlightedBookmark={false}
            readingMode={false}
            theme={theme}
            isCopied={false}
            dropdownOpen={false}
            onVerseClick={() => {}}
            onCopy={() => {}}
            onToggleBookmark={() => {}}
            onShare={() => {}}
            onRecite={() => {}}
            onDropdownToggle={() => {}}
            setVerseRef={() => {}}
            showOptions={false}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => setShowTranslation(!showTranslation)}
          variant="outline"
          className="px-6"
        >
          {showTranslation ? "إخفاء التفسير" : "إظهار التفسير"}
        </Button>
        <Button
          onClick={refresh}
          variant="secondary"
          className="flex items-center gap-2 px-6"
        >
          <RefreshCw size={16} />
          <span>آية أخرى</span>
        </Button>
        <Link href={`/surah/${ayahData.surahId}?ayah=${ayahData.ayahId}`}>
          <Button variant="default" className="px-6">
            اقرأ السورة
          </Button>
        </Link>
      </div>
    </div>
  );
}
