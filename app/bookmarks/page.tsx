"use client";

import { useBookmarks } from "@/app/_hooks/useBookmarks";
import { useSurahList } from "@/app/_hooks/useQuranData";
import { Bookmark, ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

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

export default function BookmarksPage() {
  const { surahs, isLoading: surahsLoading } = useSurahList();
  const { bookmarks, isClient, removeBookmark, clearAllBookmarks } =
    useBookmarks(surahs);

  if (surahsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  console.log(bookmarks);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/"
          className="flex items-center text-primary hover:underline mb-4"
        >
          <ChevronRight className="ml-1 h-4 w-4" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>

        <h1 className="text-3xl font-bold text-center mb-6">
          المرجعيات المحفوظة
        </h1>

        {isClient && bookmarks.length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={clearAllBookmarks}
              className="px-4 py-2 rounded-md text-red-500 border border-red-300 hover:bg-red-50 transition-colors"
            >
              حذف جميع المرجعيات
            </button>
          </div>
        )}
      </div>

      {isClient && bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-2">
            لا توجد أي مرجعيات محفوظة
          </h2>
          <p className="text-muted-foreground mb-6">
            قم بإضافة الآيات إلى المرجعيات أثناء قراءة القرآن
          </p>
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            ابدأ القراءة
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.surahId}
              className="bg-card rounded-lg border border-border p-6"
            >
              <h2 className="text-2xl font-bold mb-4">
                <Link href={`/surah/${bookmark.surahId}`}>
                  <span className="hover:underline">
                    {bookmark.surahNameAr} - {bookmark.surahName}
                  </span>
                </Link>
              </h2>

              <div className="space-y-3">
                {bookmark.verseIds.map((verseId) => (
                  <div
                    key={verseId}
                    className="bg-background rounded-md p-3 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Link
                        href={`/surah/${bookmark.surahId}?ayah=${verseId}`}
                        className="flex-1 hover:underline"
                      >
                        <span className="flex items-center">
                          {verseId !== 0 && (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium ml-3 relative">
                              {toArabicDigits(verseId)}
                              <Bookmark
                                size={12}
                                className="absolute -top-1 -right-1 fill-primary text-primary"
                              />
                            </span>
                          )}
                          <span>
                            {bookmark.surahNameAr} {toArabicDigits(verseId)}
                          </span>
                        </span>
                      </Link>

                      <div className="flex items-center">
                        <Link
                          href={`/surah/${bookmark.surahId}?ayah=${verseId}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors mr-1"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            removeBookmark(bookmark.surahId, verseId)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Display verse text */}
                    {bookmark.verseTexts && bookmark.verseTexts[verseId] && (
                      <div className="pr-4 font-quran text-base leading-relaxed">
                        {bookmark.verseTexts[verseId]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
