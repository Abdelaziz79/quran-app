"use client";

import { SurahList } from "@/app/_components/SurahList";
import { AyahOfTheDay } from "@/app/_components/AyahOfTheDay";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto mb-8 flex justify-end">
        <Link
          href="/bookmarks"
          className="flex items-center text-primary hover:underline px-4"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          <span>المرجعيات المحفوظة</span>
        </Link>
      </div>

      <div className="container mx-auto">
        <AyahOfTheDay />
      </div>

      <SurahList />
    </div>
  );
}
