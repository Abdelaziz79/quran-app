"use client";
import { SurahReader } from "@/app/_components/SurahReader";
import { useParams } from "next/navigation";

export default function SurahPage() {
  const { id } = useParams();

  return <SurahReader surahId={id as string} />;
}
