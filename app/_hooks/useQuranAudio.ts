import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";

// Base API URL
const API_BASE_URL = "https://www.mp3quran.net/api/v3";

export type Reciter = {
  id: number;
  name: string;
  letter: string;
  moshaf: Array<{
    id: number;
    name: string;
    server: string;
    surah_total: number;
    moshaf_type: number;
    surah_list: string;
  }>;
};

export type RecitersResponse = {
  reciters: Reciter[];
};

// Type for parameters to fetch reciters
export type ReciterParams = {
  language?: string;
  reciter?: number;
  rewaya?: number;
  sura?: number;
  last_updated_date?: string;
};

// Fetch functions
const fetchReciters = async (
  params: ReciterParams = {}
): Promise<Reciter[]> => {
  const response = await axios.get<RecitersResponse>(
    `${API_BASE_URL}/reciters`,
    {
      params,
    }
  );
  return response.data.reciters;
};

/**
 * Hook to fetch reciters with optional filtering
 */
export function useReciters(params: ReciterParams = {}) {
  const {
    data: reciters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reciters", params],
    queryFn: () => fetchReciters(params),
  });

  return {
    reciters,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
  };
}

/**
 * Hook to fetch a specific reciter by ID
 */
export function useReciter(reciterId: number) {
  const {
    data: reciters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reciter", reciterId],
    queryFn: () => fetchReciters({ reciter: reciterId }),
    enabled: !!reciterId,
  });

  const reciter = reciters[0] || null;

  return {
    reciter,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
  };
}

/**
 * Helper function to check if a reciter has a specific surah
 */
export function hasSurah(reciter: Reciter, surahId: number): boolean {
  return reciter.moshaf.some((moshaf) => {
    const surahList = moshaf.surah_list.split(",").map(Number);
    return surahList.includes(surahId);
  });
}

/**
 * Helper function to get the audio URL for a specific surah
 */
export function getSurahAudioUrl(
  reciter: Reciter,
  surahId: number
): string | null {
  for (const moshaf of reciter.moshaf) {
    const surahList = moshaf.surah_list.split(",").map(Number);
    if (surahList.includes(surahId)) {
      // Format surahId with leading zeros (e.g., 1 -> 001)
      const formattedSurahId = surahId.toString().padStart(3, "0");
      return `${moshaf.server}${formattedSurahId}.mp3`;
    }
  }
  return null;
}

/**
 * Hook to get audio URL for a specific surah from a specific reciter
 */
export function useSurahAudio(reciterId: number, surahId: number) {
  const { reciter, status, error, isLoading } = useReciter(reciterId);

  const audioUrl = reciter ? getSurahAudioUrl(reciter, surahId) : null;

  return {
    audioUrl,
    reciter,
    status,
    error,
    isLoading,
  };
}

/**
 * Hook to fetch Arabic reciters that have a specific surah available
 */
export function useArabicRecitersForSurah(surahId: number) {
  const {
    data: reciters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reciters", "ar", surahId],
    queryFn: async () => {
      const response = await axios.get<RecitersResponse>(
        `${API_BASE_URL}/reciters`,
        {
          params: { language: "ar" },
        }
      );

      // Filter reciters to only include those who have this surah
      const filteredReciters = response.data.reciters.filter((reciter) =>
        hasSurah(reciter, surahId)
      );

      return filteredReciters;
    },
  });

  return {
    reciters,
    isLoading,
    isError,
    error: isError ? (error as Error).message || "An error occurred" : null,
  };
}

/**
 * Main hook for managing Quran audio with various options
 */
export function useQuranAudio() {
  // Get available languages (typically would be fetched from the API if available)
  const availableLanguages = [
    "ar",
    "eng",
    "fr",
    "ru",
    "de",
    "es",
    "tr",
    "cn",
    "th",
    "ur",
    "bn",
    "bs",
    "ug",
    "fa",
    "tg",
    "ml",
    "tl",
    "id",
    "pt",
    "ha",
    "sw",
  ];

  // Pre-configured query hooks
  const getRecitersByLanguage = (language: string) => {
    // Use the hook directly in the component
    return { useReciters: () => useReciters({ language }) };
  };

  const getRecitersBySurah = (surahId: number, language: string = "eng") => {
    return { useReciters: () => useReciters({ language, sura: surahId }) };
  };

  const getRecitersByRewaya = (rewayaId: number, language: string = "eng") => {
    return { useReciters: () => useReciters({ language, rewaya: rewayaId }) };
  };

  const getRecitersByRewayaAndSurah = (
    rewayaId: number,
    surahId: number,
    language: string = "eng"
  ) => {
    return {
      useReciters: () =>
        useReciters({ language, rewaya: rewayaId, sura: surahId }),
    };
  };

  return {
    availableLanguages,
    getRecitersByLanguage,
    getRecitersBySurah,
    getRecitersByRewaya,
    getRecitersByRewayaAndSurah,
    getSurahAudioUrl,
    hasSurah,
  };
}

// Create a hook for playing audio with basic controls
export function useAudioPlayer() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // Default volume to 100%

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    setAudioElement(audio);

    // Set up event listeners
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("loadstart", () => setIsLoading(true));
    audio.addEventListener("loadeddata", () => setIsLoading(false));
    audio.addEventListener("timeupdate", () =>
      setCurrentTime(audio.currentTime)
    );
    audio.addEventListener("durationchange", () => setDuration(audio.duration));

    return () => {
      // Clean up
      audio.pause();
      audio.src = "";

      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
      audio.removeEventListener("loadstart", () => setIsLoading(true));
      audio.removeEventListener("loadeddata", () => setIsLoading(false));
      audio.removeEventListener("timeupdate", () =>
        setCurrentTime(audio.currentTime)
      );
      audio.removeEventListener("durationchange", () =>
        setDuration(audio.duration)
      );
    };
  }, []);

  const play = useCallback(
    (url: string) => {
      if (audioElement) {
        if (audioElement.src !== url) {
          audioElement.src = url;
        }
        audioElement.play();
      }
    },
    [audioElement]
  );

  const pause = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
    }
  }, [audioElement]);

  const stop = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }, [audioElement]);

  const seek = useCallback(
    (time: number) => {
      if (audioElement) {
        audioElement.currentTime = time;
      }
    },
    [audioElement]
  );

  const setAudioVolume = useCallback(
    (newVolume: number) => {
      // Ensure volume is between 0 and 1
      const safeVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(safeVolume);

      if (audioElement) {
        audioElement.volume = safeVolume;
      }
    },
    [audioElement]
  );

  return {
    play,
    pause,
    stop,
    seek,
    setVolume: setAudioVolume,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
  };
}
