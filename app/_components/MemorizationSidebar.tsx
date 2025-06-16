"use client";

import { useMemorizationContext } from "@/app/_hooks/MemorizationProvider";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Surah } from "@/app/_hooks/useQuranData";

interface MemorizationSidebarProps {
  surahs: Surah[];
  selectedSurahId: string;
  onSelectSurah: (surahId: string) => void;
  onSelectLesson: (lessonId: number) => void;
  isMobile?: boolean;
}

export function MemorizationSidebar({
  surahs,
  selectedSurahId,
  onSelectSurah,
  onSelectLesson,
  isMobile = false,
}: MemorizationSidebarProps) {
  const {
    settings,
    stats,
    getLessonsForSurah,
    updateSettings,
    regenerateLessonsForSurah,
    calculateStats,
  } = useMemorizationContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [localVerseCount, setLocalVerseCount] = useState(
    settings.defaultVerseCount
  );

  // Get lessons for selected surah
  const lessons = getLessonsForSurah(selectedSurahId);

  // When selectedSurahId changes, update lessons and recalculate stats
  useEffect(() => {
    getLessonsForSurah(selectedSurahId);
    calculateStats();
  }, [selectedSurahId, getLessonsForSurah, calculateStats]);

  // Update local verse count when settings change
  useEffect(() => {
    setLocalVerseCount(settings.defaultVerseCount);
  }, [settings.defaultVerseCount]);

  // Filter surahs by search term
  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.titleAr.includes(searchTerm) ||
      surah.index.includes(searchTerm)
  );

  const handleSurahChange = (surahId: string) => {
    // Call the parent handler immediately
    onSelectSurah(surahId);

    // Ensure focus is removed from any select components
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleVersesPerLessonChange = (value: number[]) => {
    const newVerseCount = value[0];
    setLocalVerseCount(newVerseCount);

    // Update the global settings with the new verse count
    // This will trigger regeneration of all lessons
    updateSettings({ defaultVerseCount: newVerseCount });

    // Also regenerate the current surah lessons immediately for a responsive UI
    regenerateLessonsForSurah(selectedSurahId, newVerseCount);
  };

  // Get the current surah's stats
  const currentSurahStats = stats.perSurah[selectedSurahId] || {
    totalLessons: 0,
    completedLessons: 0,
    progress: 0,
    averageMastery: 0,
  };

  return (
    <div
      className={`border-l border-border h-full bg-card p-4 space-y-5 overflow-y-auto ${
        isMobile ? "pb-20" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">الحفظ والمراجعة</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={18} />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-3">
          <h4 className="font-medium">إعدادات الحفظ</h4>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                عدد الآيات في الدرس:
              </span>
              <span className="font-medium">
                {toArabicDigits(localVerseCount)}
              </span>
            </div>
            <Slider
              value={[localVerseCount]}
              min={1}
              max={15}
              step={1}
              onValueChange={handleVersesPerLessonChange}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                هدف المراجعة اليومي:
              </span>
              <span className="font-medium">
                {toArabicDigits(settings.dailyGoal)} دروس
              </span>
            </div>
            <Slider
              value={[settings.dailyGoal]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => updateSettings({ dailyGoal: value[0] })}
              dir="ltr"
            />
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div className="bg-primary/10 rounded-lg p-3 space-y-2">
        <h4 className="font-medium">إحصائيات السورة</h4>
        <div className="flex justify-between">
          <span className="text-sm">الدروس المكتملة:</span>
          <span className="font-medium">
            {toArabicDigits(currentSurahStats.completedLessons)}/
            {toArabicDigits(currentSurahStats.totalLessons)}
          </span>
        </div>
        <div className="mt-1 h-2 bg-muted rounded-full">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${currentSurahStats.progress}%` }}
          />
        </div>
        {currentSurahStats.completedLessons > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span>متوسط الإتقان:</span>
            <span className="font-medium">
              {toArabicDigits(currentSurahStats.averageMastery)}%
            </span>
          </div>
        )}
      </div>

      {/* Search and Surah Selection */}
      <div className="space-y-3">
        <Input
          placeholder="البحث عن سورة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />

        <Select value={selectedSurahId} onValueChange={handleSurahChange}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="اختر سورة" />
          </SelectTrigger>
          <SelectContent>
            {filteredSurahs.map((surah) => (
              <SelectItem key={surah.index} value={surah.index}>
                {surah.titleAr} ({toArabicDigits(parseInt(surah.index))})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lessons List */}
      <div className="space-y-2">
        <h4 className="font-medium">الدروس</h4>
        <div className={`space-y-1.5 mt-2 ${isMobile ? "pb-20" : ""}`}>
          {lessons.map((lesson) => (
            <Button
              key={lesson.lessonId}
              variant={lesson.completed ? "default" : "outline"}
              className="w-full justify-between group relative"
              onClick={() => onSelectLesson(lesson.lessonId)}
            >
              <span>
                الدرس {toArabicDigits(lesson.lessonId)}:{" "}
                {toArabicDigits(lesson.startVerse)}-
                {toArabicDigits(lesson.endVerse)}
              </span>
              {lesson.completed ? (
                <CheckCircle className="h-4 w-4 text-white" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
