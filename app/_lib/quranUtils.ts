import { AYAH_COUNTS_PER_SURAH_CONST } from "@/app/_constants/ayahCounts";

export function getAbsoluteAyahNumber(
  surahNumber: number, // 1-indexed
  ayahInSurah: number // 1-indexed
): number | null {
  const numericSurah = Number(surahNumber);
  const numericAyahInSurah = Number(ayahInSurah);

  if (isNaN(numericSurah) || isNaN(numericAyahInSurah)) {
    console.error("Surah number or ayah number is not a valid number.");
    return null;
  }

  if (numericSurah < 1 || numericSurah > 114) {
    console.error(
      `Invalid Surah number: ${numericSurah}. Must be between 1 and 114.`
    );
    return null;
  }

  // AYAH_COUNTS_PER_SURAH_CONST is 0-indexed for surahs
  const maxAyahsInThisSurah = AYAH_COUNTS_PER_SURAH_CONST[numericSurah - 1];
  if (numericAyahInSurah < 1 || numericAyahInSurah > maxAyahsInThisSurah) {
    console.error(
      `Invalid Ayah number for Surah ${numericSurah}: ${numericAyahInSurah}. Must be between 1 and ${maxAyahsInThisSurah}.`
    );
    return null;
  }

  let absoluteAyahNum = 0;
  for (let i = 0; i < numericSurah - 1; i++) {
    absoluteAyahNum += AYAH_COUNTS_PER_SURAH_CONST[i];
  }
  absoluteAyahNum += numericAyahInSurah;
  return absoluteAyahNum;
}

/**
 * Converts Western Arabic numerals to Eastern Arabic numerals
 * @param num Number to convert
 * @returns String with Eastern Arabic numerals
 */
export function toArabicDigits(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => {
      if (/\d/.test(digit)) {
        return arabicDigits[parseInt(digit)];
      }
      return digit;
    })
    .join("");
}

/**
 * Normalizes Arabic text for search purposes by replacing similar letters
 * @param text Text to normalize
 * @returns Normalized text
 */
export function normalizeArabicText(text: string): string {
  if (!text) return "";

  // First, handle special Unicode characters used in Quran text
  const normalized = text
    // Normalize Alef Wasla to regular Alef
    .replace(/\u0671/g, "ا") // Alef Wasla -> Alef

    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, "")

    // Remove tatweel (kashida)
    .replace(/\u0640/g, "")

    // Remove small Waqf marks and other special Quranic symbols
    .replace(/[\u06D6-\u06ED]/g, "")

    // Normalize all Alef variations to simple Alef
    .replace(/[أإآا]/g, "ا")

    // Normalize Yeh variations
    .replace(/[يىئ]/g, "ي")

    // Normalize Teh Marbuta and Heh
    .replace(/[ةه]/g, "ه")

    // Normalize Waw variations
    .replace(/[ؤو]/g, "و")

    // Normalize Hamza variations
    .replace(/[ءئؤإأآ]/g, "ا")

    // Normalize Kaf variations
    .replace(/[كک]/g, "ك")

    // Normalize Qaf variations
    .replace(/[قڨ]/g, "ق")

    // Normalize Lam-Alef ligatures
    .replace(/[ﻻﻼﻷﻸﻹﻺﻵﻶ]/g, "لا")

    // Normalize Dal variations
    .replace(/[دذ]/g, "د")

    // Normalize Teh variations
    .replace(/[تةط]/g, "ت")

    // Normalize Sad variations
    .replace(/[صض]/g, "ص")

    // Normalize Seen variations
    .replace(/[سش]/g, "س")

    // Normalize Ha variations
    .replace(/[حه]/g, "ح")

    // Normalize Ain variations
    .replace(/[عغ]/g, "ع")

    // Normalize Zain variations
    .replace(/[زظذ]/g, "ز")

    // Convert to lowercase (for any Latin characters)
    .toLowerCase();

  // Replace multiple spaces with a single space and trim
  return normalized.replace(/\s+/g, " ").trim();
}

// Helper to format time in HH:MM:SS
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
