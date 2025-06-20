"use client";

import RepeatOptions from "@/app/_components/RepeatOptions";
import { AYAH_COUNTS_PER_SURAH_CONST } from "@/app/_constants/ayahCounts";
import {
  getAudioEditionVerseByVerse,
  getSurahAudioVerseByVerse,
} from "@/app/_hooks/AlQuranApi";
import { useQuranAudioContext } from "@/app/_hooks/QuranAudioProvider";
import { useArabicRecitersForSurah } from "@/app/_hooks/useQuranAudio";
import { formatTime, toArabicDigits } from "@/app/_lib/quranUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Loader2,
  MoreVertical,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  User,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Type for component props
type AudioPlayerProps = {
  onVisibilityChange?: (isVisible: boolean) => void;
};

export default function AudioPlayer({ onVisibilityChange }: AudioPlayerProps) {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const surahId = parseInt(id as string);
  const {
    getSurahAudioUrl,
    audioPlayer,
    selectedReciter,
    setSelectedReciter,
    isVerseByVerseMode,
    setIsVerseByVerseMode,
    selectedAudioEdition,
    setSelectedAudioEdition,
    currentVerse,
    setCurrentVerse,
    verseAudioUrls,
    setVerseAudioUrls,
    repeatCount,
    setRepeatCount,
    repeatStartVerse,
    setRepeatStartVerse,
    repeatEndVerse,
    setRepeatEndVerse,
    isRepeatRange,
    setIsRepeatRange,
    isInitialPreferencesLoading,
    autoPlayNext,
  } = useQuranAudioContext();

  // Add internal showAudioPlayer state
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(true);

  // Add state for mobile volume slider visibility
  const [showMobileVolumeSlider, setShowMobileVolumeSlider] = useState(false);

  // Reference for volume slider container - used for click outside detection
  const mobileVolumeRef = useRef<HTMLDivElement>(null);

  // Use the hook to get Arabic reciters for this surah
  const { reciters: availableReciters, isLoading: recitersLoading } =
    useArabicRecitersForSurah(surahId);

  // Get verse-by-verse audio editions
  const verseByVerseEditions = getAudioEditionVerseByVerse();

  const [volume, setVolume] = useState<number>(100);
  const [currentRepeat, setCurrentRepeat] = useState(0);

  // Track if we've completed a repeat cycle to prevent re-repeating
  const repeatCycleCompleted = useRef(false);

  // Track the last played verse for resuming after pause
  const lastPlayedVerse = useRef<number | null>(null);

  // Flag to prevent initial verse playback when setting range
  const forceRangeStart = useRef(false);

  // Get the total number of verses in this surah
  const totalVerses = AYAH_COUNTS_PER_SURAH_CONST[surahId - 1] || 0;

  // Reset repeat cycle completed flag when changing repeat settings
  useEffect(() => {
    repeatCycleCompleted.current = false;
  }, [isRepeatRange, repeatStartVerse, repeatEndVerse, repeatCount]);

  // Use a ref to track previous surah ID
  const previousSurahIdRef = useRef<number | null>(null);

  // Reset repeat settings only when changing to a different surah
  useEffect(() => {
    // If this is a different surah than before, reset all repeat settings
    if (previousSurahIdRef.current !== surahId) {
      // Reset repeat settings when navigating to a different surah

      setRepeatCount(1);
      setIsRepeatRange(false);
      setRepeatStartVerse(1);
      const endVerse = Math.min(3, totalVerses);
      setRepeatEndVerse(endVerse);
      setCurrentRepeat(0);
      repeatCycleCompleted.current = false;
      forceRangeStart.current = false;
    }

    // Update the previous surah ID ref
    previousSurahIdRef.current = surahId;
  }, [
    surahId,
    totalVerses,
    setRepeatCount,
    setIsRepeatRange,
    setRepeatStartVerse,
    setRepeatEndVerse,
  ]);

  // Force reset repeat settings when surahId changes
  useEffect(() => {
    // Always reset when surah changes

    // Hard reset all repeat settings
    setRepeatCount(1);
    setIsRepeatRange(false);
    setRepeatStartVerse(1);
    const endVerse = Math.min(3, totalVerses);
    setRepeatEndVerse(endVerse);
    setCurrentRepeat(0);
    repeatCycleCompleted.current = false;
    forceRangeStart.current = false;

    // Also reset player state
    audioPlayer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId]);

  // Handle close player
  const handleClosePlayer = () => {
    // Stop audio playback
    audioPlayer.stop();

    // Reset states
    setCurrentVerse(null);
    setCurrentRepeat(0);
    repeatCycleCompleted.current = false;
    lastPlayedVerse.current = null;
    forceRangeStart.current = false;

    // Reset URL parameter without the ayah parameter
    if (searchParams.has("ayah")) {
      router.replace(`/surah/${surahId.toString().padStart(3, "0")}`, {
        scroll: false,
      });
    }

    // Hide player
    setShowAudioPlayer(false);

    // Notify parent component if callback provided
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  // Load volume from local storage
  useEffect(() => {
    import("@/app/_lib/localStorageUtils").then((utils) => {
      const savedVolume = utils.loadAudioVolume();
      setVolume(savedVolume);
      audioPlayer.setVolume(savedVolume / 100);
    });
  }, [audioPlayer]);

  // Set default reciter if available and none selected
  useEffect(() => {
    if (isInitialPreferencesLoading) return;

    if (
      availableReciters.length > 0 &&
      !selectedReciter &&
      !isVerseByVerseMode
    ) {
      setSelectedReciter(availableReciters[0]);
    }

    // Set default verse-by-verse edition if mode is enabled and none selected
    if (
      verseByVerseEditions.length > 0 &&
      isVerseByVerseMode &&
      !selectedAudioEdition
    ) {
      setSelectedAudioEdition(verseByVerseEditions[0]);
    }

    // Initialize start/end verse with defaults if they're null
    if (
      isVerseByVerseMode &&
      repeatStartVerse === null &&
      repeatEndVerse === null
    ) {
      if (currentVerse) {
        setRepeatStartVerse(currentVerse);
        const endVerse = Math.min(currentVerse + 2, totalVerses);
        setRepeatEndVerse(endVerse);
      } else {
        setRepeatStartVerse(1);
        const endVerse = Math.min(3, totalVerses);
        setRepeatEndVerse(endVerse);
      }
    }
  }, [
    availableReciters,
    selectedReciter,
    setSelectedReciter,
    verseByVerseEditions,
    isVerseByVerseMode,
    selectedAudioEdition,
    setSelectedAudioEdition,
    isInitialPreferencesLoading,
    repeatStartVerse,
    repeatEndVerse,
    setRepeatStartVerse,
    setRepeatEndVerse,
    currentVerse,
    totalVerses,
  ]);

  // Load verse audio URLs when edition changes
  useEffect(() => {
    if (isVerseByVerseMode && selectedAudioEdition) {
      const urls = getSurahAudioVerseByVerse(surahId, selectedAudioEdition);
      setVerseAudioUrls(urls);
    }
  }, [isVerseByVerseMode, selectedAudioEdition, surahId, setVerseAudioUrls]);

  // Store the current verse when it changes
  useEffect(() => {
    if (currentVerse !== null) {
      lastPlayedVerse.current = currentVerse;
    }
  }, [currentVerse]);

  // Always force range start when repeat range is active
  useEffect(() => {
    if (isRepeatRange) {
      forceRangeStart.current = true;
    }
  }, [isRepeatRange]);

  // Handle audio ended event to play next verse or repeat current verse
  useEffect(() => {
    if (!isVerseByVerseMode) return;

    const handleAudioEnded = () => {
      if (currentVerse !== null) {
        // Handle repeating the current verse (non-range mode)
        if (
          !isRepeatRange &&
          repeatCount > 1 &&
          currentRepeat < repeatCount - 1
        ) {
          // Increment repeat counter and play the same verse again
          setCurrentRepeat(currentRepeat + 1);
          setTimeout(() => {
            audioPlayer.play(verseAudioUrls[currentVerse - 1]);
          }, 500);
          return;
        }

        // Handle range repeat mode
        if (
          isRepeatRange &&
          repeatStartVerse !== null &&
          repeatEndVerse !== null &&
          !repeatCycleCompleted.current
        ) {
          // Check if this is the first play of the range and we need to jump to the start verse
          if (forceRangeStart.current && currentVerse < repeatStartVerse) {
            forceRangeStart.current = false;
            setCurrentVerse(repeatStartVerse);

            // Save translation state
            import("@/app/_lib/localStorageUtils").then((utils) => {
              const currentShowTranslation = utils.loadShowTranslation();
              utils.saveShowTranslation(currentShowTranslation);
            });

            // Update URL to track current verse
            router.replace(
              `/surah/${surahId
                .toString()
                .padStart(3, "0")}?ayah=${repeatStartVerse}`,
              { scroll: false }
            );

            // Play the start verse
            setTimeout(() => {
              audioPlayer.play(verseAudioUrls[repeatStartVerse - 1]);
            }, 500);
            return;
          }

          // If we're at the end of the range, go back to start verse unless we've
          // completed all the repeats
          if (currentVerse >= repeatEndVerse) {
            // Check if we need to do another repeat of the range
            if (repeatCount > 1 && currentRepeat < repeatCount - 1) {
              setCurrentRepeat(currentRepeat + 1);
              setCurrentVerse(repeatStartVerse);

              // Save translation state
              import("@/app/_lib/localStorageUtils").then((utils) => {
                const currentShowTranslation = utils.loadShowTranslation();
                utils.saveShowTranslation(currentShowTranslation);
              });

              // Update URL to track current verse
              router.replace(
                `/surah/${surahId
                  .toString()
                  .padStart(3, "0")}?ayah=${repeatStartVerse}`,
                { scroll: false }
              );

              // Play the start verse
              setTimeout(() => {
                audioPlayer.play(verseAudioUrls[repeatStartVerse - 1]);
              }, 800);
              return;
            } else {
              // We've completed all repeats, mark it as completed and stop playback
              repeatCycleCompleted.current = true;
              setCurrentRepeat(0);

              // Stop playback instead of continuing to next verse
              return;
            }
          }

          // We're within the range, so proceed to next verse
          const nextVerse = currentVerse + 1;
          if (nextVerse <= verseAudioUrls.length) {
            setCurrentVerse(nextVerse);

            // Save translation state
            import("@/app/_lib/localStorageUtils").then((utils) => {
              const currentShowTranslation = utils.loadShowTranslation();
              utils.saveShowTranslation(currentShowTranslation);
            });

            // Update URL
            router.replace(
              `/surah/${surahId.toString().padStart(3, "0")}?ayah=${nextVerse}`,
              { scroll: false }
            );
            // Play next verse
            setTimeout(() => {
              audioPlayer.play(verseAudioUrls[nextVerse - 1]);
            }, 800);
            return;
          }
        }

        // Standard verse-by-verse mode (no range, or fallback)
        // Reset repeat counter when moving to next verse
        setCurrentRepeat(0);

        // Check if autoPlayNext is enabled
        if (!autoPlayNext) {
          // Auto-play is disabled, don't proceed to next verse
          return;
        }

        // Move to next verse
        const nextVerse = currentVerse + 1;
        if (nextVerse <= verseAudioUrls.length) {
          // Update current verse
          setCurrentVerse(nextVerse);

          // Save translation state
          import("@/app/_lib/localStorageUtils").then((utils) => {
            const currentShowTranslation = utils.loadShowTranslation();
            utils.saveShowTranslation(currentShowTranslation);
          });

          // Update URL to track current verse
          router.replace(
            `/surah/${surahId.toString().padStart(3, "0")}?ayah=${nextVerse}`,
            { scroll: false }
          );

          // Play next verse audio automatically
          setTimeout(() => {
            audioPlayer.play(verseAudioUrls[nextVerse - 1]);
          }, 800);
        }
      }
    };

    // Use the onEnded method from the audioPlayer hook
    const cleanupFn = audioPlayer.onEnded(handleAudioEnded);

    return cleanupFn;
  }, [
    audioPlayer,
    isVerseByVerseMode,
    currentVerse,
    currentRepeat,
    repeatCount,
    verseAudioUrls,
    router,
    surahId,
    setCurrentVerse,
    isRepeatRange,
    repeatStartVerse,
    repeatEndVerse,
    autoPlayNext,
  ]);

  // Play surah audio
  const handlePlaySurah = () => {
    if (isVerseByVerseMode) {
      if (verseAudioUrls.length > 0) {
        let verseToPlay = currentVerse || 1;

        // If was paused and resuming, continue from the last played verse
        if (lastPlayedVerse.current && !audioPlayer.isPlaying) {
          verseToPlay = lastPlayedVerse.current;
          // Don't reset repeat counter when resuming playback
        }
        // Otherwise, if we're in range repeat mode and have a start verse, use that
        else if (
          isRepeatRange &&
          repeatStartVerse !== null &&
          !repeatCycleCompleted.current
        ) {
          verseToPlay = repeatStartVerse;
          // Make sure we're actually starting from the start verse
          forceRangeStart.current = true;
          // Only reset repeat counter when starting a new playback session
          setCurrentRepeat(0);
        } else {
          // Only reset repeat counter when starting a new playback session
          setCurrentRepeat(0);
        }

        setCurrentVerse(verseToPlay);
        repeatCycleCompleted.current = false; // Reset cycle completed state

        // Save translation state to maintain it
        import("@/app/_lib/localStorageUtils").then((utils) => {
          const currentShowTranslation = utils.loadShowTranslation();
          utils.saveShowTranslation(currentShowTranslation);
        });

        // Update URL to track current verse
        router.replace(
          `/surah/${surahId.toString().padStart(3, "0")}?ayah=${verseToPlay}`,
          { scroll: false }
        );
        audioPlayer.play(verseAudioUrls[verseToPlay - 1]);
      }
    } else if (selectedReciter) {
      const audioUrl = getSurahAudioUrl(selectedReciter, surahId);
      if (audioUrl) {
        audioPlayer.play(audioUrl);
      }
    }
  };

  // Handle reciter change
  const handleReciterChange = (value: string) => {
    if (isVerseByVerseMode) {
      const edition = verseByVerseEditions.find((e) => e.identifier === value);
      if (edition) {
        setSelectedAudioEdition(edition);
      }
    } else {
      const reciterId = Number(value);
      const reciter = availableReciters.find((r) => r.id === reciterId);
      if (reciter) {
        setSelectedReciter(reciter);
      }
    }
  };

  // Handle verse-by-verse mode toggle
  const handlePlaybackModeChange = (value: string) => {
    const newMode = value === "verse-by-verse";

    // Reset audio player
    audioPlayer.stop();

    // Reset repeat state
    repeatCycleCompleted.current = false;
    setCurrentRepeat(0);
    lastPlayedVerse.current = null;
    forceRangeStart.current = false;

    // Set the mode
    setIsVerseByVerseMode(newMode);
    // The useEffect hooks that depend on `isVerseByVerseMode`,
    // `selectedReciter`, and `selectedAudioEdition` will now handle
    // setting a default if necessary (i.e., if no preference was loaded
    // from localStorage for the new mode) and loading verse URLs if applicable.
  };

  // Update the playSpecificVerse function to preserve translation state
  const playSpecificVerse = (verseNumber: number) => {
    if (
      isVerseByVerseMode &&
      verseAudioUrls.length >= verseNumber &&
      verseNumber > 0
    ) {
      // Stop any ongoing playback
      audioPlayer.stop();

      setCurrentVerse(verseNumber);
      lastPlayedVerse.current = verseNumber;

      // Reset repeat counter and cycle status when jumping to a specific verse
      setCurrentRepeat(0);

      // If the verse is outside the repeat range, disable range repeat for now
      if (
        isRepeatRange &&
        repeatStartVerse !== null &&
        repeatEndVerse !== null
      ) {
        if (verseNumber < repeatStartVerse || verseNumber > repeatEndVerse) {
          // Temporarily disable repeat range when playing outside range
          repeatCycleCompleted.current = true;
        } else {
          // Reset repeat cycle if within range
          repeatCycleCompleted.current = false;
        }
      }

      // Save translation preference to maintain it during navigation
      import("@/app/_lib/localStorageUtils").then((utils) => {
        const currentShowTranslation = utils.loadShowTranslation();
        utils.saveShowTranslation(currentShowTranslation);
      });

      // Update URL to track current verse
      router.replace(
        `/surah/${surahId.toString().padStart(3, "0")}?ayah=${verseNumber}`,
        { scroll: false }
      );
      audioPlayer.play(verseAudioUrls[verseNumber - 1]);
    }
  };

  // Handle previous verse button
  const handlePreviousVerse = () => {
    if (isVerseByVerseMode && currentVerse !== null && currentVerse > 1) {
      const prevVerse = currentVerse - 1;
      playSpecificVerse(prevVerse);
    }
  };

  // Handle next verse button
  const handleNextVerse = () => {
    if (isVerseByVerseMode && currentVerse !== null) {
      const nextVerse = currentVerse + 1;
      if (nextVerse <= verseAudioUrls.length) {
        playSpecificVerse(nextVerse);
      }
    }
  };

  // Handle setting repeat count
  const handleSetRepeatCount = (count: number) => {
    setRepeatCount(count);
    setCurrentRepeat(0); // Reset current repeat counter
    repeatCycleCompleted.current = false; // Reset cycle completed state
  };

  // Toggle range repeat mode
  const handleToggleRangeRepeat = (checked: boolean) => {
    // Always pause current playback when toggling repeat range
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    }

    setIsRepeatRange(checked);
    repeatCycleCompleted.current = false; // Reset cycle completed state

    if (checked) {
      // Always force start from the start verse when enabling range mode
      forceRangeStart.current = true;

      // Clear the last played verse to ensure we start from range start
      lastPlayedVerse.current = null;

      if (repeatStartVerse === null || repeatEndVerse === null) {
        // Default to current verse as start if available
        const start = currentVerse || 1;
        const end = Math.min(start + 2, totalVerses);
        setRepeatStartVerse(start);
        setRepeatEndVerse(end);
      }
    }
  };

  // Handle replaying current verse
  const handleReplayVerse = () => {
    if (isVerseByVerseMode && currentVerse !== null) {
      setCurrentRepeat(0); // Reset repeat counter
      repeatCycleCompleted.current = false; // Reset cycle completed state
      audioPlayer.play(verseAudioUrls[currentVerse - 1]);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioPlayer.setVolume(newVolume / 100);

    // Save volume to local storage
    import("@/app/_lib/localStorageUtils").then((utils) => {
      utils.saveAudioVolume(newVolume);
    });
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume === 0) {
      setVolume(100);
      audioPlayer.setVolume(1);
    } else {
      setVolume(0);
      audioPlayer.setVolume(0);
    }
  };

  // Handle seeking in audio
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    audioPlayer.seek(newTime);
  };

  // Toggle mobile volume slider visibility
  const toggleMobileVolumeSlider = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event propagation
    setShowMobileVolumeSlider(!showMobileVolumeSlider);
  };

  // Handle clicks outside the volume slider to hide it
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        mobileVolumeRef.current &&
        !mobileVolumeRef.current.contains(event.target as Node)
      ) {
        setShowMobileVolumeSlider(false);
      }
    };

    if (showMobileVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileVolumeSlider]);

  if (!showAudioPlayer) {
    return null;
  }

  if (recitersLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t border-border p-4 rtl flex items-center justify-center z-50">
        <Card className="flex items-center justify-center p-4 w-full max-w-lg mx-auto shadow-lg rounded-lg">
          <Loader2 className="animate-spin h-6 w-6 text-primary ml-3" />
          <span className="text-lg font-medium">جاري تحميل القراء...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 shadow-lg border-t border-border/80 rtl z-50 backdrop-blur-md  overflow-y-auto">
      {/* Interactive progress bar - Always visible - Modified for small screens */}
      <div className="w-full px-2 sm:px-4 pt-1 sm:pt-2 pb-0 sm:pb-1">
        {/* Time indicators for small screens - now above progress bar */}
        <div className="flex justify-between items-center mb-1 sm:hidden">
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatTime(audioPlayer.currentTime)}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {formatTime(audioPlayer.duration)}
          </span>
        </div>

        {/* Progress bar row - time indicators only visible on larger screens */}
        <div className="flex items-center gap-1 sm:gap-3">
          <span className="hidden sm:block text-[10px] sm:text-xs font-mono text-muted-foreground w-8 sm:w-12 text-center">
            {formatTime(audioPlayer.currentTime)}
          </span>
          <Slider
            dir="rtl"
            value={[audioPlayer.currentTime]}
            min={0}
            max={audioPlayer.duration || 100}
            step={0.1}
            onValueChange={(value) => handleSeek(value)}
            className="cursor-pointer flex-1"
            disabled={audioPlayer.duration === 0}
          />
          <span className="hidden sm:block text-[10px] sm:text-xs font-mono text-muted-foreground w-8 sm:w-12 text-center">
            {formatTime(audioPlayer.duration)}
          </span>
        </div>
      </div>

      {/* Current verse indicator - Show at top when in verse-by-verse mode */}
      <div className="flex justify-between items-center border-b border-border/20 bg-primary/5 px-2 sm:px-4 py-0.5 sm:py-1">
        {isVerseByVerseMode && currentVerse ? (
          <div className="w-full">
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
              <span className="font-medium">
                الآية: {toArabicDigits(currentVerse)}
              </span>
              {repeatCount > 1 && !isRepeatRange && (
                <span className="text-[10px] sm:text-xs bg-primary/10 px-1 sm:px-2 py-0.5 rounded-full">
                  تكرار: {toArabicDigits(currentRepeat + 1)}/
                  {toArabicDigits(repeatCount)}
                </span>
              )}
              {isRepeatRange &&
                repeatStartVerse !== null &&
                repeatEndVerse !== null && (
                  <span className="text-[10px] sm:text-xs bg-primary/10 px-1 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                    {toArabicDigits(repeatStartVerse)}-
                    {toArabicDigits(repeatEndVerse)}:{" "}
                    {toArabicDigits(currentRepeat + 1)}/
                    {toArabicDigits(repeatCount)}
                  </span>
                )}
            </div>
          </div>
        ) : (
          <span></span>
        )}

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClosePlayer}
          className="h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 bg-primary/10"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* MOBILE VIEW: Complete redesign with more compact, organized layout */}
      <div className="sm:hidden flex flex-col px-3 py-2 w-full gap-3">
        {/* Playback mode selection - Improved mobile style */}
        <RadioGroup
          defaultValue={isVerseByVerseMode ? "verse-by-verse" : "full-surah"}
          className="flex justify-center bg-primary/5 rounded-full p-0.5 mx-auto w-[230px]"
          onValueChange={handlePlaybackModeChange}
          value={isVerseByVerseMode ? "verse-by-verse" : "full-surah"}
        >
          <div className="flex items-center space-x-1 space-x-reverse flex-1">
            <RadioGroupItem
              value="full-surah"
              id="full-surah-mobile"
              className="sr-only"
            />
            <label
              htmlFor="full-surah-mobile"
              className={`text-xs font-medium cursor-pointer py-1.5 px-4 rounded-full w-full text-center ${
                !isVerseByVerseMode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80"
              }`}
            >
              سورة كاملة
            </label>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse flex-1">
            <RadioGroupItem
              value="verse-by-verse"
              id="verse-by-verse-mobile"
              className="sr-only"
            />
            <label
              htmlFor="verse-by-verse-mobile"
              className={`text-xs font-medium cursor-pointer py-1.5 px-4 rounded-full w-full text-center ${
                isVerseByVerseMode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80"
              }`}
            >
              آية بآية
            </label>
          </div>
        </RadioGroup>

        {/* Reciter selector - Mobile optimized */}
        <div className="px-1">
          <Select
            value={
              isVerseByVerseMode
                ? selectedAudioEdition?.identifier || ""
                : selectedReciter?.id?.toString() || ""
            }
            onValueChange={handleReciterChange}
            dir="rtl"
          >
            <SelectTrigger
              id="reciter-select-mobile"
              className="w-full text-xs h-9 bg-background/80 text-foreground border-border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <SelectValue
                  placeholder={
                    isVerseByVerseMode
                      ? "اختر القارئ (آية بآية)"
                      : "اختر القارئ"
                  }
                />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border max-h-[300px] z-50 rounded-lg text-xs">
              {isVerseByVerseMode
                ? verseByVerseEditions.map((edition) => (
                    <SelectItem
                      key={edition.identifier}
                      value={edition.identifier}
                      className="focus:bg-primary/10 focus:text-foreground"
                    >
                      {edition.name}
                    </SelectItem>
                  ))
                : availableReciters.map((reciter) => (
                    <SelectItem
                      key={reciter.id}
                      value={reciter.id.toString()}
                      className="focus:bg-primary/10 focus:text-foreground"
                    >
                      {reciter.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile play controls with improved layout */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center">
            {/* Volume toggle with better visibility and slider popup */}
            <div ref={mobileVolumeRef} className="relative">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-primary/20"
                onClick={toggleMobileVolumeSlider}
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-primary" />
                ) : volume < 50 ? (
                  <Volume1 className="h-4 w-4 text-primary" />
                ) : (
                  <Volume2 className="h-4 w-4 text-primary" />
                )}
              </Button>

              {/* Mobile volume slider popup - repositioned to avoid going offscreen */}
              {showMobileVolumeSlider && (
                <div className="absolute bottom-11 right-0 bg-background shadow-lg border border-border rounded-lg p-3 w-[160px] z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Volume1 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Main playback controls - Mobile optimized */}
          <div className="flex items-center gap-3">
            {isVerseByVerseMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousVerse}
                disabled={!currentVerse || currentVerse <= 1}
                className="h-10 w-10 rounded-full border-primary/20"
              >
                <SkipForward className="h-4.5 w-4.5" />
              </Button>
            )}

            <Button
              variant={audioPlayer.isPlaying ? "secondary" : "default"}
              size="icon"
              onClick={
                audioPlayer.isPlaying ? audioPlayer.pause : handlePlaySurah
              }
              disabled={
                isVerseByVerseMode ? !selectedAudioEdition : !selectedReciter
              }
              className={cn(
                "h-12 w-12 rounded-full",
                audioPlayer.isPlaying
                  ? "hover:bg-secondary/90"
                  : "hover:bg-primary/90",
                "shadow-md focus:ring-2 focus:ring-primary/30"
              )}
            >
              {audioPlayer.isLoading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : audioPlayer.isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 mr-0.5" />
              )}
            </Button>

            {isVerseByVerseMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextVerse}
                disabled={
                  !currentVerse || currentVerse >= verseAudioUrls.length
                }
                className="h-10 w-10 rounded-full border-primary/20"
              >
                <SkipBack className="h-4.5 w-4.5" />
              </Button>
            )}
          </div>

          {/* Options menu - Mobile optimized */}
          {isVerseByVerseMode ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-primary/20"
                >
                  <Repeat className="h-4 w-4 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleReplayVerse}
                  className="flex gap-2 cursor-pointer"
                  dir={"rtl"}
                >
                  <Repeat className="h-4 w-4" />
                  <span>إعادة الآية الحالية</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <RepeatOptions
                  isRepeatRange={isRepeatRange}
                  setIsRepeatRange={handleToggleRangeRepeat}
                  repeatStartVerse={repeatStartVerse}
                  setRepeatStartVerse={setRepeatStartVerse}
                  repeatEndVerse={repeatEndVerse}
                  setRepeatEndVerse={setRepeatEndVerse}
                  repeatCount={repeatCount}
                  setRepeatCount={handleSetRepeatCount}
                  totalVerses={totalVerses}
                  onPause={
                    audioPlayer.isPlaying ? audioPlayer.pause : undefined
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="w-9"></div> /* Empty placeholder for alignment */
          )}
        </div>
      </div>

      {/* DESKTOP VIEW: Original layout with minor enhancements */}
      <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between px-4 py-3 w-full max-w-6xl mx-auto gap-0">
        {/* Player info with reciter selector */}
        <div className="flex flex-col gap-2 min-w-0 order-1">
          {/* Playback mode selection */}
          <RadioGroup
            defaultValue={isVerseByVerseMode ? "verse-by-verse" : "full-surah"}
            className="flex justify-start gap-4 mb-2"
            onValueChange={handlePlaybackModeChange}
            value={isVerseByVerseMode ? "verse-by-verse" : "full-surah"}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem
                value="full-surah"
                id="full-surah"
                className="h-4 w-4"
              />
              <label
                htmlFor="full-surah"
                className="text-sm font-medium cursor-pointer ml-2"
              >
                سورة كاملة
              </label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem
                value="verse-by-verse"
                id="verse-by-verse"
                className="h-4 w-4"
              />
              <label
                htmlFor="verse-by-verse"
                className="text-sm font-medium cursor-pointer ml-2"
              >
                آية بآية
              </label>
            </div>
          </RadioGroup>

          {/* Reciter selector */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <Select
              value={
                isVerseByVerseMode
                  ? selectedAudioEdition?.identifier || ""
                  : selectedReciter?.id?.toString() || ""
              }
              onValueChange={handleReciterChange}
              dir="rtl"
            >
              <SelectTrigger
                id="reciter-select"
                className="w-[200px] text-base h-10 bg-background/80 text-foreground border-border rounded-lg"
              >
                <SelectValue
                  placeholder={
                    isVerseByVerseMode
                      ? "اختر القارئ (آية بآية)"
                      : "اختر القارئ"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground border-border max-h-[300px] z-50 rounded-lg text-base">
                {isVerseByVerseMode
                  ? verseByVerseEditions.map((edition) => (
                      <SelectItem
                        key={edition.identifier}
                        value={edition.identifier}
                        className="focus:bg-primary/10 focus:text-foreground"
                      >
                        {edition.name}
                      </SelectItem>
                    ))
                  : availableReciters.map((reciter) => (
                      <SelectItem
                        key={reciter.id}
                        value={reciter.id.toString()}
                        className="focus:bg-primary/10 focus:text-foreground"
                      >
                        {reciter.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop view: Main controls - centered */}
        <div className="flex items-center justify-center gap-3 order-2">
          {isVerseByVerseMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousVerse}
              disabled={!currentVerse || currentVerse <= 1}
              className="h-10 w-10 rounded-full"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant={audioPlayer.isPlaying ? "secondary" : "default"}
            size="icon"
            onClick={
              audioPlayer.isPlaying ? audioPlayer.pause : handlePlaySurah
            }
            disabled={
              isVerseByVerseMode ? !selectedAudioEdition : !selectedReciter
            }
            className={cn(
              "h-14 w-14 rounded-full",
              audioPlayer.isPlaying
                ? "hover:bg-secondary/90"
                : "hover:bg-primary/90",
              "focus:ring-2 focus:ring-primary/30"
            )}
          >
            {audioPlayer.isLoading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : audioPlayer.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 mr-0.5" />
            )}
          </Button>

          {isVerseByVerseMode && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextVerse}
              disabled={!currentVerse || currentVerse >= verseAudioUrls.length}
              className="h-10 w-10 rounded-full"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}

          {/* Additional options for verse-by-verse mode on desktop */}
          {isVerseByVerseMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleReplayVerse}
                  className="flex gap-2 cursor-pointer"
                  dir={"rtl"}
                >
                  <Repeat className="h-4 w-4" />
                  <span>إعادة الآية الحالية</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <RepeatOptions
                  isRepeatRange={isRepeatRange}
                  setIsRepeatRange={handleToggleRangeRepeat}
                  repeatStartVerse={repeatStartVerse}
                  setRepeatStartVerse={setRepeatStartVerse}
                  repeatEndVerse={repeatEndVerse}
                  setRepeatEndVerse={setRepeatEndVerse}
                  repeatCount={repeatCount}
                  setRepeatCount={handleSetRepeatCount}
                  totalVerses={totalVerses}
                  onPause={
                    audioPlayer.isPlaying ? audioPlayer.pause : undefined
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Desktop: Volume control */}
        <div className="flex items-center justify-end order-3">
          {/* Volume control with container for proper RTL orientation */}
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full transition-colors"
              onClick={toggleMute}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 50 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <div className="w-24 dir-ltr">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
