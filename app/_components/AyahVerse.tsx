"use client";

import { useQuranSettings } from "@/app/_hooks/QuranSettingsProvider";
import { toArabicDigits } from "@/app/_lib/quranUtils";
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
  Copy,
  MoreHorizontal,
  PlayCircle,
  Share,
} from "lucide-react";

interface AyahVerseProps {
  verse: { id: number; text: string };
  translationText?: string;
  showTranslation: boolean;
  isActive: boolean;
  isBookmarked: boolean;
  isHighlightedBookmark: boolean;
  readingMode: boolean;
  theme: string;
  isCopied: boolean;
  dropdownOpen: boolean;
  onVerseClick: (verseId: number) => void;
  onCopy: (verseId: number, verseText: string) => void;
  onToggleBookmark: (verseId: number, verseText: string) => void;
  onShare: (verseId: number, verseText: string) => void;
  onRecite: (verseId: number) => void;
  onDropdownToggle: (isOpen: boolean) => void;
  setVerseRef: (el: HTMLDivElement | null) => void;
  showOptions?: boolean;
}

export function AyahVerse({
  verse,
  translationText,
  showTranslation,
  isActive,
  isBookmarked,
  isHighlightedBookmark,
  readingMode,
  theme,
  isCopied,
  dropdownOpen,
  onVerseClick,
  onCopy,
  onToggleBookmark,
  onShare,
  onRecite,
  onDropdownToggle,
  setVerseRef,
  showOptions,
}: AyahVerseProps) {
  // Use Quran font settings
  const { fontClass, fontSizeClass, lineHeightClass } = useQuranSettings();

  if (verse.id === 0 && !verse.text) {
    // Handle potential bismillah placeholder if not needed
    return null;
  }

  return (
    <div
      id={`verse-${verse.id}`}
      ref={setVerseRef}
      className={`verse-container transition-colors ${
        isActive ? "bg-primary/10 ring-1 ring-primary rounded-lg" : ""
      } ${readingMode ? "my-8" : ""} ${
        isBookmarked ? "border-r-4 border-primary" : ""
      } ${
        isHighlightedBookmark && !isActive
          ? "bg-amber-100/50 dark:bg-amber-900/20"
          : ""
      }`}
      onClick={() => onVerseClick(verse.id)}
    >
      <div
        className={`${
          readingMode
            ? "bg-transparent shadow-none border-none p-2"
            : "bg-card rounded-lg p-6 shadow-sm border border-border"
        } cursor-pointer relative`}
      >
        <div className="flex items-start">
          <div className="flex-1">
            <p
              className={`${
                readingMode ? fontSizeClass : fontSizeClass
              } ${lineHeightClass} ${fontClass}`}
            >
              {verse.text}

              {verse.id !== 0 && (
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    readingMode
                      ? theme === "dark"
                        ? "bg-zinc-800 text-amber-400"
                        : "bg-amber-100 text-amber-800"
                      : "bg-primary/10 text-primary"
                  } text-xl font-medium mx-2 relative align-middle `}
                >
                  {toArabicDigits(verse.id)}
                  {isBookmarked && (
                    <Bookmark
                      size={12}
                      className="absolute -top-1 -right-1 fill-primary text-primary"
                    />
                  )}
                </span>
              )}
            </p>

            {showTranslation && translationText && (
              <div className="mt-4 pt-4 border-t border-border">
                <p
                  className={`${
                    readingMode ? "text-lg" : ""
                  } text-muted-foreground`}
                >
                  {translationText}
                </p>
              </div>
            )}
          </div>

          {!readingMode && showOptions !== false && (
            <div className="relative" dir="ltr">
              {" "}
              {/* Keep LTR for dropdown alignment */}
              <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownToggle}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    onClick={(e) => e.stopPropagation()} // Prevent verse click
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="text-right">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent verse click
                        onCopy(verse.id, verse.text);
                      }}
                      className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 size={16} className="text-green-500" />
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
                        e.stopPropagation(); // Prevent verse click
                        onToggleBookmark(verse.id, verse.text);
                      }}
                      className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                    >
                      <Bookmark
                        size={16}
                        className={
                          isBookmarked ? "fill-primary text-primary" : ""
                        }
                      />
                      <span>
                        {isBookmarked ? "إزالة المرجعية" : "إضافة للمرجعيات"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent verse click
                        onShare(verse.id, verse.text);
                      }}
                      className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                    >
                      <Share size={16} />
                      <span>مشاركة</span>
                    </DropdownMenuItem>
                    {verse.id !== 0 && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent verse click
                          onRecite(verse.id);
                        }}
                        className="cursor-pointer flex flex-row-reverse gap-2 items-center"
                      >
                        <PlayCircle size={16} />
                        <span>الاستماع للآية</span>
                      </DropdownMenuItem>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
