import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";

export type Surah = {
  index: string;
  title: string;
  titleAr: string;
  count: number;
  place: string;
  type: string;
};

export type SurahMetadata = Surah[];

export type SurahDetail = {
  index: string;
  name: string;
  verse: Record<string, string>;
  count: number;
  juz: Array<{
    index: string;
    verse: {
      start: string;
      end: string;
    };
  }>;
};

export type Translation = {
  index: number;
  verse: Record<string, string>;
  count: number;
};

// Fetch functions (separate from hooks for better reuse)
const fetchSurahList = async (): Promise<SurahMetadata> => {
  const response = await axios.get<SurahMetadata>("/data/surah.json");
  return response.data;
};

const fetchSurahDetail = async (
  surahId: string
): Promise<{
  surah: SurahDetail;
  metadata: Surah | null;
}> => {
  // First fetch the metadata
  const metaResponse = await axios.get<SurahMetadata>("/data/surah.json");
  const surahList = metaResponse.data;
  const currentSurah = surahList.find((s) => s.index === surahId);

  if (!currentSurah) {
    throw new Error(`Surah with ID ${surahId} not found`);
  }

  // Then fetch the actual surah content
  const numericId = Number(surahId);
  const surahPath = `/data/surah/surah_${numericId}.json`;

  try {
    const response = await axios.get<SurahDetail>(surahPath);
    return {
      surah: response.data,
      metadata: currentSurah,
    };
  } catch (surahError) {
    console.error("Error fetching surah content:", surahError);
    // If we can't get content, create a basic structure with metadata
    return {
      surah: {
        index: surahId,
        name: currentSurah.title,
        verse: {},
        count: currentSurah.count,
        juz: [],
      },
      metadata: currentSurah,
    };
  }
};

const fetchTranslation = async (
  surahId: string
): Promise<Record<number, string>> => {
  const numericId = Number(surahId);
  const translationPath = `/data/translation/ar/ar_translation_${numericId}.json`;

  const response = await axios.get<Translation>(translationPath);
  const data = response.data;

  // Process the translation data into a more usable format
  const translationMap: Record<number, string> = {};

  if (data.verse && typeof data.verse === "object") {
    Object.entries(data.verse).forEach(([key, value]) => {
      const verseId = parseInt(key.replace("verse_", ""));
      if (!isNaN(verseId)) {
        translationMap[verseId] = value;
      }
    });
  }

  return translationMap;
};

// Hook for fetching the list of all surahs
export function useSurahList() {
  const {
    data: surahs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
    staleTime: Infinity, // Surah list doesn't change, so we can cache it indefinitely
  });

  return {
    surahs,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
  };
}

// Hook for fetching a specific surah by ID
export function useSurahDetail(surahId: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["surah", surahId],
    queryFn: () => fetchSurahDetail(surahId),
    enabled: !!surahId, // Only run query if surahId is provided
  });

  const surah = data?.surah || null;
  const metadata = data?.metadata || null;

  return {
    surah,
    metadata,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
    verses: surah?.verse
      ? Object.entries(surah.verse).map(([id, text]) => ({
          id: parseInt(id.replace("verse_", "")),
          text,
        }))
      : [],
  };
}

// New hook for fetching paginated verses
export function usePaginatedSurahDetail(
  surahId: string,
  pageSize: number = 20
) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["surah", surahId],
    queryFn: () => fetchSurahDetail(surahId),
    enabled: !!surahId,
  });

  const surah = data?.surah || null;
  const metadata = data?.metadata || null;

  const allVerses = surah?.verse
    ? Object.entries(surah.verse).map(([id, text]) => ({
        id: parseInt(id.replace("verse_", "")),
        text,
      }))
    : [];

  // Custom hook to manage pagination state
  const useVersePages = (verses: typeof allVerses, pageSize: number) => {
    const [loadedPages, setLoadedPages] = useState(1);

    // Calculate how many verses to show based on current page
    const visibleVerses = useMemo(() => {
      return verses.slice(0, loadedPages * pageSize);
    }, [verses, loadedPages, pageSize]);

    // Function to load more verses
    const loadMore = useCallback(() => {
      if (visibleVerses.length < verses.length) {
        setLoadedPages((prev) => prev + 1);
        return true;
      }
      return false;
    }, [verses.length, visibleVerses.length]);

    // Function to ensure a specific verse is loaded
    const ensureVerseIsLoaded = useCallback(
      (verseNumber: number) => {
        // Add buffer to load additional ayahs (e.g., 2 more)
        const verseToLoad = verseNumber + 2;
        const requiredPages = Math.ceil(verseToLoad / pageSize);
        if (requiredPages > loadedPages) {
          setLoadedPages(requiredPages);
          return true;
        }
        return false;
      },
      [loadedPages, pageSize]
    );

    // Check if there are more verses to load
    const hasMore = visibleVerses.length < verses.length;

    return { visibleVerses, loadMore, hasMore, ensureVerseIsLoaded };
  };

  return {
    allVerses,
    metadata,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
    useVersePages: () => useVersePages(allVerses, pageSize),
  };
}

// Hook for fetching translation for a specific surah
export function useSurahTranslation(surahId: string) {
  const {
    data: translation = {},
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["translation", surahId],
    queryFn: () => fetchTranslation(surahId),
    enabled: !!surahId, // Only run query if surahId is provided
  });

  return {
    translation,
    status: isLoading ? "loading" : isError ? "error" : "success",
    error: isError ? (error as Error).message || "An error occurred" : null,
    isLoading,
    fetchTranslation: refetch,
  };
}
