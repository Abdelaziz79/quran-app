"use client";

import AudioPlayer from "@/app/_components/AudioPlayer";
import { AyahVerse } from "@/app/_components/AyahVerse";
import ErrorComp from "@/app/_components/ErrorComp";
import Loading from "@/app/_components/Loading";
import { getSurahAudioVerseByVerse } from "@/app/_hooks/AlQuranApi";
import { useQuranAudioContext } from "@/app/_hooks/QuranAudioProvider";
import { useBookmarks } from "@/app/_hooks/useBookmarks";
import {
  usePaginatedSurahDetail,
  useSurahList,
  useSurahTranslation,
} from "@/app/_hooks/useQuranData";
import { useTheme } from "@/app/_hooks/useTheme";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { Bookmark, ChevronRight, Maximize2, Volume2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SurahReader({ surahId }: { surahId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ayahParam = searchParams.get("ayah");

  const initialAyah = ayahParam ? parseInt(ayahParam) : null;

  const { surahs } = useSurahList();
  const { metadata, isLoading, error, useVersePages } = usePaginatedSurahDetail(
    surahId,
    20
  );
  const { translation, error: translationError } = useSurahTranslation(surahId);
  const { isVerseBookmarked, toggleBookmark } = useBookmarks(surahs);
  const { theme } = useTheme();

  const {
    isVerseByVerseMode,
    setCurrentVerse,
    currentVerse,
    verseAudioUrls,
    audioPlayer,
    setIsVerseByVerseMode,
    setVerseAudioUrls,
    selectedAudioEdition,
    setCurrentSurah,
  } = useQuranAudioContext();

  const {
    visibleVerses: verses,
    loadMore,
    hasMore,
    ensureVerseIsLoaded,
  } = useVersePages();

  const [showTranslation, setShowTranslation] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(initialAyah);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [highlightedBookmark, setHighlightedBookmark] = useState<number | null>(
    initialAyah
  );
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [openDropdownVerseId, setOpenDropdownVerseId] = useState<number | null>(
    null
  );

  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const isRecitingVerse = useRef(false);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loadingRef.current && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            // Load multiple pages at once for smoother experience
            loadMore();
            // Try to load one more batch if available
            setTimeout(() => {
              if (hasMore) loadMore();
            }, 100);
          }
        },
        { threshold: 0.5 }
      );
      observerRef.current.observe(loadingRef.current);
      return () => observerRef.current?.disconnect();
    }
  }, [hasMore, loadMore]);

  // Initial load of ayah if specified in URL
  useEffect(() => {
    if (initialAyah && !initialScrollDone && verses.length > 0) {
      ensureVerseIsLoaded(initialAyah);
    }
  }, [initialAyah, initialScrollDone, ensureVerseIsLoaded, verses.length]);

  // Handle initial scroll and URL parameter changes
  useEffect(() => {
    if (verses.length === 0 || initialScrollDone) return;

    if (initialAyah) {
      // Ensure the requested ayah is loaded
      const wasLoaded = ensureVerseIsLoaded(initialAyah);

      // If we had to load more verses, wait for next render when they're available
      if (wasLoaded) {
        return;
      }

      setTimeout(() => {
        const verseElement = verseRefs.current[initialAyah];
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setActiveVerse(initialAyah);
          if (isVerseByVerseMode) {
            setCurrentVerse(initialAyah);
          }
          if (isVerseBookmarked(surahId, initialAyah))
            setHighlightedBookmark(initialAyah);

          setInitialScrollDone(true);
        } else {
          // If verse element not found yet, try once more in next render cycle
          // This helps when direct URL navigation occurs
          setTimeout(() => {
            const verseElement = verseRefs.current[initialAyah];
            if (verseElement) {
              verseElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              setInitialScrollDone(true);
            }
          }, 500);
        }
      }, 300);
    } else if (verses.length > 0) {
      setInitialScrollDone(true);
    }
  }, [
    initialAyah,
    verses.length,
    surahId,
    initialScrollDone,
    isVerseBookmarked,
    isVerseByVerseMode,
    setCurrentVerse,
    ensureVerseIsLoaded,
  ]);

  // Scroll to current verse during verse-by-verse audio playback
  useEffect(() => {
    if (isVerseByVerseMode && currentVerse && verseRefs.current[currentVerse]) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setActiveVerse(currentVerse);

      router.replace(`/surah/${surahId}?ayah=${currentVerse}`, {
        scroll: false,
      });
    }
  }, [currentVerse, isVerseByVerseMode, router, surahId]);

  // Reset scroll state on surah change
  useEffect(() => {
    return () => {
      setHighlightedBookmark(null);
      setInitialScrollDone(false);
    };
  }, [surahId]);

  // Auto-play verse after audio URLs are loaded
  useEffect(() => {
    if (
      isRecitingVerse.current &&
      isVerseByVerseMode &&
      verseAudioUrls.length > 0 &&
      currentVerse
    ) {
      isRecitingVerse.current = false;
      audioPlayer.play(verseAudioUrls[currentVerse - 1]);
    }
  }, [isVerseByVerseMode, verseAudioUrls, currentVerse, audioPlayer]);

  // Ensure audio player has URLs when shown
  useEffect(() => {
    if (
      showAudioPlayer &&
      isVerseByVerseMode &&
      currentVerse &&
      verseAudioUrls.length === 0 &&
      selectedAudioEdition
    ) {
      const urls = getSurahAudioVerseByVerse(
        parseInt(surahId),
        selectedAudioEdition
      );

      setVerseAudioUrls(urls);
    }
  }, [
    showAudioPlayer,
    isVerseByVerseMode,
    currentVerse,
    verseAudioUrls.length,
    selectedAudioEdition,
    surahId,
    setVerseAudioUrls,
  ]);

  const handleToggleTranslation = () => setShowTranslation(!showTranslation);
  const handleReadingMode = () => setReadingMode(!readingMode);
  const handleToggleAudioPlayer = () => setShowAudioPlayer(!showAudioPlayer);

  function handleVerseClick(verseId: number) {
    if (activeVerse === verseId) {
      setActiveVerse(null);
      router.replace(`/surah/${surahId}`, { scroll: false });
    } else {
      setActiveVerse(verseId);

      router.replace(`/surah/${surahId}?ayah=${verseId}`, { scroll: false });
      if (
        isVerseByVerseMode &&
        showAudioPlayer &&
        verseAudioUrls.length >= verseId
      ) {
        setCurrentVerse(verseId);
      }
    }
  }

  function copyVerse(verseId: number, verseText: string) {
    const surahName = metadata?.titleAr || "";
    const textToCopy = `${surahName} (${toArabicDigits(
      parseInt(surahId)
    )}:${toArabicDigits(verseId)})\n${verseText}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedVerse(verseId);
      setTimeout(() => setCopiedVerse(null), 2000);
    });
  }

  function handleToggleBookmark(verseId: number, verseText: string) {
    const isCurrentlyBookmarked = isVerseBookmarked(surahId, verseId);
    toggleBookmark(surahId, verseId, verseText);
    if (!isCurrentlyBookmarked) {
      setHighlightedBookmark(verseId);
    } else if (highlightedBookmark === verseId) {
      setHighlightedBookmark(null);
    }
  }

  function shareVerse(verseId: number, verseText: string) {
    const surahName = metadata?.titleAr || "";
    const textToShare = `${surahName} (${surahId}:${toArabicDigits(
      verseId
    )})\n${verseText}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${toArabicDigits(parseInt(surahId))} - آية ${toArabicDigits(
            verseId
          )}`,
          text: textToShare,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      copyVerse(verseId, verseText);
    }
  }

  function reciteVerse(verseId: number) {
    setOpenDropdownVerseId(null);
    setShowAudioPlayer(true);
    setIsVerseByVerseMode(true);
    isRecitingVerse.current = true;
    setCurrentSurah(parseInt(surahId));

    setCurrentVerse(verseId);
    setActiveVerse(verseId);

    const urls = getSurahAudioVerseByVerse(
      parseInt(surahId),
      selectedAudioEdition ?? {
        identifier: "ar.husary",
        availableBitrates: [64, 128],
      }
    );
    setVerseAudioUrls(urls);

    router.replace(`/surah/${surahId}?ayah=${verseId}`, { scroll: false });
    verseRefs.current[verseId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (urls.length >= verseId) {
      setTimeout(() => {
        audioPlayer.play(urls[verseId - 1]);
        isRecitingVerse.current = false;
      }, 100);
    }
  }

  const getReadingModeClasses = () =>
    readingMode
      ? theme === "dark"
        ? "reading-mode bg-zinc-900 text-amber-50"
        : "reading-mode bg-amber-50 text-zinc-900"
      : "";

  if (isLoading) return <Loading />;
  if (error) return <ErrorComp error={error} />;
  if (!metadata) return <ErrorComp error="عذراً، لم يتم العثور على السورة" />;

  return (
    <div
      className={`container mx-auto py-6 max-w-4xl ${getReadingModeClasses()}`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/"
            className="flex items-center text-primary hover:underline"
          >
            <ChevronRight className="ml-1 h-4 w-4" />
            <span>العودة إلى قائمة السور</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/bookmarks"
              className="flex items-center text-primary hover:underline"
            >
              <Bookmark className="ml-1 h-4 w-4" />
              <span>المرجعيات المحفوظة</span>
            </Link>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{metadata.titleAr}</h1>
          <p className="text-lg text-muted-foreground">{metadata.title}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleToggleTranslation}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {showTranslation ? "إخفاء التفسير" : "إظهار التفسير"}
            </button>
            <button
              onClick={handleReadingMode}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors flex items-center gap-1"
            >
              <Maximize2 size={16} />
              {readingMode ? "إنهاء وضع القراءة" : "وضع القراءة"}
            </button>
            <button
              onClick={handleToggleAudioPlayer}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors flex items-center gap-1"
            >
              <Volume2 size={16} />
              {showAudioPlayer ? "إنهاء الاستماع" : "الاستماع للقراءة"}
            </button>
          </div>
          {translationError && showTranslation && (
            <div className="mt-2 text-sm text-red-500">{translationError}</div>
          )}
          {showAudioPlayer && (
            <div className="mt-6">
              <AudioPlayer
                onVisibilityChange={(isVisible) =>
                  setShowAudioPlayer(isVisible)
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {verses.map((verse) => (
          <AyahVerse
            key={verse.id}
            verse={verse}
            translationText={translation[verse.id]}
            showTranslation={showTranslation}
            isActive={activeVerse === verse.id}
            isBookmarked={isVerseBookmarked(surahId, verse.id)}
            isHighlightedBookmark={highlightedBookmark === verse.id}
            readingMode={readingMode}
            theme={theme}
            isCopied={copiedVerse === verse.id}
            dropdownOpen={openDropdownVerseId === verse.id}
            onVerseClick={handleVerseClick}
            onCopy={copyVerse}
            onToggleBookmark={handleToggleBookmark}
            onShare={shareVerse}
            onRecite={reciteVerse}
            onDropdownToggle={(isOpen) => {
              if (isOpen) {
                setOpenDropdownVerseId(verse.id);
              } else if (openDropdownVerseId === verse.id) {
                // Only close if it's this one
                setOpenDropdownVerseId(null);
              }
            }}
            setVerseRef={(el) => {
              verseRefs.current[verse.id] = el;
            }}
          />
        ))}

        {hasMore && (
          <div
            ref={loadingRef}
            className="flex justify-center p-4 items-center"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
