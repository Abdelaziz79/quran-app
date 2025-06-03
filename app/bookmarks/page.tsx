"use client";

import { useBookmarks } from "@/app/_hooks/useBookmarks";
import { useSurahList } from "@/app/_hooks/useQuranData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Bookmark,
  ChevronRight,
  ExternalLink,
  Settings,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

  // Bookmark settings state
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState<"surah" | "date">("surah");
  const [showVerseText, setShowVerseText] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Sort bookmarks based on the selected order
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (sortOrder === "surah") {
      // Sort by surah number (numeric sort)
      return Number(a.surahId) - Number(b.surahId);
    } else {
      // For "date" sorting, we'd ideally use the saved timestamp
      // But for now, we'll just leave it as is (most recently added last)
      return 0;
    }
  });

  if (surahsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">المرجعيات المحفوظة</h1>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
            <span>إعدادات المرجعيات</span>
          </Button>
        </div>

        {showSettings && (
          <Card className="mb-6 bg-muted/30">
            <CardHeader>
              <CardTitle>إعدادات المرجعيات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">خيارات العرض</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إظهار نص الآية</p>
                      <p className="text-sm text-muted-foreground">
                        عرض نص الآيات المحفوظة في القائمة
                      </p>
                    </div>
                    <Switch
                      checked={showVerseText}
                      onCheckedChange={setShowVerseText}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">الوضع المدمج</p>
                      <p className="text-sm text-muted-foreground">
                        تصغير حجم العرض لرؤية المزيد من المرجعيات
                      </p>
                    </div>
                    <Switch
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">ترتيب المرجعيات</h3>

                  <Select
                    value={sortOrder}
                    onValueChange={(value) =>
                      setSortOrder(value as "surah" | "date")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر طريقة الترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surah">حسب ترتيب السور</SelectItem>
                      <SelectItem value="date">حسب تاريخ الإضافة</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="pt-4">
                    {isClient && bookmarks.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={clearAllBookmarks}
                      >
                        حذف جميع المرجعيات
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          {sortedBookmarks.map((bookmark) => (
            <div
              key={bookmark.surahId}
              className={`bg-card rounded-lg border border-border ${
                compactMode ? "p-3" : "p-6"
              }`}
            >
              <h2
                className={`${
                  compactMode ? "text-xl" : "text-2xl"
                } font-bold mb-4`}
              >
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
                    className={`bg-background rounded-md ${
                      compactMode ? "p-2" : "p-3"
                    } hover:bg-primary/5 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Link
                        href={`/surah/${bookmark.surahId}?ayah=${verseId}`}
                        className="flex-1 hover:underline"
                      >
                        <span className="flex items-center">
                          {verseId !== 0 && (
                            <span
                              className={`flex items-center justify-center ${
                                compactMode ? "w-6 h-6" : "w-8 h-8"
                              } rounded-full bg-primary/10 text-primary text-sm font-medium ml-3 relative`}
                            >
                              {toArabicDigits(verseId)}
                              <Bookmark
                                size={compactMode ? 10 : 12}
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
                    {showVerseText &&
                      bookmark.verseTexts &&
                      bookmark.verseTexts[verseId] && (
                        <div
                          className={`pr-4 font-quran ${
                            compactMode
                              ? "text-sm leading-normal line-clamp-2"
                              : "text-base leading-relaxed"
                          }`}
                        >
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
