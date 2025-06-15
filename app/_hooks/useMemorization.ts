import { AYAH_COUNTS_PER_SURAH_CONST } from "@/app/_constants/ayahCounts";
import {
  MemorizationLesson,
  MemorizationProgress,
  MemorizationSettings,
  loadMemorizationProgress,
  loadMemorizationSettings,
  saveMemorizationProgress,
  saveMemorizationSettings,
} from "@/app/_lib/localStorageUtils";
import { useCallback, useEffect, useState } from "react";

export interface SurahStats {
  totalLessons: number;
  completedLessons: number;
  progress: number;
  averageMastery: number;
}

export interface MemorizationStats {
  overall: {
    totalLessons: number;
    completedLessons: number;
    progress: number;
    averageMastery: number;
  };
  perSurah: Record<string, SurahStats>;
}

export function useMemorization() {
  const [settings, setSettings] = useState<MemorizationSettings>({
    defaultVerseCount: 5,
    dailyGoal: 1,
    reviewEnabled: true,
  });

  const [progress, setProgress] = useState<MemorizationProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<MemorizationStats>({
    overall: {
      totalLessons: 0,
      completedLessons: 0,
      progress: 0,
      averageMastery: 0,
    },
    perSurah: {},
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = loadMemorizationSettings();
      const savedProgress = loadMemorizationProgress();

      setSettings(savedSettings);
      setProgress(savedProgress);
      setIsLoading(false);

      // Calculate stats
      calculateStats(savedProgress);
    }
  }, []);

  // Calculate statistics from progress data
  const calculateStats = useCallback(
    (progressData?: MemorizationProgress) => {
      const dataToCalculate = progressData || progress;
      let overallTotalLessons = 0;
      let overallCompletedLessons = 0;
      let overallTotalMastery = 0;
      const perSurahStats: Record<string, SurahStats> = {};

      Object.entries(dataToCalculate).forEach(([surahId, surahLessons]) => {
        const surahTotalLessons = surahLessons.length;
        let surahCompletedLessons = 0;
        let surahTotalMastery = 0;

        surahLessons.forEach((lesson) => {
          if (lesson.completed) {
            surahCompletedLessons++;
            surahTotalMastery += lesson.mastery;
          }
        });

        // Calculate per-surah stats
        const surahAverageMastery =
          surahCompletedLessons > 0
            ? Math.round(surahTotalMastery / surahCompletedLessons)
            : 0;

        perSurahStats[surahId] = {
          totalLessons: surahTotalLessons,
          completedLessons: surahCompletedLessons,
          progress:
            surahTotalLessons > 0
              ? Math.round((surahCompletedLessons / surahTotalLessons) * 100)
              : 0,
          averageMastery: surahAverageMastery,
        };

        // Add to overall totals
        overallTotalLessons += surahTotalLessons;
        overallCompletedLessons += surahCompletedLessons;
        overallTotalMastery += surahTotalMastery;
      });

      // Calculate overall stats
      const overallAverageMastery =
        overallCompletedLessons > 0
          ? Math.round(overallTotalMastery / overallCompletedLessons)
          : 0;

      setStats({
        overall: {
          totalLessons: overallTotalLessons,
          completedLessons: overallCompletedLessons,
          progress:
            overallTotalLessons > 0
              ? Math.round(
                  (overallCompletedLessons / overallTotalLessons) * 100
                )
              : 0,
          averageMastery: overallAverageMastery,
        },
        perSurah: perSurahStats,
      });
    },
    [progress]
  );

  // Generate lessons for a surah based on verse count setting
  const generateLessonsForSurah = useCallback(
    (
      surahId: string,
      verseCount: number = settings.defaultVerseCount
    ): MemorizationLesson[] => {
      const numericSurahId = parseInt(surahId);
      const totalVerses = AYAH_COUNTS_PER_SURAH_CONST[numericSurahId - 1];
      const lessons: MemorizationLesson[] = [];

      // Create lessons dividing the surah into chunks of verseCount size
      let lessonId = 1;
      for (
        let startVerse = 1;
        startVerse <= totalVerses;
        startVerse += verseCount
      ) {
        const endVerse = Math.min(startVerse + verseCount - 1, totalVerses);

        lessons.push({
          surahId,
          lessonId,
          startVerse,
          endVerse,
          completed: false,
          mastery: 0,
        });

        lessonId++;
      }

      return lessons;
    },
    [settings.defaultVerseCount]
  );

  // Regenerate lessons for a specific surah with a new verse count
  // This preserves completion status of existing lessons where possible
  const regenerateLessonsForSurah = useCallback(
    (surahId: string, verseCount: number) => {
      setProgress((prev) => {
        const newProgress = { ...prev };
        const oldLessons = newProgress[surahId] || [];

        // Generate new lessons with the specified verse count
        const newLessons = generateLessonsForSurah(surahId, verseCount);

        // Try to preserve completion status from old lessons
        if (oldLessons.length > 0) {
          for (const newLesson of newLessons) {
            // Check if any old lesson overlaps with this new lesson
            for (const oldLesson of oldLessons) {
              // If the new lesson fully contains an old completed lesson
              if (
                oldLesson.completed &&
                newLesson.startVerse <= oldLesson.startVerse &&
                newLesson.endVerse >= oldLesson.endVerse
              ) {
                newLesson.completed = true;
                newLesson.completedDate = oldLesson.completedDate;
                newLesson.mastery = oldLesson.mastery;
                break;
              }
            }
          }
        }

        // Update the lessons for this surah
        newProgress[surahId] = newLessons;

        // Save to localStorage
        saveMemorizationProgress(newProgress);

        // Recalculate stats with the updated progress
        calculateStats(newProgress);

        return newProgress;
      });
    },
    [generateLessonsForSurah, calculateStats]
  );

  // Regenerate lessons for all surahs with the new verse count setting
  const regenerateAllLessons = useCallback(
    (verseCount: number) => {
      setProgress((prev) => {
        const newProgress = { ...prev };

        // Regenerate lessons for each surah
        Object.keys(newProgress).forEach((surahId) => {
          const oldLessons = newProgress[surahId];

          // Generate new lessons with the specified verse count
          const newLessons = generateLessonsForSurah(surahId, verseCount);

          // Try to preserve completion status from old lessons
          if (oldLessons && oldLessons.length > 0) {
            for (const newLesson of newLessons) {
              // Check if any old lesson overlaps with this new lesson
              for (const oldLesson of oldLessons) {
                // If the new lesson fully contains an old completed lesson
                if (
                  oldLesson.completed &&
                  newLesson.startVerse <= oldLesson.startVerse &&
                  newLesson.endVerse >= oldLesson.endVerse
                ) {
                  newLesson.completed = true;
                  newLesson.completedDate = oldLesson.completedDate;
                  newLesson.mastery = oldLesson.mastery;
                  break;
                }
              }
            }
          }

          // Update the lessons for this surah
          newProgress[surahId] = newLessons;
        });

        // Save to localStorage
        saveMemorizationProgress(newProgress);

        // Recalculate stats with the updated progress
        calculateStats(newProgress);

        return newProgress;
      });
    },
    [generateLessonsForSurah, calculateStats]
  );

  // Get or create lessons for a specific surah
  const getLessonsForSurah = useCallback(
    (surahId: string): MemorizationLesson[] => {
      // If we already have lessons for this surah, return them
      if (progress[surahId] && progress[surahId].length > 0) {
        return progress[surahId];
      }

      // Otherwise generate new lessons
      const newLessons = generateLessonsForSurah(surahId);

      // Save to state and localStorage
      setProgress((prev) => {
        const newProgress = {
          ...prev,
          [surahId]: newLessons,
        };

        saveMemorizationProgress(newProgress);
        // Update stats when adding new lessons
        calculateStats(newProgress);
        return newProgress;
      });

      return newLessons;
    },
    [progress, generateLessonsForSurah, calculateStats]
  );

  // Update memorization settings
  const updateSettings = useCallback(
    (newSettings: Partial<MemorizationSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        saveMemorizationSettings(updated);

        // If verse count has changed, regenerate all lessons with the new count
        if (
          newSettings.defaultVerseCount &&
          newSettings.defaultVerseCount !== prev.defaultVerseCount
        ) {
          regenerateAllLessons(newSettings.defaultVerseCount);
        }

        return updated;
      });
    },
    [regenerateAllLessons]
  );

  // Mark a lesson as complete
  const completeLesson = useCallback(
    (surahId: string, lessonId: number, mastery: number = 100) => {
      setProgress((prev) => {
        const newProgress = { ...prev };

        if (!newProgress[surahId]) {
          // This shouldn't happen as lessons should be initialized
          newProgress[surahId] = generateLessonsForSurah(surahId);
        }

        const lessonIndex = newProgress[surahId].findIndex(
          (l) => l.lessonId === lessonId
        );

        if (lessonIndex !== -1) {
          newProgress[surahId][lessonIndex] = {
            ...newProgress[surahId][lessonIndex],
            completed: true,
            completedDate: new Date().toISOString(),
            mastery,
          };
        }

        saveMemorizationProgress(newProgress);

        // Recalculate stats
        calculateStats(newProgress);

        return newProgress;
      });
    },
    [generateLessonsForSurah, calculateStats]
  );

  // Reset a lesson (mark as not completed)
  const resetLesson = useCallback(
    (surahId: string, lessonId: number) => {
      setProgress((prev) => {
        const newProgress = { ...prev };

        if (newProgress[surahId]) {
          const lessonIndex = newProgress[surahId].findIndex(
            (l) => l.lessonId === lessonId
          );

          if (lessonIndex !== -1) {
            newProgress[surahId][lessonIndex] = {
              ...newProgress[surahId][lessonIndex],
              completed: false,
              completedDate: undefined,
              mastery: 0,
            };
          }
        }

        saveMemorizationProgress(newProgress);

        // Recalculate stats
        calculateStats(newProgress);

        return newProgress;
      });
    },
    [calculateStats]
  );

  // Get lessons for daily review
  const getReviewLessons = useCallback((): MemorizationLesson[] => {
    const allLessons: MemorizationLesson[] = [];

    // Collect all completed lessons across all surahs
    Object.values(progress).forEach((surahLessons) => {
      surahLessons.forEach((lesson) => {
        if (lesson.completed) {
          allLessons.push(lesson);
        }
      });
    });

    // Sort lessons by completion date (oldest first) and mastery level (lowest first)
    allLessons.sort((a, b) => {
      // Prioritize by mastery level
      if (a.mastery !== b.mastery) {
        return a.mastery - b.mastery;
      }

      // If same mastery, sort by completion date
      if (a.completedDate && b.completedDate) {
        return (
          new Date(a.completedDate).getTime() -
          new Date(b.completedDate).getTime()
        );
      }

      return 0;
    });

    // Take top 5 lessons for review
    return allLessons.slice(0, 5);
  }, [progress]);

  return {
    settings,
    progress,
    stats,
    isLoading,
    getLessonsForSurah,
    completeLesson,
    resetLesson,
    updateSettings,
    getReviewLessons,
    regenerateLessonsForSurah,
    regenerateAllLessons,
    calculateStats,
  };
}
