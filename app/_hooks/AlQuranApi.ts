import { AYAH_COUNTS_PER_SURAH_CONST } from "../_constants/ayahCounts";
import { getAbsoluteAyahNumber } from "../_lib/quranUtils";

export const cdnUrl = "https://cdn.islamic.network";

export const getAyahUrl = (
  absoluteAyahNumber: number,
  identifier = "ar.husary",
  bitrate = 128
) => {
  return `${cdnUrl}/quran/audio/${bitrate}/${identifier}/${absoluteAyahNumber}.mp3`;
};

export const getSurahAudioVerseByVerse = (
  surahNumber: number,
  edition = {
    identifier: "ar.husary",
    availableBitrates: [64, 128],
  }
) => {
  // Validate surah number
  if (surahNumber < 1 || surahNumber > 114) {
    console.error(
      `Invalid Surah number: ${surahNumber}. Must be between 1 and 114.`
    );
    return [];
  }

  const totalSurahVerses = AYAH_COUNTS_PER_SURAH_CONST[surahNumber - 1];
  const ayahAudioUrls = [];

  // Get the highest available bitrate
  const bitrate =
    edition.availableBitrates.length > 0
      ? Math.max(...edition.availableBitrates)
      : 128;

  for (let i = 1; i <= totalSurahVerses; i++) {
    const absoluteAyah = getAbsoluteAyahNumber(surahNumber, i);
    if (absoluteAyah) {
      ayahAudioUrls.push(getAyahUrl(absoluteAyah, edition.identifier, bitrate));
    }
  }
  return ayahAudioUrls;
};

export const getAudioEditionVerseByVerse = () => {
  return [
    {
      identifier: "ar.abdullahbasfar",
      language: "ar",
      name: "عبد الله بصفر",
      englishName: "Abdullah Basfar",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [32, 64, 192],
    },
    {
      identifier: "ar.abdurrahmaansudais",
      language: "ar",
      name: "عبدالرحمن السديس",
      englishName: "Abdurrahmaan As-Sudais",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 192],
    },
    {
      identifier: "ar.abdulsamad",
      language: "ar",
      name: "عبدالباسط عبدالصمد",
      englishName: "Abdul Samad",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64],
    },
    {
      identifier: "ar.shaatree",
      language: "ar",
      name: "أبو بكر الشاطري",
      englishName: "Abu Bakr Ash-Shaatree",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.ahmedajamy",
      language: "ar",
      name: "أحمد بن علي العجمي",
      englishName: "Ahmed ibn Ali al-Ajamy",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.alafasy",
      language: "ar",
      name: "مشاري العفاسي",
      englishName: "Alafasy",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.hanirifai",
      language: "ar",
      name: "هاني الرفاعي",
      englishName: "Hani Rifai",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 192],
    },
    {
      identifier: "ar.husary",
      language: "ar",
      name: "محمود خليل الحصري",
      englishName: "Husary",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.husarymujawwad",
      language: "ar",
      name: "محمود خليل الحصري (المجود)",
      englishName: "Husary (Mujawwad)",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.hudhaify",
      language: "ar",
      name: "علي بن عبدالرحمن الحذيفي",
      englishName: "Hudhaify",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [32, 64, 128],
    },
    {
      identifier: "ar.ibrahimakhbar",
      language: "ar",
      name: "إبراهيم الأخضر",
      englishName: "Ibrahim Akhdar",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [32],
    },
    {
      identifier: "ar.mahermuaiqly",
      language: "ar",
      name: "ماهر المعيقلي",
      englishName: "Maher Al Muaiqly",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64, 128],
    },
    {
      identifier: "ar.muhammadayyoub",
      language: "ar",
      name: "محمد أيوب",
      englishName: "Muhammad Ayyoub",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [128],
    },
    {
      identifier: "ar.muhammadjibreel",
      language: "ar",
      name: "محمد جبريل",
      englishName: "Muhammad Jibreel",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [128],
    },
    {
      identifier: "ar.saoodshuraym",
      language: "ar",
      name: "سعود الشريم",
      englishName: "Saood bin Ibraaheem Ash-Shuraym",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64],
    },
    {
      identifier: "ar.parhizgar",
      language: "ar",
      name: "شهریار پرهیزگار",
      englishName: "Parhizgar",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [48],
    },
    {
      identifier: "ar.aymanswoaid",
      language: "ar",
      name: "أيمن سويد",
      englishName: "Ayman Sowaid",
      format: "audio",
      type: "versebyverse",
      direction: null,
      availableBitrates: [64],
    },
  ];
};
