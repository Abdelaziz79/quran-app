"use client";

import { useSurahList } from "@/app/_hooks/useQuranData";
import Link from "next/link";

export function SurahList() {
  const { surahs, isLoading, error } = useSurahList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">سور القرآن الكريم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {surahs.map((surah) => (
          <Link
            href={`/surah/${surah.index}`}
            key={surah.index}
            className="flex flex-col p-4 rounded-lg border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {parseInt(surah.index, 10)}
              </span>
              <span className="text-sm text-muted-foreground">
                {surah.count} آيات
              </span>
            </div>
            <h2 className="text-xl font-bold">{surah.titleAr}</h2>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{surah.title}</span>
              <span>{surah.type === "Makkiyah" ? "مكية" : "مدنية"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
