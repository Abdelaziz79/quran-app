"use client";

import RepeatCountGrid from "@/app/_components/RepeatCountGrid";
import { toArabicDigits } from "@/app/_lib/quranUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [sliderValues, setSliderValues] = useState<number[]>([
    1,
    Math.min(3, totalVerses),
  ]);
  const [startVerseInput, setStartVerseInput] = useState<string>(
    (repeatStartVerse || 1).toString()
  );
  const [endVerseInput, setEndVerseInput] = useState<string>(
    (repeatEndVerse || Math.min(3, totalVerses)).toString()
  );

  // Keep slider values in sync with actual repeat values
  useEffect(() => {
    if (isRepeatRange && repeatStartVerse !== null && repeatEndVerse !== null) {
      setSliderValues([repeatStartVerse, repeatEndVerse]);
      setStartVerseInput(repeatStartVerse.toString());
      setEndVerseInput(repeatEndVerse.toString());
    }
  }, [isRepeatRange, repeatStartVerse, repeatEndVerse]);

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
      setSliderValues([start, end]);
      setStartVerseInput(start.toString());
      setEndVerseInput(end.toString());
    }
  };

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    setSliderValues(values);
    setRepeatStartVerse(values[0]);
    setRepeatEndVerse(values[1]);
    setStartVerseInput(values[0].toString());
    setEndVerseInput(values[1].toString());

    // Pause playback when changing range
    if (onPause) {
      onPause();
    }
  };

  // Handle start verse input change - allow typing
  const handleStartVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setStartVerseInput(inputValue);

    // Only update the actual value if it's a valid number
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= totalVerses) {
      // If start verse is greater than end verse, adjust end verse
      const endVerse =
        repeatEndVerse !== null && value > repeatEndVerse
          ? value
          : repeatEndVerse;

      setRepeatStartVerse(value);
      if (endVerse !== repeatEndVerse) {
        setRepeatEndVerse(endVerse);
        setEndVerseInput(endVerse?.toString() || "");
      }

      setSliderValues([value, endVerse || totalVerses]);

      // Pause playback when changing range
      if (onPause) {
        onPause();
      }
    }
  };

  // Handle end verse input change - allow typing
  const handleEndVerseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEndVerseInput(inputValue);

    // Only update the actual value if it's a valid number
    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0 && value <= totalVerses) {
      // If end verse is less than start verse, adjust start verse
      const startVerse =
        repeatStartVerse !== null && value < repeatStartVerse
          ? value
          : repeatStartVerse;

      setRepeatEndVerse(value);
      if (startVerse !== repeatStartVerse) {
        setRepeatStartVerse(startVerse);
        setStartVerseInput(startVerse?.toString() || "");
      }

      setSliderValues([startVerse || 1, value]);

      // Pause playback when changing range
      if (onPause) {
        onPause();
      }
    }
  };

  // Handle blur events to validate and correct inputs
  const handleVerseInputBlur = () => {
    // Validate start verse
    let startValue = parseInt(startVerseInput);
    if (isNaN(startValue) || startValue < 1) startValue = 1;
    if (startValue > totalVerses) startValue = totalVerses;

    // Validate end verse
    let endValue = parseInt(endVerseInput);
    if (isNaN(endValue) || endValue < 1) endValue = Math.min(3, totalVerses);
    if (endValue > totalVerses) endValue = totalVerses;

    // Ensure start is not greater than end
    if (startValue > endValue) {
      endValue = startValue;
    }

    // Update all values
    setRepeatStartVerse(startValue);
    setRepeatEndVerse(endValue);
    setStartVerseInput(startValue.toString());
    setEndVerseInput(endValue.toString());
    setSliderValues([startValue, endValue]);
  };

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerseInputBlur();
    }
  };

  // Preset buttons for common ranges
  const handlePresetRange = (start: number, end: number) => {
    setRepeatStartVerse(start);
    setRepeatEndVerse(end);
    setSliderValues([start, end]);
    setStartVerseInput(start.toString());
    setEndVerseInput(end.toString());

    if (onPause) {
      onPause();
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

  // Handle custom repeat count input
  const handleCustomRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomRepeatInputValue(inputValue);

    const value = parseInt(inputValue);
    if (!isNaN(value) && value > 0) {
      setRepeatCount(value);
    }
  };

  // Keep the custom input in sync with the repeat count
  if (repeatCount > 10 && customRepeatInputValue !== repeatCount.toString()) {
    setCustomRepeatInputValue(repeatCount.toString());
  }

  return (
    <div className="bg-background dark:bg-slate-900 rounded-lg shadow-sm">
      {/* Toggle for repeat range mode */}
      <div className="p-3 sm:p-4">
        <div
          className="flex items-center justify-between space-x-2 space-x-reverse"
          dir="rtl"
        >
          <Label
            htmlFor="repeat-range-mode"
            className="flex-1 text-right font-medium"
          >
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
          <div className="mt-3 space-y-4" dir="rtl">
            {/* Range slider */}
            <div className="px-2">
              <Slider
                value={sliderValues}
                min={1}
                max={totalVerses}
                step={1}
                onValueChange={handleSliderChange}
                className="my-6 dark:bg-slate-800"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>١</span>
                <span>{toArabicDigits(totalVerses)}</span>
              </div>
            </div>

            {/* Input fields */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="start-verse" className="whitespace-nowrap">
                  من الآية:
                </Label>
                <Input
                  id="start-verse"
                  type="text"
                  inputMode="numeric"
                  value={startVerseInput}
                  onChange={handleStartVerseChange}
                  onBlur={handleVerseInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-16 h-8 text-center dark:bg-slate-800 dark:border-slate-700"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-verse" className="whitespace-nowrap">
                  إلى الآية:
                </Label>
                <Input
                  id="end-verse"
                  type="text"
                  inputMode="numeric"
                  value={endVerseInput}
                  onChange={handleEndVerseChange}
                  onBlur={handleVerseInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-16 h-8 text-center dark:bg-slate-800 dark:border-slate-700"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Preset range buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                      onClick={() =>
                        handlePresetRange(1, Math.min(3, totalVerses))
                      }
                    >
                      ٣ آيات
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>أول ٣ آيات</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                      onClick={() =>
                        handlePresetRange(1, Math.min(5, totalVerses))
                      }
                    >
                      ٥ آيات
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>أول ٥ آيات</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
                      onClick={() => handlePresetRange(1, totalVerses)}
                    >
                      السورة كاملة
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>السورة كاملة</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>

      {/* Repeat count section */}
      <div
        className="p-3 sm:p-4 border-t border-border/20 dark:border-slate-700/50"
        dir="rtl"
      >
        <Label className="text-center block mb-3 font-bold">
          عدد التكرارات: {toArabicDigits(repeatCount)}
        </Label>
        <RepeatCountGrid
          currentRepeatCount={repeatCount}
          onRepeatCountChange={handleSetRepeatCount}
        />

        {/* Custom repeat count input */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <Label htmlFor="custom-repeat" className="whitespace-nowrap text-sm">
            عدد مخصص:
          </Label>
          <Input
            id="custom-repeat"
            type="text"
            inputMode="numeric"
            min={1}
            value={customRepeatInputValue}
            onChange={handleCustomRepeatChange}
            className="w-20 h-8 text-center dark:bg-slate-800 dark:border-slate-700"
            placeholder="..."
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}
