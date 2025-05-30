// Keys for local storage
const KEYS = {
  SELECTED_RECITER: "quran-app-selected-reciter",
  VERSE_BY_VERSE_EDITION: "quran-app-verse-by-verse-edition",
  IS_VERSE_BY_VERSE_MODE: "quran-app-is-verse-by-verse-mode",
  AUDIO_VOLUME: "quran-app-audio-volume",
  REPEAT_COUNT: "quran-app-repeat-count",
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
