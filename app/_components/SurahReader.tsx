"use client";

import AudioPlayer from "@/app/_components/AudioPlayer";
import { useBookmarks } from "@/app/_hooks/useBookmarks";
import {
  usePaginatedSurahDetail,
  useSurahList,
  useSurahTranslation,
} from "@/app/_hooks/useQuranData";
import { useTheme } from "@/app/_hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Copy,
  Maximize2,
  MoreHorizontal,
  Share,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Function to convert Western digits to Arabic digits
const toArabicDigits = (num: number): string => {
  if (num === 0) return ""; // If the number is just 0, return empty string

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicDigits[parseInt(digit)])
    .join("");
};

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

  // Use the pagination hooks from useVersePages
  const { visibleVerses: verses, loadMore, hasMore } = useVersePages();

  const [showTranslation, setShowTranslation] = useState(false);
  const [activeVerse, setActiveVerse] = useState<number | null>(initialAyah);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [highlightedBookmark, setHighlightedBookmark] = useState<number | null>(
    initialAyah
  );
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loadingRef.current && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.5 }
      );

      observerRef.current.observe(loadingRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [hasMore, loadMore]);

  // Add useEffect to handle URL parameter changes
  useEffect(() => {
    // Only run this after initial load and when verses are available
    if (verses.length === 0 || initialScrollDone) return;

    // If initial ayah is set from URL, handle initial scroll
    if (initialAyah && verseRefs.current[initialAyah]) {
      setTimeout(() => {
        const verseElement = verseRefs.current[initialAyah];
        if (verseElement) {
          verseElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setActiveVerse(initialAyah);

          // Only set highlighted bookmark if it's actually bookmarked
          if (isVerseBookmarked(surahId, initialAyah)) {
            setHighlightedBookmark(initialAyah);
          }

          // Mark initial scroll as complete
          setInitialScrollDone(true);
        }
      }, 300);
    } else {
      // If no initial ayah or it's not found yet, mark as done if we have verses
      if (verses.length > 0) {
        setInitialScrollDone(true);
      }
    }
  }, [
    initialAyah,
    verses.length,
    surahId,
    initialScrollDone,
    isVerseBookmarked,
  ]);

  // Reset scroll state when surah changes
  useEffect(() => {
    // Clear highlighted bookmark and reset scroll state when changing surahs
    return () => {
      setHighlightedBookmark(null);
      setInitialScrollDone(false);
    };
  }, [surahId]);

  // Function to handle showing/hiding translation
  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Function to handle reading mode
  const handleReadingMode = () => {
    setReadingMode(!readingMode);
  };

  // Function to handle audio player visibility
  const handleToggleAudioPlayer = () => {
    setShowAudioPlayer(!showAudioPlayer);
  };

  // Function to handle verse click
  function handleVerseClick(verseId: number) {
    // Toggle verse selection
    if (activeVerse === verseId) {
      setActiveVerse(null);
      // Remove ayah parameter from URL
      router.replace(`/surah/${surahId}`, { scroll: false });
    } else {
      setActiveVerse(verseId);
      // Update URL with the new ayah
      router.replace(`/surah/${surahId}?ayah=${verseId}`, { scroll: false });
    }
  }

  // Function to copy verse
  function copyVerse(verseId: number, verseText: string) {
    const surahName = metadata?.titleAr || "";
    const textToCopy = `${surahName} (${surahId}:${toArabicDigits(
      verseId
    )})\n${verseText}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedVerse(verseId);
      setTimeout(() => setCopiedVerse(null), 2000);
    });
  }

  // Function to bookmark verse - now passes verse text
  function handleToggleBookmark(verseId: number, verseText: string) {
    const isCurrentlyBookmarked = isVerseBookmarked(surahId, verseId);
    toggleBookmark(surahId, verseId, verseText);

    // If adding bookmark, highlight it (but don't interfere with active verse)
    if (!isCurrentlyBookmarked) {
      setHighlightedBookmark(verseId);
    } else if (highlightedBookmark === verseId) {
      // If removing currently highlighted bookmark, clear highlight
      setHighlightedBookmark(null);
    }
  }

  // Function to share verse (if Web Share API is available)
  function shareVerse(verseId: number, verseText: string) {
    const surahName = metadata?.titleAr || "";
    const textToShare = `${surahName} (${surahId}:${toArabicDigits(
      verseId
    )})\n${verseText}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${surahName} - آية ${toArabicDigits(verseId)}`,
          text: textToShare,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err));
    } else {
      // Fallback to copy if share API is not available
      copyVerse(verseId, verseText);
    }
  }

  // Get appropriate reading mode classes based on theme
  const getReadingModeClasses = () => {
    if (!readingMode) return "";

    return theme === "dark"
      ? "reading-mode bg-zinc-900 text-amber-50"
      : "reading-mode bg-amber-50 text-zinc-900";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            عذراً، لم يتم العثور على السورة
          </h2>
          <Link
            href="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

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
              {showAudioPlayer ? "إخفاء القراءة الصوتية" : "الاستماع للقراءة"}
            </button>
          </div>

          {translationError && showTranslation && (
            <div className="mt-2 text-sm text-red-500">{translationError}</div>
          )}

          {showAudioPlayer && (
            <div className="mt-6">
              <AudioPlayer surahId={parseInt(surahId)} />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {verses.map((verse) => (
          <div
            key={verse.id}
            id={`verse-${verse.id}`}
            ref={(el) => {
              verseRefs.current[verse.id] = el;
            }}
            className={`verse-container transition-colors ${
              activeVerse === verse.id
                ? "bg-primary/10 ring-1 ring-primary rounded-lg"
                : ""
            } ${readingMode ? "my-8" : ""} ${
              isVerseBookmarked(surahId, verse.id)
                ? "border-r-4 border-primary"
                : ""
            } ${
              highlightedBookmark === verse.id && activeVerse !== verse.id
                ? "bg-amber-100/50 dark:bg-amber-900/20"
                : ""
            }`}
            onClick={() => handleVerseClick(verse.id)}
          >
            <div
              className={`${
                readingMode
                  ? "bg-transparent shadow-none border-none p-2"
                  : "bg-card rounded-lg p-6 shadow-sm border border-border"
              } cursor-pointer relative`}
            >
              <div className="flex items-start">
                {verse.id !== 0 && (
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      readingMode
                        ? theme === "dark"
                          ? "bg-zinc-800 text-amber-400"
                          : "bg-amber-100 text-amber-800"
                        : "bg-primary/10 text-primary"
                    } text-sm font-medium ml-3 mt-1 relative`}
                  >
                    {toArabicDigits(verse.id)}
                    {isVerseBookmarked(surahId, verse.id) && (
                      <Bookmark
                        size={12}
                        className="absolute -top-1 -right-1 fill-primary text-primary"
                      />
                    )}
                  </span>
                )}
                <div className="flex-1">
                  <p
                    className={`${
                      readingMode ? "text-2xl" : "text-xl"
                    } leading-relaxed font-quran`}
                  >
                    {verse.text}
                  </p>

                  {showTranslation && translation[verse.id] && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p
                        className={`${
                          readingMode ? "text-lg" : ""
                        } text-muted-foreground`}
                      >
                        {translation[verse.id]}
                      </p>
                    </div>
                  )}
                </div>

                {!readingMode && (
                  <div className="relative" dir="ltr">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 rounded-full hover:bg-muted transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="text-right">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              copyVerse(verse.id, verse.text);
                            }}
                            className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                          >
                            {copiedVerse === verse.id ? (
                              <>
                                <CheckCircle2
                                  size={16}
                                  className="text-green-500"
                                />
                                <span>تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                <span>نسخ الآية</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleBookmark(verse.id, verse.text);
                            }}
                            className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                          >
                            <Bookmark
                              size={16}
                              className={
                                isVerseBookmarked(surahId, verse.id)
                                  ? "fill-primary text-primary"
                                  : ""
                              }
                            />
                            <span>
                              {isVerseBookmarked(surahId, verse.id)
                                ? "إزالة المرجعية"
                                : "إضافة للمرجعيات"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              shareVerse(verse.id, verse.text);
                            }}
                            className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                          >
                            <Share size={16} />
                            <span>مشاركة</span>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator that triggers loading more verses */}
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
