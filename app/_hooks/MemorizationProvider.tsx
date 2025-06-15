"use client";

import {
  MemorizationStats,
  useMemorization,
} from "@/app/_hooks/useMemorization";
import {
  MemorizationLesson,
  MemorizationProgress,
  MemorizationSettings,
} from "@/app/_lib/localStorageUtils";
import { ReactNode, createContext, useContext } from "react";

// Create context type
type MemorizationContextType = {
  settings: MemorizationSettings;
  progress: MemorizationProgress;
  stats: MemorizationStats;
  isLoading: boolean;
  getLessonsForSurah: (surahId: string) => MemorizationLesson[];
  completeLesson: (surahId: string, lessonId: number, mastery?: number) => void;
  resetLesson: (surahId: string, lessonId: number) => void;
  updateSettings: (newSettings: Partial<MemorizationSettings>) => void;
  getReviewLessons: () => MemorizationLesson[];
  regenerateLessonsForSurah: (surahId: string, verseCount: number) => void;
  regenerateAllLessons: (verseCount: number) => void;
  calculateStats: (progressData?: MemorizationProgress) => void;
};

// Create context with a default value
const MemorizationContext = createContext<MemorizationContextType | null>(null);

// Provider component
export function MemorizationProvider({ children }: { children: ReactNode }) {
  const memorizationValues = useMemorization();

  return (
    <MemorizationContext.Provider value={memorizationValues}>
      {children}
    </MemorizationContext.Provider>
  );
}

// Hook for using the memorization context
export function useMemorizationContext() {
  const context = useContext(MemorizationContext);

  if (!context) {
    throw new Error(
      "useMemorizationContext must be used within a MemorizationProvider"
    );
  }

  return context;
}
