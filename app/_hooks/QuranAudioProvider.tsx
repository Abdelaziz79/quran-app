"use client";

import {
  AudioEdition,
  Reciter,
  useAudioPlayer,
  useQuranAudio,
} from "@/app/_hooks/useQuranAudio";
import {
  loadIsVerseByVerseMode,
  loadRepeatCount,
  loadSelectedReciter,
  loadVerseByVerseEdition,
  saveIsVerseByVerseMode,
  saveRepeatCount,
  saveSelectedReciter,
  saveVerseByVerseEdition,
  StoredAudioEdition,
  StoredReciter,
} from "@/app/_lib/localStorageUtils";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAudioEditionVerseByVerse } from "./AlQuranApi";

// Base API URL
const API_BASE_URL = "https://www.mp3quran.net/api/v3";

// Create a context type that combines both hooks
type QuranAudioContextType = ReturnType<typeof useQuranAudio> & {
  audioPlayer: ReturnType<typeof useAudioPlayer>;
  selectedReciter: Reciter | null;
  setSelectedReciter: (reciter: Reciter | null) => void;
  selectedAudioEdition: AudioEdition | null;
  setSelectedAudioEdition: (edition: AudioEdition | null) => void;
  isVerseByVerseMode: boolean;
  setIsVerseByVerseMode: (isVerseByVerse: boolean) => void;
  currentVerse: number | null;
  setCurrentVerse: (verse: number | null) => void;
  verseAudioUrls: string[];
  setVerseAudioUrls: (urls: string[]) => void;
  playNextVerse: () => void;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  isInitialPreferencesLoading: boolean;
  currentSurah: number | null;
  setCurrentSurah: (surah: number | null) => void;
};

// Create context with a default undefined value
const QuranAudioContext = createContext<QuranAudioContextType | undefined>(
  undefined
);

// Provider component
export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const quranAudio = useQuranAudio();
  const audioPlayer = useAudioPlayer();

  // Add state for selected reciter
  const [selectedReciter, setSelectedReciterState] = useState<Reciter | null>(
    null
  );

  // Add state for verse-by-verse audio
  const [selectedAudioEdition, setSelectedAudioEditionState] =
    useState<AudioEdition | null>(null);
  const [isVerseByVerseMode, setIsVerseByVerseModeState] =
    useState<boolean>(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [verseAudioUrls, setVerseAudioUrls] = useState<string[]>([]);
  const [repeatCount, setRepeatCountState] = useState<number>(1);
  const [isInitialPreferencesLoading, setIsInitialPreferencesLoading] =
    useState<boolean>(true);
  const [currentSurah, setCurrentSurahState] = useState<number | null>(null);

  // Load settings from local storage on initial mount
  useEffect(() => {
    setIsInitialPreferencesLoading(true);

    const loadAllPreferences = async () => {
      // Load synchronous settings first
      const savedIsVerseByVerseMode = loadIsVerseByVerseMode();
      setIsVerseByVerseModeState(savedIsVerseByVerseMode);
      const savedRepeatCount = loadRepeatCount();
      setRepeatCountState(savedRepeatCount);

      // Attempt to load selected reciter (async part)
      const reciterLoadPromise = new Promise<void>((resolve) => {
        const savedReciter = loadSelectedReciter();
        if (savedReciter && savedReciter.id) {
          axios
            .get(`${API_BASE_URL}/reciters`, {
              params: { reciter: savedReciter.id },
            })
            .then((response) => {
              if (response.data.reciters && response.data.reciters.length > 0) {
                setSelectedReciterState(response.data.reciters[0]);
              } else {
                console.warn(
                  `Reciter with ID ${savedReciter.id} not found via API.`
                );
              }
            })
            .catch((error) => {
              console.error("Error fetching full reciter data:", error);
            })
            .finally(() => {
              resolve();
            });
        } else {
          resolve(); // No saved reciter or no ID
        }
      });

      // Attempt to load selected audio edition (synchronous part after localStorage read)
      const editionLoadPromise = new Promise<void>((resolve) => {
        const savedEdition = loadVerseByVerseEdition();
        if (savedEdition && savedEdition.identifier) {
          const editions = getAudioEditionVerseByVerse();
          const fullEdition = editions.find(
            (e) => e.identifier === savedEdition.identifier
          );
          if (fullEdition) {
            setSelectedAudioEditionState(fullEdition);
          } else {
            console.warn(
              `Audio edition with identifier '${savedEdition.identifier}' not found in available editions.`
            );
          }
        }
        resolve(); // Done with edition attempt
      });

      // Wait for both attempts to complete
      await Promise.all([reciterLoadPromise, editionLoadPromise]);

      setIsInitialPreferencesLoading(false);
    };

    loadAllPreferences();
  }, []);

  // Wrapped setter functions that also update local storage
  const setSelectedReciter = (reciter: Reciter | null) => {
    setSelectedReciterState(reciter);

    // Save minimal info to local storage
    if (reciter) {
      const storedReciter: StoredReciter = {
        id: reciter.id,
        name: reciter.name,
      };
      saveSelectedReciter(storedReciter);
    } else {
      saveSelectedReciter(null);
    }
  };

  const setSelectedAudioEdition = (edition: AudioEdition | null) => {
    setSelectedAudioEditionState(edition);

    // Save minimal info to local storage
    if (edition) {
      const storedEdition: StoredAudioEdition = {
        identifier: edition.identifier,
        name: edition.name,
      };
      saveVerseByVerseEdition(storedEdition);
    } else {
      saveVerseByVerseEdition(null);
    }
  };

  const setIsVerseByVerseMode = (isVerseByVerse: boolean) => {
    setIsVerseByVerseModeState(isVerseByVerse);
    saveIsVerseByVerseMode(isVerseByVerse);
  };

  const setRepeatCount = (count: number) => {
    setRepeatCountState(count);
    saveRepeatCount(count);
  };

  const setCurrentSurah = (surah: number | null) => {
    setCurrentSurahState(surah);
  };

  // Function to play the next verse
  const playNextVerse = () => {
    if (currentVerse !== null && verseAudioUrls.length > 0) {
      const nextVerseIndex = currentVerse;

      if (nextVerseIndex <= verseAudioUrls.length) {
        setCurrentVerse(nextVerseIndex + 1);
        setTimeout(() => {
          audioPlayer.play(verseAudioUrls[nextVerseIndex]);
        }, 800); // Longer delay for better user experience
      }
    }
  };

  // Combine all values to provide through context
  const contextValue: QuranAudioContextType = {
    ...quranAudio,
    audioPlayer,
    selectedReciter,
    setSelectedReciter,
    selectedAudioEdition,
    setSelectedAudioEdition,
    isVerseByVerseMode,
    setIsVerseByVerseMode,
    currentVerse,
    setCurrentVerse,
    verseAudioUrls,
    setVerseAudioUrls,
    playNextVerse,
    repeatCount,
    setRepeatCount,
    isInitialPreferencesLoading,
    currentSurah,
    setCurrentSurah,
  };

  return (
    <QuranAudioContext.Provider value={contextValue}>
      {children}
    </QuranAudioContext.Provider>
  );
}

// Custom hook to use the audio context
export function useQuranAudioContext() {
  const context = useContext(QuranAudioContext);

  if (context === undefined) {
    throw new Error(
      "useQuranAudioContext must be used within a QuranAudioProvider"
    );
  }

  return context;
}
