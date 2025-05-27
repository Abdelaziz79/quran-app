"use client";

import {
  Reciter,
  useAudioPlayer,
  useQuranAudio,
} from "@/app/_hooks/useQuranAudio";
import { ReactNode, createContext, useContext, useState } from "react";

// Create a context type that combines both hooks
type QuranAudioContextType = ReturnType<typeof useQuranAudio> & {
  audioPlayer: ReturnType<typeof useAudioPlayer>;
  selectedReciter: Reciter | null;
  setSelectedReciter: (reciter: Reciter | null) => void;
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
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);

  // Combine all values to provide through context
  const contextValue: QuranAudioContextType = {
    ...quranAudio,
    audioPlayer,
    selectedReciter,
    setSelectedReciter,
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
