import { NextRequest, NextResponse } from "next/server";
import { SURAH_NAMES_AR } from "@/app/_constants/surahNames";
import { normalizeArabicText } from "@/app/_lib/quranUtils";
import fs from "fs/promises";
import path from "path";

// Define types
type VerseResult = {
  type: "verse";
  surahId: number;
  surahName: string;
  verseNumber: number;
  verseText: string;
  highlight?: string;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Only check if query exists and is not empty
    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] });
    }

    const normalizedQuery = normalizeArabicText(query.trim());
    const results: VerseResult[] = [];

    // Load verse data from JSON files
    for (let surahIndex = 1; surahIndex <= 114; surahIndex++) {
      try {
        const surahData = await loadSurahData(surahIndex);

        if (!surahData || !surahData.verse) continue;

        // Search through verses in this surah
        const verses = Object.entries(surahData.verse).map(([key, text]) => {
          // Extract verse number from the key (e.g., "verse_1" -> 1)
          const verseNumber = parseInt(key.split("_")[1]);
          return { number: verseNumber, text: text as string };
        });

        for (const verse of verses) {
          const normalizedVerseText = normalizeArabicText(verse.text);

          // Check if the verse contains the query
          if (normalizedVerseText.includes(normalizedQuery)) {
            results.push({
              type: "verse",
              surahId: surahIndex,
              surahName: SURAH_NAMES_AR[surahIndex - 1],
              verseNumber: verse.number,
              verseText: verse.text,
              highlight: getHighlightedText(verse.text, query),
            });

            // Limit results to prevent too many matches
            if (results.length >= 50) break;
          }
        }

        // If we already have enough results, stop searching more surahs
        if (results.length >= 50) break;
      } catch (error) {
        console.error(`Error searching surah ${surahIndex}:`, error);
        // Continue with other surahs even if one fails
      }
    }

    // If no results found and query contains multiple words, try searching for individual words
    if (results.length === 0 && normalizedQuery.includes(" ")) {
      const words = normalizedQuery
        .split(" ")
        .filter((word) => word.length > 0);

      // Find verses that contain ALL the individual words
      for (let surahIndex = 1; surahIndex <= 114; surahIndex++) {
        try {
          const surahData = await loadSurahData(surahIndex);

          if (!surahData || !surahData.verse) continue;

          const verses = Object.entries(surahData.verse).map(([key, text]) => {
            const verseNumber = parseInt(key.split("_")[1]);
            return { number: verseNumber, text: text as string };
          });

          for (const verse of verses) {
            const normalizedVerseText = normalizeArabicText(verse.text);

            // Check if the verse contains ALL the individual words
            const containsAllWords = words.every((word) =>
              normalizedVerseText.includes(word)
            );

            if (containsAllWords) {
              results.push({
                type: "verse",
                surahId: surahIndex,
                surahName: SURAH_NAMES_AR[surahIndex - 1],
                verseNumber: verse.number,
                verseText: verse.text,
                highlight: getHighlightedText(verse.text, query),
              });

              if (results.length >= 50) break;
            }
          }

          if (results.length >= 50) break;
        } catch (error) {
          console.error(
            `Error searching surah ${surahIndex} for individual words:`,
            error
          );
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}

// Helper function to load surah data from file
async function loadSurahData(surahIndex: number) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "surah",
      `surah_${surahIndex}.json`
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to load surah ${surahIndex}:`, error);
    return null;
  }
}

// Helper function to get highlighted snippet of text
function getHighlightedText(text: string, query: string): string {
  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);

  // If the query is multi-word, try to find the best match
  if (normalizedQuery.includes(" ")) {
    const words = normalizedQuery.split(" ").filter((word) => word.length > 0);

    // Try to find the full phrase first
    let index = normalizedText.indexOf(normalizedQuery);
    if (index !== -1) {
      // Found the exact phrase
      const start = Math.max(0, index - 20);
      const end = Math.min(
        normalizedText.length,
        index + normalizedQuery.length + 20
      );

      // Extract the context around the match
      let snippet = text.substring(start, end);

      // Add ellipsis if we're not showing the beginning or end
      if (start > 0) snippet = "..." + snippet;
      if (end < text.length) snippet = snippet + "...";

      return snippet;
    }

    // If exact phrase not found, find a section containing most of the words
    // Find the first occurrence of the first word
    const firstWord = words[0];
    index = normalizedText.indexOf(firstWord);

    if (index !== -1) {
      // Found at least the first word
      const start = Math.max(0, index - 20);
      const end = Math.min(normalizedText.length, index + 100); // Larger window to capture more words

      // Extract the context around the match
      let snippet = text.substring(start, end);

      // Add ellipsis if we're not showing the beginning or end
      if (start > 0) snippet = "..." + snippet;
      if (end < text.length) snippet = snippet + "...";

      return snippet;
    }
  }

  // Single word or fallback for multi-word
  const index = normalizedText.indexOf(normalizedQuery);
  if (index === -1) {
    // If exact match not found, return the first part of the verse
    return (
      text.substring(0, Math.min(text.length, 60)) +
      (text.length > 60 ? "..." : "")
    );
  }

  // Calculate the context window around the match
  const contextSize = 30; // Characters before and after the match
  const start = Math.max(0, index - contextSize);
  const end = Math.min(
    normalizedText.length,
    index + normalizedQuery.length + contextSize
  );

  // Extract the context around the match
  let snippet = text.substring(start, end);

  // Add ellipsis if we're not showing the beginning or end
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return snippet;
}
