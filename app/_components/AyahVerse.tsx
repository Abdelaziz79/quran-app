// app/_components/AyahVerse.tsx
"use client";

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
}: AyahVerseProps) {
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
          {verse.id !== 0 && ( // Ensure verse number is not 0 (for Bismillah which might not have an explicit number in some data)
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
              {isBookmarked && (
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

          {!readingMode && (
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
