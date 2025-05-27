import { Surah } from "@/app/_hooks/useQuranData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type BookmarkWithMetadata = {
  surahId: string;
  surahName: string;
  surahNameAr: string;
  verseIds: number[];
  verseTexts: { [verseId: number]: string };
};

/**
 * Hook for managing Quran bookmarks with React Query
 */
export function useBookmarks(surahs: Surah[]) {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load all bookmarks from localStorage
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => {
      if (typeof window === "undefined" || surahs.length === 0) {
        return Promise.resolve([]);
      }

      const allBookmarks: BookmarkWithMetadata[] = [];

      // Loop through localStorage to find bookmark keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quran-bookmarks-")) {
          try {
            const surahId = key.replace("quran-bookmarks-", "");
            const bookmarkData = JSON.parse(localStorage.getItem(key) || "[]");

            // Handle both old format (array) and new format (object with verseIds and verseTexts)
            const verseIds = Array.isArray(bookmarkData)
              ? bookmarkData
              : bookmarkData.verseIds || [];

            const verseTexts =
              !Array.isArray(bookmarkData) && bookmarkData.verseTexts
                ? bookmarkData.verseTexts
                : {};

            if (verseIds.length > 0) {
              // Find surah metadata
              const surah = surahs.find((s) => s.index === surahId);

              if (surah) {
                allBookmarks.push({
                  surahId,
                  surahName: surah.title,
                  surahNameAr: surah.titleAr,
                  verseIds: verseIds,
                  verseTexts: verseTexts,
                });
              }
            }
          } catch (e) {
            console.error("Error parsing bookmarks:", e);
          }
        }
      }

      return Promise.resolve(allBookmarks);
    },
    enabled: isClient && surahs.length > 0,
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({
      surahId,
      verseId,
      verseText = "",
    }: {
      surahId: string;
      verseId: number;
      verseText?: string;
    }) => {
      const currentBookmarks = [
        ...(queryClient.getQueryData<BookmarkWithMetadata[]>(["bookmarks"]) ||
          []),
      ];
      const index = currentBookmarks.findIndex((b) => b.surahId === surahId);

      if (index !== -1) {
        // Surah exists in bookmarks
        if (currentBookmarks[index].verseIds.includes(verseId)) {
          // Remove verse if already bookmarked
          currentBookmarks[index].verseIds = currentBookmarks[
            index
          ].verseIds.filter((id) => id !== verseId);

          // Remove verse text
          if (currentBookmarks[index].verseTexts) {
            delete currentBookmarks[index].verseTexts[verseId];
          }

          // If no verses left, remove the whole surah entry
          if (currentBookmarks[index].verseIds.length === 0) {
            currentBookmarks.splice(index, 1);
            localStorage.removeItem(`quran-bookmarks-${surahId}`);
          } else {
            // Update localStorage with remaining verses
            localStorage.setItem(
              `quran-bookmarks-${surahId}`,
              JSON.stringify({
                verseIds: currentBookmarks[index].verseIds,
                verseTexts: currentBookmarks[index].verseTexts || {},
              })
            );
          }
        } else {
          // Add verse to existing surah bookmarks
          currentBookmarks[index].verseIds.push(verseId);

          // Initialize verseTexts if it doesn't exist
          if (!currentBookmarks[index].verseTexts) {
            currentBookmarks[index].verseTexts = {};
          }

          // Add verse text
          if (verseText) {
            currentBookmarks[index].verseTexts[verseId] = verseText;
          }

          localStorage.setItem(
            `quran-bookmarks-${surahId}`,
            JSON.stringify({
              verseIds: currentBookmarks[index].verseIds,
              verseTexts: currentBookmarks[index].verseTexts,
            })
          );
        }
      } else {
        // Surah doesn't exist in bookmarks yet, create new entry
        const surah = surahs.find((s) => s.index === surahId);
        if (surah) {
          const verseTexts: { [key: number]: string } = {};
          if (verseText) {
            verseTexts[verseId] = verseText;
          }

          currentBookmarks.push({
            surahId,
            surahName: surah.title,
            surahNameAr: surah.titleAr,
            verseIds: [verseId],
            verseTexts: verseTexts,
          });

          localStorage.setItem(
            `quran-bookmarks-${surahId}`,
            JSON.stringify({
              verseIds: [verseId],
              verseTexts: verseTexts,
            })
          );
        }
      }

      return Promise.resolve(currentBookmarks);
    },
    onSuccess: (newBookmarks) => {
      queryClient.setQueryData(["bookmarks"], newBookmarks);
    },
  });

  // Remove a specific bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async ({
      surahId,
      verseId,
    }: {
      surahId: string;
      verseId: number;
    }) => {
      const currentBookmarks = [
        ...(queryClient.getQueryData<BookmarkWithMetadata[]>(["bookmarks"]) ||
          []),
      ];
      const index = currentBookmarks.findIndex((b) => b.surahId === surahId);

      if (index !== -1) {
        // Remove the verse from the array
        currentBookmarks[index].verseIds = currentBookmarks[
          index
        ].verseIds.filter((id) => id !== verseId);

        // If no verses left, remove the whole surah entry
        if (currentBookmarks[index].verseIds.length === 0) {
          currentBookmarks.splice(index, 1);
          localStorage.removeItem(`quran-bookmarks-${surahId}`);
        } else {
          // Update localStorage with remaining verses
          localStorage.setItem(
            `quran-bookmarks-${surahId}`,
            JSON.stringify(currentBookmarks[index].verseIds)
          );
        }
      }

      return Promise.resolve(currentBookmarks);
    },
    onSuccess: (newBookmarks) => {
      queryClient.setQueryData(["bookmarks"], newBookmarks);
    },
  });

  // Clear all bookmarks mutation
  const clearAllBookmarksMutation = useMutation({
    mutationFn: async () => {
      // Find all bookmark keys and remove them
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("quran-bookmarks-")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      return Promise.resolve([]);
    },
    onSuccess: () => {
      queryClient.setQueryData(["bookmarks"], []);
    },
  });

  // Check if a verse is bookmarked
  const isVerseBookmarked = (surahId: string, verseId: number): boolean => {
    const bookmark = bookmarks.find((b) => b.surahId === surahId);
    return bookmark ? bookmark.verseIds.includes(verseId) : false;
  };

  // Get bookmarked verses for a specific surah
  const getBookmarksForSurah = (surahId: string): number[] => {
    const bookmark = bookmarks.find((b) => b.surahId === surahId);
    return bookmark ? bookmark.verseIds : [];
  };

  // Get verse text for a bookmarked verse
  const getVerseText = (surahId: string, verseId: number): string => {
    const bookmark = bookmarks.find((b) => b.surahId === surahId);
    return bookmark && bookmark.verseTexts
      ? bookmark.verseTexts[verseId] || ""
      : "";
  };

  return {
    bookmarks,
    isClient,
    isVerseBookmarked,
    getBookmarksForSurah,
    getVerseText,
    toggleBookmark: (surahId: string, verseId: number, verseText?: string) =>
      toggleBookmarkMutation.mutate({ surahId, verseId, verseText }),
    removeBookmark: (surahId: string, verseId: number) =>
      removeBookmarkMutation.mutate({ surahId, verseId }),
    clearAllBookmarks: () => clearAllBookmarksMutation.mutate(),
  };
}
