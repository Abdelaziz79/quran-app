"use client";
import { SurahReader } from "@/app/_components/SurahReader";
import { useParams } from "next/navigation";

export default function SurahPage() {
  const { id } = useParams();

  return (
    <div className="w-full min-h-screen" dir="rtl">
      <SurahReader surahId={id as string} />
    </div>
  );
}
