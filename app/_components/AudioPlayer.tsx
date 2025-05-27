"use client";

import { useQuranAudioContext } from "@/app/_hooks/QuranAudioProvider";
import { useArabicRecitersForSurah } from "@/app/_hooks/useQuranAudio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Pause,
  Play,
  User,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

type AudioPlayerProps = {
  surahId: number;
};

export default function AudioPlayer({ surahId }: AudioPlayerProps) {
  const { getSurahAudioUrl, audioPlayer, selectedReciter, setSelectedReciter } =
    useQuranAudioContext();

  // Use the hook to get Arabic reciters for this surah
  const { reciters: availableReciters, isLoading: recitersLoading } =
    useArabicRecitersForSurah(surahId);

  const [volume, setVolume] = useState(100);

  // Set default reciter if available and none selected
  useEffect(() => {
    if (availableReciters.length > 0 && !selectedReciter) {
      setSelectedReciter(availableReciters[0]);
    }
  }, [availableReciters, selectedReciter, setSelectedReciter]);

  // Play surah audio
  const handlePlaySurah = () => {
    if (selectedReciter) {
      const audioUrl = getSurahAudioUrl(selectedReciter, surahId);
      if (audioUrl) {
        audioPlayer.play(audioUrl);
      }
    }
  };

  // Handle reciter change
  const handleReciterChange = (value: string) => {
    const reciterId = Number(value);
    const reciter = availableReciters.find((r) => r.id === reciterId);
    if (reciter) {
      setSelectedReciter(reciter);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioPlayer.setVolume(newVolume / 100);
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume === 0) {
      setVolume(100);
      audioPlayer.setVolume(1);
    } else {
      setVolume(0);
      audioPlayer.setVolume(0);
    }
  };

  // Handle seeking in audio
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    audioPlayer.seek(newTime);
  };

  if (recitersLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t border-border p-4 rtl flex items-center justify-center z-50">
        <Card className="flex items-center justify-center p-4 w-full max-w-lg mx-auto shadow-lg rounded-lg">
          <Loader2 className="animate-spin h-6 w-6 text-primary ml-3" />
          <span className="text-lg font-medium">جاري تحميل القراء...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t border-border/80 rtl z-50 backdrop-blur-sm bg-opacity-95">
      {/* Interactive progress bar - Always visible */}
      <div className="w-full px-4 pt-2 pb-1 flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground w-12 text-center">
          {formatTime(audioPlayer.currentTime)}
        </span>
        <Slider
          dir="rtl"
          value={[audioPlayer.currentTime]}
          min={0}
          max={audioPlayer.duration || 100}
          step={0.1}
          onValueChange={(value) => handleSeek(value)}
          className="cursor-pointer flex-1"
          disabled={audioPlayer.duration === 0}
        />
        <span className="text-xs font-mono text-muted-foreground w-12 text-center">
          {formatTime(audioPlayer.duration)}
        </span>
      </div>

      {/* Compact player */}
      <div className="flex items-center justify-between px-4 py-3 w-full max-w-6xl mx-auto">
        {/* Player info with reciter selector */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <Select
              value={selectedReciter?.id?.toString() || ""}
              onValueChange={handleReciterChange}
              dir="rtl"
            >
              <SelectTrigger
                id="reciter-select"
                className="w-[200px] bg-background text-foreground border-border rounded-lg"
              >
                <SelectValue placeholder="اختر القارئ" />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground border-border max-h-[300px] z-50 rounded-lg">
                {availableReciters.map((reciter) => (
                  <SelectItem
                    key={reciter.id}
                    value={reciter.id.toString()}
                    className="focus:bg-primary/10 focus:text-foreground"
                  >
                    {reciter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main controls - centered */}
        <div className="flex items-center justify-center">
          <Button
            variant={audioPlayer.isPlaying ? "secondary" : "default"}
            size="icon"
            onClick={
              audioPlayer.isPlaying ? audioPlayer.pause : handlePlaySurah
            }
            disabled={!selectedReciter}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
              audioPlayer.isPlaying
                ? "hover:bg-secondary/90"
                : "hover:bg-primary/90",
              "focus:ring-2 focus:ring-primary/30"
            )}
          >
            {audioPlayer.isLoading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : audioPlayer.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 mr-0.5" />
            )}
          </Button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center justify-end">
          {/* Volume control with container for proper RTL orientation */}
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full transition-colors"
              onClick={toggleMute}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 50 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <div className="w-16 sm:w-24 dir-ltr">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format time in MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
