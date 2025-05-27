"use client";

import { useReadingMode } from "@/app/_hooks/useReadingMode";
import { BookOpen } from "lucide-react";

interface ReadingModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ReadingModeToggle({
  className = "",
  showLabel = false,
}: ReadingModeToggleProps) {
  const { readingMode, toggleReadingMode } = useReadingMode();

  return (
    <button
      onClick={toggleReadingMode}
      className={`flex items-center justify-center p-2 rounded-md transition-colors ${
        readingMode
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      } ${className}`}
      title={readingMode ? "إنهاء وضع القراءة" : "وضع القراءة"}
      aria-label={readingMode ? "إنهاء وضع القراءة" : "وضع القراءة"}
    >
      <BookOpen size={18} className="mr-1" />
      {showLabel && (
        <span className="text-sm">
          {readingMode ? "إنهاء وضع القراءة" : "وضع القراءة"}
        </span>
      )}
    </button>
  );
}
