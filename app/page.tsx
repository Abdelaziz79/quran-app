"use client";

import { AyahOfTheDay } from "@/app/_components/AyahOfTheDay";
import { SurahList } from "@/app/_components/SurahList";

export default function HomePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto">
        <AyahOfTheDay />
      </div>

      <SurahList />
    </div>
  );
}
