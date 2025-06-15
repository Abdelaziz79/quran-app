"use client";

import RepeatOptions from "@/app/_components/RepeatOptions";
import {
  getAudioEditionVerseByVerse,
  getSurahAudioVerseByVerse,
} from "@/app/_hooks/AlQuranApi";
import { useMemorizationContext } from "@/app/_hooks/MemorizationProvider";
import { useQuranAudioContext } from "@/app/_hooks/QuranAudioProvider";
import { useQuranSettings } from "@/app/_hooks/QuranSettingsProvider";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CheckCheck,
  CheckCircle,
  Settings,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MemorizationLessonProps {
  surahId: string;
  lessonId: number;
  surahNameAr: string;
  verses: { id: number; text: string }[];
  onLessonComplete: () => void;
}

export function MemorizationLesson({
  surahId,
  lessonId,
  surahNameAr,
  verses,
  onLessonComplete,
}: MemorizationLessonProps) {
  const { getLessonsForSurah, completeLesson, resetLesson } =
    useMemorizationContext();

  const {
    audioPlayer,
    selectedAudioEdition,
    setSelectedAudioEdition,
    setCurrentSurah,
    setCurrentVerse,
    repeatCount,
    setRepeatCount,
    repeatStartVerse,
    setRepeatStartVerse,
    repeatEndVerse,
    setRepeatEndVerse,
    isRepeatRange,
    setIsRepeatRange,
  } = useQuranAudioContext();

  // Get Quran text settings
  const { fontClass, fontSizeClass, lineHeightClass } = useQuranSettings();

  const [currentVerse, setCurrentMemVerse] = useState<number | null>(null);
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [hiddenVerses, setHiddenVerses] = useState<number[]>([]);
  const [masteryLevel, setMasteryLevel] = useState(80); // Default mastery level
  const [testMode, setTestMode] = useState(false);
  const [currentVerseRepeat, setCurrentVerseRepeat] = useState(0);
  const [blurAllVerses, setBlurAllVerses] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(true); // Control whether blur is enabled at all

  // Ref to track the repeat cycle completion state
  const repeatCycleCompleted = useRef(false);

  // Get available editions for verse-by-verse playback
  const verseByVerseEditions = getAudioEditionVerseByVerse();

  // Get the lesson details
  const lessons = getLessonsForSurah(surahId);
  const currentLesson = lessons.find((l) => l.lessonId === lessonId);

  // Get total verses in the surah (needed for repeat options)
  const totalVerses =
    verses.length > 0 ? Math.max(...verses.map((v) => v.id)) : 0;

  // Load audio URLs
  useEffect(() => {
    if (selectedAudioEdition) {
      const numericSurahId = parseInt(surahId);
      const urls = getSurahAudioVerseByVerse(
        numericSurahId,
        selectedAudioEdition
      );
      setAudioUrls(urls);
      setCurrentSurah(numericSurahId);
    }
  }, [surahId, selectedAudioEdition, setCurrentSurah]);

  // Reset repeat range settings when lesson changes
  useEffect(() => {
    if (currentLesson) {
      // Set repeat range to match the current lesson
      setRepeatStartVerse(currentLesson.startVerse);
      setRepeatEndVerse(currentLesson.endVerse);
    }
  }, [currentLesson, setRepeatStartVerse, setRepeatEndVerse]);

  // Update blur settings based on mastery level
  useEffect(() => {
    if (masteryLevel >= 90) {
      setBlurAllVerses(true);
      setBlurEnabled(true);
    } else if (masteryLevel >= 30) {
      setBlurAllVerses(false);
      setBlurEnabled(true);
    } else {
      // For very low mastery, disable blur completely
      setBlurAllVerses(false);
      setBlurEnabled(false);
    }
  }, [masteryLevel]);

  // Handle audio ended event for verse repetition
  useEffect(() => {
    if (!audioUrls.length || !playingVerse) return;

    const handleAudioEnded = () => {
      // Standard verse repetition (non-range mode)
      if (
        !isRepeatRange &&
        repeatCount > 1 &&
        currentVerseRepeat < repeatCount - 1
      ) {
        // Increment repeat counter and play the same verse again
        setCurrentVerseRepeat((prev) => prev + 1);
        setTimeout(() => {
          audioPlayer.play(audioUrls[playingVerse - 1]);
        }, 500);
        return;
      }

      // Handle range repeat mode
      if (
        isRepeatRange &&
        repeatStartVerse !== null &&
        repeatEndVerse !== null &&
        !repeatCycleCompleted.current &&
        playingVerse
      ) {
        // If we're at the end of the range, go back to start verse
        // unless we've completed all repeats
        if (playingVerse >= repeatEndVerse) {
          // Check if we need to do another repeat of the range
          if (repeatCount > 1 && currentVerseRepeat < repeatCount - 1) {
            setCurrentVerseRepeat((prev) => prev + 1);
            const nextVerse = repeatStartVerse;
            setPlayingVerse(nextVerse);
            setCurrentMemVerse(nextVerse);
            setCurrentVerse(nextVerse);

            // Play the start verse
            setTimeout(() => {
              audioPlayer.play(audioUrls[nextVerse - 1]);
            }, 800);
            return;
          } else {
            // We've completed all repeats
            repeatCycleCompleted.current = true;
            setCurrentVerseRepeat(0);
            setPlayingVerse(null);
            return;
          }
        }

        // Otherwise, proceed to next verse in range
        const nextVerse = playingVerse + 1;
        if (nextVerse <= audioUrls.length) {
          setPlayingVerse(nextVerse);
          setCurrentMemVerse(nextVerse);
          setCurrentVerse(nextVerse);

          // Play next verse
          setTimeout(() => {
            audioPlayer.play(audioUrls[nextVerse - 1]);
          }, 800);
          return;
        }
      }

      // If not repeating or at end of repeats, just stop
      setPlayingVerse(null);
      setCurrentVerseRepeat(0);
    };

    // Use the onEnded method from audioPlayer
    const cleanupFn = audioPlayer.onEnded(handleAudioEnded);
    return cleanupFn;
  }, [
    audioUrls,
    playingVerse,
    repeatCount,
    currentVerseRepeat,
    audioPlayer,
    isRepeatRange,
    repeatStartVerse,
    repeatEndVerse,
    setCurrentVerse,
  ]);

  // Handle audio edition change
  const handleEditionChange = (value: string) => {
    const edition = verseByVerseEditions.find((e) => e.identifier === value);
    if (edition) {
      setSelectedAudioEdition(edition);
    }
  };

  // Play audio for a specific verse
  const playVerse = (verseId: number) => {
    if (audioUrls.length > 0 && verseId <= audioUrls.length) {
      // Stop any ongoing playback
      audioPlayer.stop();

      setPlayingVerse(verseId);
      setCurrentMemVerse(verseId);
      setCurrentVerse(verseId);
      setCurrentVerseRepeat(0); // Reset repeat counter
      repeatCycleCompleted.current = false; // Reset cycle completed flag

      // If in range mode and verse is within range
      if (isRepeatRange && repeatStartVerse && repeatEndVerse) {
        // If starting with a verse that's in the range
        if (verseId >= repeatStartVerse && verseId <= repeatEndVerse) {
          repeatCycleCompleted.current = false;
        } else {
          // If outside range, don't do range repetition
          repeatCycleCompleted.current = true;
        }
      }

      audioPlayer.play(audioUrls[verseId - 1]);
    }
  };

  // Start range playback from beginning
  const playVerseRange = () => {
    if (!repeatStartVerse || !isRepeatRange || !audioUrls.length) return;

    // Stop any ongoing playback
    audioPlayer.stop();

    const startVerse = repeatStartVerse;
    setPlayingVerse(startVerse);
    setCurrentMemVerse(startVerse);
    setCurrentVerse(startVerse);
    setCurrentVerseRepeat(0);
    repeatCycleCompleted.current = false;

    audioPlayer.play(audioUrls[startVerse - 1]);
  };

  // Start test mode (hide random verses)
  const startTest = () => {
    // Get verse IDs from current lesson
    const lessonVerseIds = verses.map((v) => v.id);

    // If mastery level is high, blur all verses
    if (masteryLevel >= 90) {
      setHiddenVerses(lessonVerseIds);
      setBlurAllVerses(true);
      setBlurEnabled(true);
    } else if (masteryLevel >= 30) {
      // Calculate how many verses to hide (50% of verses, at least 1)
      const hideCount = Math.max(1, Math.floor(lessonVerseIds.length / 2));

      // Randomly select verses to hide
      const shuffled = [...lessonVerseIds].sort(() => 0.5 - Math.random());
      const versesToHide = shuffled.slice(0, hideCount);

      setHiddenVerses(versesToHide);
      setBlurAllVerses(false);
      setBlurEnabled(true);
    } else {
      // For very low mastery, don't hide any verses
      setHiddenVerses([]);
      setBlurAllVerses(false);
      setBlurEnabled(false);
    }

    setTestMode(true);
  };

  // Complete the test and mark lesson as done
  const completeTest = () => {
    completeLesson(surahId, lessonId, masteryLevel);
    setTestMode(false);
    setHiddenVerses([]);
    setBlurAllVerses(false);
    onLessonComplete();
  };

  // Reset the lesson (mark as not completed)
  const resetLessonHandler = () => {
    resetLesson(surahId, lessonId);
  };

  // Toggle verse visibility (for test mode)
  const toggleVerseVisibility = (verseId: number) => {
    // If we're in "blur all" mode, don't allow toggling individual verses
    if (blurAllVerses) return;

    if (hiddenVerses.includes(verseId)) {
      setHiddenVerses(hiddenVerses.filter((id) => id !== verseId));
    } else {
      setHiddenVerses([...hiddenVerses, verseId]);
    }
  };

  // Format lesson title
  const lessonTitle = `${surahNameAr} (${toArabicDigits(
    parseInt(surahId)
  )}) - الدرس ${toArabicDigits(lessonId)}`;

  // Filter verses for this lesson
  const lessonVerses = currentLesson
    ? verses.filter(
        (v) =>
          v.id >= currentLesson.startVerse && v.id <= currentLesson.endVerse
      )
    : [];

  // Format date in standard format (YYYY-MM-DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <h2 className="text-xl md:text-2xl font-bold">{lessonTitle}</h2>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 ml-2" />
                <span>اعدادات القارئ</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <h3 className="mb-2 font-medium text-sm">نوع التلاوة</h3>
                <Select
                  value={selectedAudioEdition?.identifier}
                  onValueChange={handleEditionChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر القارئ" />
                  </SelectTrigger>
                  <SelectContent>
                    {verseByVerseEditions.map((edition) => (
                      <SelectItem
                        key={edition.identifier}
                        value={edition.identifier}
                      >
                        {edition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isRepeatRange && repeatStartVerse && repeatEndVerse && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={playVerseRange}
                  >
                    تشغيل المقطع المحدد
                  </Button>
                )}
              </div>

              <DropdownMenuSeparator />

              <RepeatOptions
                isRepeatRange={isRepeatRange}
                setIsRepeatRange={setIsRepeatRange}
                repeatStartVerse={repeatStartVerse}
                setRepeatStartVerse={setRepeatStartVerse}
                repeatEndVerse={repeatEndVerse}
                setRepeatEndVerse={setRepeatEndVerse}
                repeatCount={repeatCount}
                setRepeatCount={setRepeatCount}
                totalVerses={totalVerses}
                onPause={audioPlayer.isPlaying ? audioPlayer.pause : undefined}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {!testMode && !currentLesson?.completed && (
            <Button
              onClick={startTest}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>اختبار الحفظ</span>
            </Button>
          )}

          {testMode && (
            <Button
              onClick={completeTest}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>إتمام الحفظ</span>
            </Button>
          )}

          {currentLesson?.completed && (
            <Button
              onClick={resetLessonHandler}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <span>إعادة ضبط</span>
            </Button>
          )}
        </div>
      </div>

      {testMode && (
        <Card className="p-3 md:p-4 bg-primary/10">
          <h3 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">
            مستوى الإتقان
          </h3>
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-primary" />
            <Slider
              value={[masteryLevel]}
              min={0}
              max={100}
              step={10}
              onValueChange={(value) => {
                setMasteryLevel(value[0]);
                // Update blur state based on mastery level
                if (value[0] >= 90) {
                  setBlurAllVerses(true);
                  setBlurEnabled(true);
                  setHiddenVerses(verses.map((v) => v.id));
                } else if (value[0] >= 30) {
                  // Medium mastery - selective blur
                  setBlurAllVerses(false);
                  setBlurEnabled(true);

                  // If we're coming from high mastery or low mastery, regenerate hidden verses
                  const lessonVerseIds = verses.map((v) => v.id);
                  const hideCount = Math.max(
                    1,
                    Math.floor(lessonVerseIds.length / 2)
                  );
                  const shuffled = [...lessonVerseIds].sort(
                    () => 0.5 - Math.random()
                  );
                  const versesToHide = shuffled.slice(0, hideCount);
                  setHiddenVerses(versesToHide);
                } else {
                  // Low mastery - no blur
                  setBlurAllVerses(false);
                  setBlurEnabled(false);
                  setHiddenVerses([]);
                }
              }}
              className="flex-1"
              dir="ltr" // Ensure slider direction is left-to-right
            />
            <ThumbsDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-center mt-2 text-xs md:text-sm">
            {masteryLevel < 30 && "بحاجة إلى مزيد من المراجعة"}
            {masteryLevel >= 30 && masteryLevel < 70 && "مستوى متوسط"}
            {masteryLevel >= 70 && masteryLevel < 90 && "إتقان جيد"}
            {masteryLevel >= 90 && "إتقان ممتاز"}
          </div>
          {blurAllVerses && (
            <div className="text-center mt-2 text-xs md:text-sm text-primary font-medium">
              تم إخفاء جميع الآيات للاختبار الكامل
            </div>
          )}
          {!blurEnabled && (
            <div className="text-center mt-2 text-xs md:text-sm text-amber-500 font-medium">
              وضع المبتدئين: لا يوجد إخفاء للآيات
            </div>
          )}
        </Card>
      )}

      {/* Audio status indicator when repeating */}
      {playingVerse && (repeatCount > 1 || isRepeatRange) && (
        <div className="bg-primary/10 rounded-lg p-2 md:p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
          {isRepeatRange && repeatStartVerse && repeatEndVerse ? (
            <div className="flex items-center">
              <span className="font-medium ml-2 text-sm md:text-base">
                تكرار الآيات:
              </span>
              <span className="text-sm md:text-base">
                {toArabicDigits(repeatStartVerse)}-
                {toArabicDigits(repeatEndVerse)} ᛵ{" "}
                {repeatCount > 1 && (
                  <span className="bg-primary/20 px-2 py-0.5 rounded-full text-xs md:text-sm">
                    {toArabicDigits(currentVerseRepeat + 1)}/
                    {toArabicDigits(repeatCount)}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="font-medium ml-2 text-sm md:text-base">
                تكرار الآية:
              </span>
              <span className="text-sm md:text-base">
                {toArabicDigits(playingVerse)} ᛵ{" "}
                {repeatCount > 1 && (
                  <span className="bg-primary/20 px-2 py-0.5 rounded-full text-xs md:text-sm">
                    {toArabicDigits(currentVerseRepeat + 1)}/
                    {toArabicDigits(repeatCount)}
                  </span>
                )}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              audioPlayer.stop();
              setPlayingVerse(null);
              setCurrentVerseRepeat(0);
              repeatCycleCompleted.current = true;
            }}
          >
            إيقاف
          </Button>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        {lessonVerses.map((verse) => (
          <div
            key={verse.id}
            className={`p-3 md:p-4 rounded-lg transition-colors ${
              playingVerse === verse.id
                ? "bg-primary/10 border border-primary/30"
                : currentVerse === verse.id
                ? "bg-primary/5 border border-primary/20"
                : "bg-card hover:bg-muted/50 border border-border"
            }`}
            onClick={() => setCurrentMemVerse(verse.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs md:text-sm text-muted-foreground">
                الآية {toArabicDigits(verse.id)}
              </span>
              <Button
                size="sm"
                variant={playingVerse === verse.id ? "default" : "ghost"}
                className={`rounded-full p-1 md:p-2 transition-all ${
                  playingVerse === verse.id
                    ? "bg-primary hover:bg-primary/90"
                    : "hover:bg-primary/10"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  playVerse(verse.id);
                }}
              >
                {playingVerse === verse.id ? (
                  <VolumeX className="h-3 w-3 md:h-4 md:w-4 text-white" />
                ) : (
                  <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>
            </div>

            <div
              className={`${fontClass} ${fontSizeClass} ${lineHeightClass} ${
                testMode &&
                blurEnabled &&
                (hiddenVerses.includes(verse.id) || blurAllVerses)
                  ? "blur-sm hover:blur-none transition-all"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (testMode && blurEnabled && !blurAllVerses)
                  toggleVerseVisibility(verse.id);
              }}
            >
              {verse.text}
            </div>
          </div>
        ))}
      </div>

      {currentLesson?.completed && (
        <div className="bg-green-500/10 text-green-700 dark:text-green-300 p-3 md:p-4 rounded-lg text-center">
          <CheckCheck className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-2" />
          <p className="font-semibold text-sm md:text-base">
            مستوى الإتقان: {toArabicDigits(currentLesson.mastery)}%
          </p>
          {currentLesson.completedDate && (
            <p className="text-xs md:text-sm mt-1">
              تاريخ الإكمال: {formatDate(currentLesson.completedDate)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
