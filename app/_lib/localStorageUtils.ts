// Keys for local storage
const KEYS = {
  SELECTED_RECITER: "quran-app-selected-reciter",
  VERSE_BY_VERSE_EDITION: "quran-app-verse-by-verse-edition",
  IS_VERSE_BY_VERSE_MODE: "quran-app-is-verse-by-verse-mode",
  AUDIO_VOLUME: "quran-app-audio-volume",
  REPEAT_COUNT: "quran-app-repeat-count",
  REPEAT_RANGE: "quran-app-repeat-range",
  // New keys for font settings
  QURAN_FONT_FAMILY: "quran-app-font-family",
  QURAN_FONT_SIZE: "quran-app-font-size",
  QURAN_LINE_HEIGHT: "quran-app-line-height",
  // New key for auto-play next verse
  AUTO_PLAY_NEXT: "quran-app-auto-play-next",
  // New keys for preferences
  SHOW_TRANSLATION: "quran-app-show-translation",
  SAVE_READING_POSITION: "quran-app-save-reading-position",
  LAST_READ_SURAH: "quran-app-last-read-surah",
  LAST_READ_VERSE: "quran-app-last-read-verse",
  // New keys for memorization
  MEMORIZATION_PROGRESS: "quran-app-memorization-progress",
  MEMORIZATION_SETTINGS: "quran-app-memorization-settings",
};

// Type definitions for stored data
export type StoredReciter = {
  id: number;
  name: string;
};

export type StoredAudioEdition = {
  identifier: string;
  name: string;
};

export type RepeatRange = {
  startVerse: number | null;
  endVerse: number | null;
  isActive: boolean;
};

// Font settings types
export type QuranFontFamily =
  | "KFGQPC"
  | "Lateef"
  | "Scheherazade-New"
  | "Uthmani";
export type QuranFontSize = "small" | "medium" | "large" | "x-large";
export type QuranLineHeight = "compact" | "normal" | "relaxed" | "loose";

// Memorization types
export type MemorizationLesson = {
  surahId: string;
  lessonId: number;
  startVerse: number;
  endVerse: number;
  completed: boolean;
  completedDate?: string;
  mastery: number; // 0-100 percentage indicating mastery level
};

export type MemorizationProgress = {
  [surahId: string]: MemorizationLesson[];
};

export type MemorizationSettings = {
  defaultVerseCount: number;
  dailyGoal: number;
  reviewEnabled: boolean;
  lastReviewDate?: string;
};

// Save selected reciter (full surah mode)
export const saveSelectedReciter = (reciter: StoredReciter | null): void => {
  if (typeof window === "undefined") return;

  if (reciter) {
    localStorage.setItem(KEYS.SELECTED_RECITER, JSON.stringify(reciter));
  } else {
    localStorage.removeItem(KEYS.SELECTED_RECITER);
  }
};

// Load selected reciter (full surah mode)
export const loadSelectedReciter = (): StoredReciter | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(KEYS.SELECTED_RECITER);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredReciter;
  } catch (error) {
    console.error("Error loading selected reciter from local storage:", error);
    return null;
  }
};

// Save verse-by-verse edition
export const saveVerseByVerseEdition = (
  edition: StoredAudioEdition | null
): void => {
  if (typeof window === "undefined") return;

  if (edition) {
    localStorage.setItem(KEYS.VERSE_BY_VERSE_EDITION, JSON.stringify(edition));
  } else {
    localStorage.removeItem(KEYS.VERSE_BY_VERSE_EDITION);
  }
};

// Load verse-by-verse edition
export const loadVerseByVerseEdition = (): StoredAudioEdition | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(KEYS.VERSE_BY_VERSE_EDITION);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredAudioEdition;
  } catch (error) {
    console.error(
      "Error loading verse-by-verse edition from local storage:",
      error
    );
    return null;
  }
};

// Save verse-by-verse mode state
export const saveIsVerseByVerseMode = (isVerseByVerseMode: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.IS_VERSE_BY_VERSE_MODE, String(isVerseByVerseMode));
};

// Load verse-by-verse mode state
export const loadIsVerseByVerseMode = (): boolean => {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(KEYS.IS_VERSE_BY_VERSE_MODE);
  return stored === "true";
};

// Save audio volume
export const saveAudioVolume = (volume: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.AUDIO_VOLUME, String(volume));
};

// Load audio volume
export const loadAudioVolume = (): number => {
  if (typeof window === "undefined") return 100;

  const stored = localStorage.getItem(KEYS.AUDIO_VOLUME);
  if (!stored) return 100;

  const volume = Number(stored);
  return isNaN(volume) ? 100 : volume;
};

// Save auto-play next verse setting
export const saveAutoPlayNext = (autoPlay: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.AUTO_PLAY_NEXT, String(autoPlay));
};

// Load auto-play next verse setting
export const loadAutoPlayNext = (): boolean => {
  if (typeof window === "undefined") return true;

  const stored = localStorage.getItem(KEYS.AUTO_PLAY_NEXT);
  return stored === null ? true : stored === "true";
};

// Save repeat count
export const saveRepeatCount = (count: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.REPEAT_COUNT, String(count));
};

// Load repeat count
export const loadRepeatCount = (): number => {
  if (typeof window === "undefined") return 1;

  const stored = localStorage.getItem(KEYS.REPEAT_COUNT);
  if (!stored) return 1;

  const count = Number(stored);
  return isNaN(count) ? 1 : count;
};

// Save repeat range settings
export const saveRepeatRange = (range: RepeatRange): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.REPEAT_RANGE, JSON.stringify(range));
};

// Load repeat range settings
export const loadRepeatRange = (): RepeatRange | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(KEYS.REPEAT_RANGE);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as RepeatRange;
  } catch (error) {
    console.error("Error loading repeat range from local storage:", error);
    return null;
  }
};

// New functions for font settings

// Save Quran font family
export const saveQuranFontFamily = (fontFamily: QuranFontFamily): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.QURAN_FONT_FAMILY, fontFamily);
};

// Load Quran font family
export const loadQuranFontFamily = (): QuranFontFamily => {
  if (typeof window === "undefined") return "KFGQPC";

  const stored = localStorage.getItem(
    KEYS.QURAN_FONT_FAMILY
  ) as QuranFontFamily | null;
  return stored || "KFGQPC"; // Default to KFGQPC
};

// Save Quran font size
export const saveQuranFontSize = (fontSize: QuranFontSize): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.QURAN_FONT_SIZE, fontSize);
};

// Load Quran font size
export const loadQuranFontSize = (): QuranFontSize => {
  if (typeof window === "undefined") return "medium";

  const stored = localStorage.getItem(
    KEYS.QURAN_FONT_SIZE
  ) as QuranFontSize | null;
  return stored || "medium"; // Default to medium
};

// Save Quran line height
export const saveQuranLineHeight = (lineHeight: QuranLineHeight): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.QURAN_LINE_HEIGHT, lineHeight);
};

// Load Quran line height
export const loadQuranLineHeight = (): QuranLineHeight => {
  if (typeof window === "undefined") return "normal";

  const stored = localStorage.getItem(
    KEYS.QURAN_LINE_HEIGHT
  ) as QuranLineHeight | null;
  return stored || "normal"; // Default to normal
};

// New functions for translation and reading position preferences

// Save show translation preference
export const saveShowTranslation = (showTranslation: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.SHOW_TRANSLATION, String(showTranslation));
};

// Load show translation preference
export const loadShowTranslation = (): boolean => {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem(KEYS.SHOW_TRANSLATION);
  return stored === "true";
};

// Save save-reading-position preference
export const saveSaveReadingPosition = (savePosition: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.SAVE_READING_POSITION, String(savePosition));
};

// Load save-reading-position preference
export const loadSaveReadingPosition = (): boolean => {
  if (typeof window === "undefined") return true;

  const stored = localStorage.getItem(KEYS.SAVE_READING_POSITION);
  return stored === null ? true : stored === "true";
};

// Save last reading position
export const saveLastReadPosition = (
  surahId: string,
  verseId: number
): void => {
  if (typeof window === "undefined") return;

  // Only save if the feature is enabled
  if (loadSaveReadingPosition()) {
    localStorage.setItem(KEYS.LAST_READ_SURAH, surahId);
    localStorage.setItem(KEYS.LAST_READ_VERSE, String(verseId));
  }
};

// Load last reading position
export const loadLastReadPosition = (): {
  surahId: string | null;
  verseId: number | null;
} => {
  if (typeof window === "undefined") return { surahId: null, verseId: null };

  // Only return if feature is enabled
  if (!loadSaveReadingPosition()) {
    return { surahId: null, verseId: null };
  }

  const surahId = localStorage.getItem(KEYS.LAST_READ_SURAH);
  const verseIdStr = localStorage.getItem(KEYS.LAST_READ_VERSE);
  const verseId = verseIdStr ? parseInt(verseIdStr) : null;

  return { surahId, verseId };
};

// Function to get/save the daily ayah
export function getDailyAyahSelection(): {
  surahId: string;
  ayahId: number;
  date: string;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const savedSelection = localStorage.getItem("dailyAyah");
    if (!savedSelection) return null;

    const parsedSelection = JSON.parse(savedSelection);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Check if the saved ayah is from today
    if (parsedSelection.date === today) {
      return parsedSelection;
    }

    return null; // Return null if the saved ayah is not from today
  } catch (error) {
    console.error("Error retrieving daily ayah from localStorage:", error);
    return null;
  }
}

export function saveDailyAyahSelection(surahId: string, ayahId: number): void {
  if (typeof window === "undefined") return;

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const selection = {
      surahId,
      ayahId,
      date: today,
    };

    localStorage.setItem("dailyAyah", JSON.stringify(selection));
  } catch (error) {
    console.error("Error saving daily ayah to localStorage:", error);
  }
}

// Load memorization settings
export const loadMemorizationSettings = (): MemorizationSettings => {
  if (typeof window === "undefined")
    return { defaultVerseCount: 5, dailyGoal: 1, reviewEnabled: true };

  try {
    const savedSettings = localStorage.getItem(KEYS.MEMORIZATION_SETTINGS);
    if (savedSettings) {
      return JSON.parse(savedSettings) as MemorizationSettings;
    }
  } catch (error) {
    console.error("Error loading memorization settings:", error);
  }

  // Default settings
  return { defaultVerseCount: 5, dailyGoal: 1, reviewEnabled: true };
};

// Save memorization settings
export const saveMemorizationSettings = (
  settings: MemorizationSettings
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(KEYS.MEMORIZATION_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving memorization settings:", error);
  }
};

// Load memorization progress
export const loadMemorizationProgress = (): MemorizationProgress => {
  if (typeof window === "undefined") return {};

  try {
    const savedProgress = localStorage.getItem(KEYS.MEMORIZATION_PROGRESS);
    if (savedProgress) {
      return JSON.parse(savedProgress) as MemorizationProgress;
    }
  } catch (error) {
    console.error("Error loading memorization progress:", error);
  }

  return {};
};

// Save memorization progress
export const saveMemorizationProgress = (
  progress: MemorizationProgress
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(KEYS.MEMORIZATION_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving memorization progress:", error);
  }
};

// Save completed lesson
export const completeMemorizationLesson = (
  surahId: string,
  lessonId: number,
  mastery: number = 100
): void => {
  if (typeof window === "undefined") return;

  const progress = loadMemorizationProgress();

  // Initialize surah if it doesn't exist
  if (!progress[surahId]) {
    progress[surahId] = [];
  }

  // Find the lesson
  const lessonIndex = progress[surahId].findIndex(
    (l) => l.lessonId === lessonId
  );

  if (lessonIndex !== -1) {
    // Update existing lesson
    progress[surahId][lessonIndex].completed = true;
    progress[surahId][lessonIndex].completedDate = new Date().toISOString();
    progress[surahId][lessonIndex].mastery = mastery;
  } else {
    // This shouldn't happen if lessons are properly initialized
    console.warn(
      `Lesson ${lessonId} for Surah ${surahId} not found in progress`
    );
  }

  saveMemorizationProgress(progress);
};

// Get memorization stats
export const getMemorizationStats = () => {
  const progress = loadMemorizationProgress();
  let totalLessons = 0;
  let completedLessons = 0;
  let totalMastery = 0;

  Object.values(progress).forEach((surahLessons) => {
    totalLessons += surahLessons.length;
    surahLessons.forEach((lesson) => {
      if (lesson.completed) {
        completedLessons++;
        totalMastery += lesson.mastery;
      }
    });
  });

  const averageMastery =
    completedLessons > 0 ? Math.round(totalMastery / completedLessons) : 0;

  return {
    totalLessons,
    completedLessons,
    progress:
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
    averageMastery,
  };
};
