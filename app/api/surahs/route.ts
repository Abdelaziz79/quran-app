import { NextResponse } from "next/server";
import { SURAH_NAMES_AR } from "@/app/_constants/surahNames";
import { AYAH_COUNTS_PER_SURAH_CONST } from "@/app/_constants/ayahCounts";

export async function GET() {
  try {
    // Create an array of surah objects with index, name, and ayah count
    const surahs = SURAH_NAMES_AR.map((titleAr: string, index: number) => {
      // Surah index is 1-based and formatted with leading zeros (e.g., "001")
      const surahIndex = (index + 1).toString().padStart(3, "0");

      return {
        index: surahIndex,
        titleAr,
        title: getSurahEnglishName(surahIndex),
        ayahCount: AYAH_COUNTS_PER_SURAH_CONST[index],
      };
    });

    return NextResponse.json(surahs);
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return NextResponse.json(
      { error: "Failed to fetch surahs" },
      { status: 500 }
    );
  }
}

// Helper function to get English surah names
function getSurahEnglishName(surahIndex: string): string {
  // Remove leading zeros for lookup
  const numericIndex = surahIndex.replace(/^0+/, "");

  const surahNames: Record<string, string> = {
    "1": "Al-Fatihah",
    "2": "Al-Baqarah",
    "3": "Aal-Imran",
    "4": "An-Nisa",
    "5": "Al-Ma'idah",
    "6": "Al-An'am",
    "7": "Al-A'raf",
    "8": "Al-Anfal",
    "9": "At-Tawbah",
    "10": "Yunus",
    "11": "Hud",
    "12": "Yusuf",
    "13": "Ar-Ra'd",
    "14": "Ibrahim",
    "15": "Al-Hijr",
    "16": "An-Nahl",
    "17": "Al-Isra",
    "18": "Al-Kahf",
    "19": "Maryam",
    "20": "Ta-Ha",
    "21": "Al-Anbiya",
    "22": "Al-Hajj",
    "23": "Al-Mu'minun",
    "24": "An-Nur",
    "25": "Al-Furqan",
    "26": "Ash-Shu'ara",
    "27": "An-Naml",
    "28": "Al-Qasas",
    "29": "Al-Ankabut",
    "30": "Ar-Rum",
    "31": "Luqman",
    "32": "As-Sajdah",
    "33": "Al-Ahzab",
    "34": "Saba",
    "35": "Fatir",
    "36": "Ya-Sin",
    "37": "As-Saffat",
    "38": "Sad",
    "39": "Az-Zumar",
    "40": "Ghafir",
    "41": "Fussilat",
    "42": "Ash-Shura",
    "43": "Az-Zukhruf",
    "44": "Ad-Dukhan",
    "45": "Al-Jathiyah",
    "46": "Al-Ahqaf",
    "47": "Muhammad",
    "48": "Al-Fath",
    "49": "Al-Hujurat",
    "50": "Qaf",
    "51": "Adh-Dhariyat",
    "52": "At-Tur",
    "53": "An-Najm",
    "54": "Al-Qamar",
    "55": "Ar-Rahman",
    "56": "Al-Waqi'ah",
    "57": "Al-Hadid",
    "58": "Al-Mujadilah",
    "59": "Al-Hashr",
    "60": "Al-Mumtahanah",
    "61": "As-Saff",
    "62": "Al-Jumu'ah",
    "63": "Al-Munafiqun",
    "64": "At-Taghabun",
    "65": "At-Talaq",
    "66": "At-Tahrim",
    "67": "Al-Mulk",
    "68": "Al-Qalam",
    "69": "Al-Haqqah",
    "70": "Al-Ma'arij",
    "71": "Nuh",
    "72": "Al-Jinn",
    "73": "Al-Muzzammil",
    "74": "Al-Muddathir",
    "75": "Al-Qiyamah",
    "76": "Al-Insan",
    "77": "Al-Mursalat",
    "78": "An-Naba",
    "79": "An-Nazi'at",
    "80": "Abasa",
    "81": "At-Takwir",
    "82": "Al-Infitar",
    "83": "Al-Mutaffifin",
    "84": "Al-Inshiqaq",
    "85": "Al-Buruj",
    "86": "At-Tariq",
    "87": "Al-A'la",
    "88": "Al-Ghashiyah",
    "89": "Al-Fajr",
    "90": "Al-Balad",
    "91": "Ash-Shams",
    "92": "Al-Layl",
    "93": "Ad-Duha",
    "94": "Ash-Sharh",
    "95": "At-Tin",
    "96": "Al-Alaq",
    "97": "Al-Qadr",
    "98": "Al-Bayyinah",
    "99": "Az-Zalzalah",
    "100": "Al-Adiyat",
    "101": "Al-Qari'ah",
    "102": "At-Takathur",
    "103": "Al-Asr",
    "104": "Al-Humazah",
    "105": "Al-Fil",
    "106": "Quraysh",
    "107": "Al-Ma'un",
    "108": "Al-Kawthar",
    "109": "Al-Kafirun",
    "110": "An-Nasr",
    "111": "Al-Masad",
    "112": "Al-Ikhlas",
    "113": "Al-Falaq",
    "114": "An-Nas",
  };

  return surahNames[numericIndex] || `Surah ${numericIndex}`;
}
