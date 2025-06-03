"use client";

import RepeatCountGrid from "@/app/_components/RepeatCountGrid";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

type RepeatOptionsProps = {
  isRepeatRange: boolean;
  setIsRepeatRange: (isRange: boolean) => void;
  repeatStartVerse: number | null;
  setRepeatStartVerse: (verse: number | null) => void;
  repeatEndVerse: number | null;
  setRepeatEndVerse: (verse: number | null) => void;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  totalVerses: number;
  onPause?: () => void;
};

export default function RepeatOptions({
  isRepeatRange,
  setIsRepeatRange,
  repeatStartVerse,
  setRepeatStartVerse,
  repeatEndVerse,
  setRepeatEndVerse,
  repeatCount,
  setRepeatCount,
  totalVerses,
  onPause,
}: RepeatOptionsProps) {
  const [customRepeatInputValue, setCustomRepeatInputValue] =
    useState<string>("");

  // Handle toggling the repeat range
  const handleToggleRangeRepeat = (checked: boolean) => {
    // Pause playback when toggling the range
    if (onPause) {
      onPause();
    }

    setIsRepeatRange(checked);

    // If enabling, set default values if not already set
    if (checked && (repeatStartVerse === null || repeatEndVerse === null)) {
      const start = 1;
      const end = Math.min(3, totalVerses);
      setRepeatStartVerse(start);
      setRepeatEndVerse(end);
    }
  };

  // Handle start verse input change
  const handleStartVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= totalVerses) {
      // If start verse is greater than end verse, adjust end verse
      if (repeatEndVerse !== null && value > repeatEndVerse) {
        setRepeatEndVerse(value);
      }
      setRepeatStartVerse(value);

      // Pause playback when changing range
      if (onPause) {
        onPause();
      }
    }
  };

  // Handle end verse input change
  const handleEndVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= totalVerses) {
      // If end verse is less than start verse, adjust start verse
      if (repeatStartVerse !== null && value < repeatStartVerse) {
        setRepeatStartVerse(value);
      }
      setRepeatEndVerse(value);

      // Pause playback when changing range
      if (onPause) {
        onPause();
      }
    }
  };

  // Handle setting repeat count
  const handleSetRepeatCount = (count: number) => {
    setRepeatCount(count);

    // Clear the custom input if selecting a preset value
    if (count <= 10) {
      setCustomRepeatInputValue("");
    } else {
      setCustomRepeatInputValue(count.toString());
    }
  };

  // Keep the custom input in sync with the repeat count
  if (repeatCount > 10 && customRepeatInputValue !== repeatCount.toString()) {
    setCustomRepeatInputValue(repeatCount.toString());
  }

  return (
    <div>
      {/* Toggle for repeat range mode */}
      <div className="p-2">
        <div
          className="flex items-center justify-between space-x-2 space-x-reverse"
          dir="rtl"
        >
          <Label htmlFor="repeat-range-mode" className="flex-1 text-right">
            تكرار مجموعة آيات
          </Label>
          <Switch
            id="repeat-range-mode"
            checked={isRepeatRange}
            onCheckedChange={handleToggleRangeRepeat}
          />
        </div>

        {/* Show range settings when enabled */}
        {isRepeatRange && (
          <div className="mt-2 space-y-2" dir="rtl">
            <div className="flex items-center gap-2">
              <Label htmlFor="start-verse" className="w-20 text-right">
                من الآية:
              </Label>
              <Input
                id="start-verse"
                type="number"
                min={1}
                max={totalVerses}
                value={repeatStartVerse || 1}
                onChange={handleStartVerseChange}
                className="w-16 h-8"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="end-verse" className="w-20 text-right">
                إلى الآية:
              </Label>
              <Input
                id="end-verse"
                type="number"
                min={1}
                max={totalVerses}
                value={repeatEndVerse || totalVerses}
                onChange={handleEndVerseChange}
                className="w-16 h-8"
                dir="ltr"
              />
            </div>
          </div>
        )}
      </div>

      {/* Repeat count section */}
      <div className="p-2 border-t border-border/20 mt-2" dir="rtl">
        <Label className="text-center block mb-2 font-bold">
          عدد التكرارات: {toArabicDigits(repeatCount)}
        </Label>
        <RepeatCountGrid
          currentRepeatCount={repeatCount}
          onRepeatCountChange={handleSetRepeatCount}
          className="mt-1"
        />
      </div>
    </div>
  );
}
