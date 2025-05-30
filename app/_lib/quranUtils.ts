// app/_lib/quranUtils.ts
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

// Function to convert Western digits to Arabic digits
export const toArabicDigits = (num: number): string => {
  if (num === 0) return ""; // If the number is just 0, return empty string

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};
