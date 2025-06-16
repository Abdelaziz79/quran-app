"use client";

import ErrorComp from "@/app/_components/ErrorComp";
import Loading from "@/app/_components/Loading";
import { MemorizationLesson } from "@/app/_components/MemorizationLesson";
import { MemorizationSidebar } from "@/app/_components/MemorizationSidebar";
import { useMemorizationContext } from "@/app/_hooks/MemorizationProvider";
import { useSurahDetail, useSurahList } from "@/app/_hooks/useQuranData";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Book, BookCheck, Brain, GraduationCap, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MemorizationPage() {
  // Get surahs list
  const {
    surahs,
    isLoading: surahsLoading,
    error: surahsError,
  } = useSurahList();

  // State for selected surah and lesson
  const [selectedSurahId, setSelectedSurahId] = useState<string>("001");
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Get the content of the selected surah
  const {
    verses,
    metadata,
    isLoading: surahLoading,
    error: surahError,
  } = useSurahDetail(selectedSurahId);

  const { getLessonsForSurah } = useMemorizationContext();

  // Ensure we have at least one lesson when surah changes
  useEffect(() => {
    if (surahs.length > 0) {
      // Generate lessons for this surah (or get existing ones)
      const lessons = getLessonsForSurah(selectedSurahId);

      // If we have lessons, set the default to the first one
      if (lessons.length > 0) {
        setSelectedLessonId(lessons[0].lessonId);
      }
    }
  }, [surahs, selectedSurahId, getLessonsForSurah]);

  // Handle surah selection
  const handleSelectSurah = (surahId: string) => {
    // First set the sidebar to closed to prevent any lingering overlay
    setIsSidebarOpen(false);
    // Then update the selected surah
    setSelectedSurahId(surahId);

    // Ensure any focus is removed from sheet elements
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Handle lesson selection
  const handleSelectLesson = (lessonId: number) => {
    // First set the sidebar to closed
    setIsSidebarOpen(false);
    // Then update the selected lesson
    setSelectedLessonId(lessonId);
    // Scroll to top when changing lesson
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Ensure any focus is removed from sheet elements
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  // Handle when a lesson is completed
  const handleLessonComplete = () => {
    // Optionally auto-advance to next lesson
    const lessons = getLessonsForSurah(selectedSurahId);
    const currentIndex = lessons.findIndex(
      (l) => l.lessonId === selectedLessonId
    );

    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      // There is a next lesson, advance to it
      setSelectedLessonId(lessons[currentIndex + 1].lessonId);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset pointer-events on the body element when sidebar closes
  useEffect(() => {
    if (!isSidebarOpen) {
      // Small delay to ensure the sheet has fully closed
      const timer = setTimeout(() => {
        document.body.style.removeProperty("pointer-events");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Reset pointer-events when navigating away from the page
      document.body.style.removeProperty("pointer-events");
    };
  }, []);

  // Loading states
  const isLoading = surahsLoading || surahLoading;
  const error = surahsError || surahError;

  if (isLoading) return <Loading />;
  if (error) return <ErrorComp error={error} />;

  return (
    <div
      className="container mx-auto py-4 md:py-6 px-3 md:px-4 h-full"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span>حفظ القرآن الكريم</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            نظام لمساعدتك على حفظ القرآن الكريم بطريقة منظمة ومراجعته بانتظام
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Book className="h-4 w-4" />
              <span>القرآن الكريم</span>
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <BookCheck className="h-4 w-4" />
              <span>المرجعيات</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden mb-4">
        <Sheet
          open={isSidebarOpen}
          onOpenChange={(open) => {
            setIsSidebarOpen(open);
            // Immediately reset pointer-events when closing
            if (!open) {
              document.body.style.removeProperty("pointer-events");
            }
          }}
        >
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span>اختر السورة والدرس</span>
              </span>
              <span className="text-sm bg-primary/10 px-2 py-0.5 rounded-full">
                {metadata?.titleAr} - الدرس {selectedLessonId}
              </span>
            </Button>
          </SheetTrigger>
          {isSidebarOpen && (
            <SheetContent
              side="right"
              className="w-[85vw] sm:w-[350px] p-0 z-50"
              dir="rtl"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                // Reset pointer-events on body
                document.body.style.removeProperty("pointer-events");
              }}
            >
              <div className="h-full overflow-y-auto">
                <MemorizationSidebar
                  surahs={surahs}
                  selectedSurahId={selectedSurahId}
                  onSelectSurah={handleSelectSurah}
                  onSelectLesson={handleSelectLesson}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          )}
        </Sheet>
      </div>

      {/* Main Content with Sidebar and Lesson */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-h-[70vh]">
        {/* Sidebar - Desktop Only */}
        <div className="hidden md:block md:w-80 w-full">
          <div className="md:sticky md:top-24">
            <MemorizationSidebar
              surahs={surahs}
              selectedSurahId={selectedSurahId}
              onSelectSurah={handleSelectSurah}
              onSelectLesson={handleSelectLesson}
              isMobile={false}
            />
          </div>
        </div>

        {/* Main Lesson Area */}
        <div className="flex-1">
          {metadata && verses.length > 0 ? (
            <MemorizationLesson
              surahId={selectedSurahId}
              lessonId={selectedLessonId}
              surahNameAr={metadata.titleAr}
              verses={verses}
              onLessonComplete={handleLessonComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-medium">
                  اختر سورة ودرسًا للبدء في الحفظ
                </h3>
                <p className="text-muted-foreground">
                  يمكنك تقسيم السورة إلى دروس أصغر وتتبع تقدمك في الحفظ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
