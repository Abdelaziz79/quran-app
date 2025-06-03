"use client";

import { getAudioEditionVerseByVerse } from "@/app/_hooks/AlQuranApi";
import { useQuranAudioContext } from "@/app/_hooks/QuranAudioProvider";
import { useArabicRecitersForSurah } from "@/app/_hooks/useQuranAudio";
import {
  loadAutoPlayNext,
  saveAudioVolume,
  saveAutoPlayNext,
} from "@/app/_lib/localStorageUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

export default function AudioSettingsSection() {
  const {
    selectedReciter,
    setSelectedReciter,
    selectedAudioEdition,
    setSelectedAudioEdition,
    isVerseByVerseMode,
    setIsVerseByVerseMode,
    audioPlayer,
  } = useQuranAudioContext();

  // Use a default surah ID for demo purposes (Al-Fatiha)
  const defaultSurahId = 1;

  // Get the available reciters
  const { reciters: availableReciters } =
    useArabicRecitersForSurah(defaultSurahId);

  // Get verse-by-verse audio editions
  const verseByVerseEditions = getAudioEditionVerseByVerse();

  // Volume state (initialize from audio player)
  const [volume, setVolume] = useState<number>(audioPlayer.volume * 100);

  // State for auto-play next verse
  const [autoPlayNext, setAutoPlayNextState] = useState<boolean>(true);

  // Load saved settings on component mount
  useEffect(() => {
    // Load auto-play next verse setting
    setAutoPlayNextState(loadAutoPlayNext());
  }, []);

  // Wrapper function to update autoPlayNext state and save to localStorage
  const setAutoPlayNext = (value: boolean) => {
    setAutoPlayNextState(value);
    saveAutoPlayNext(value);
  };

  // Handle reciter change
  const handleReciterChange = (value: string) => {
    if (isVerseByVerseMode) {
      const edition = verseByVerseEditions.find((e) => e.identifier === value);
      if (edition) {
        setSelectedAudioEdition(edition);
      }
    } else {
      const reciterId = Number(value);
      const reciter = availableReciters.find((r) => r.id === reciterId);
      if (reciter) {
        setSelectedReciter(reciter);
      }
    }
  };

  // Handle playback mode change
  const handlePlaybackModeChange = (value: string) => {
    const newMode = value === "verse-by-verse";
    setIsVerseByVerseMode(newMode);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioPlayer.setVolume(newVolume / 100);
    saveAudioVolume(newVolume);
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume === 0) {
      setVolume(100);
      audioPlayer.setVolume(1);
      saveAudioVolume(100);
    } else {
      setVolume(0);
      audioPlayer.setVolume(0);
      saveAudioVolume(0);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إعدادات الصوت والتلاوة</h2>
      <p className="text-muted-foreground">
        قم بتخصيص إعدادات التلاوة والصوت حسب تفضيلاتك.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Playback Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle>وضع التلاوة</CardTitle>
            <CardDescription>
              اختر طريقة تشغيل التلاوة المفضلة لديك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={isVerseByVerseMode ? "verse-by-verse" : "full-surah"}
              onValueChange={handlePlaybackModeChange}
              className="flex flex-col gap-4"
              dir="rtl"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="full-surah" id="settings-full-surah" />
                <label
                  htmlFor="settings-full-surah"
                  className="text-sm font-medium cursor-pointer mr-2"
                >
                  سورة كاملة (تلاوة السورة بشكل متواصل)
                </label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem
                  value="verse-by-verse"
                  id="settings-verse-by-verse"
                />
                <label
                  htmlFor="settings-verse-by-verse"
                  className="text-sm font-medium cursor-pointer mr-2"
                >
                  آية بآية (تلاوة كل آية على حدة)
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Reciter Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>اختيار القارئ</CardTitle>
            <CardDescription>
              {isVerseByVerseMode
                ? "اختر القارئ للتلاوة آية بآية"
                : "اختر القارئ للتلاوة الكاملة للسور"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={
                isVerseByVerseMode
                  ? selectedAudioEdition?.identifier || ""
                  : selectedReciter?.id?.toString() || ""
              }
              onValueChange={handleReciterChange}
              dir="rtl"
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isVerseByVerseMode
                      ? "اختر القارئ (آية بآية)"
                      : "اختر القارئ (سورة كاملة)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {isVerseByVerseMode
                  ? verseByVerseEditions.map((edition) => (
                      <SelectItem
                        key={edition.identifier}
                        value={edition.identifier}
                      >
                        {edition.name}
                      </SelectItem>
                    ))
                  : availableReciters.map((reciter) => (
                      <SelectItem
                        key={reciter.id}
                        value={reciter.id.toString()}
                      >
                        {reciter.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Volume Control Card */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الصوت</CardTitle>
          <CardDescription>
            تحكم في مستوى الصوت وإعدادات التشغيل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleMute}
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : volume < 50 ? (
                <Volume1 className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <div className="flex-1">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
              />
            </div>
            <span className="w-12 text-center font-medium">{volume}%</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">تشغيل تلقائي للآية التالية</h3>
              <p className="text-sm text-muted-foreground">
                الانتقال التلقائي إلى الآية التالية بعد انتهاء التلاوة
              </p>
            </div>
            <Switch checked={autoPlayNext} onCheckedChange={setAutoPlayNext} />
          </div>
        </CardContent>
      </Card>

      {/* Default Settings Button */}
      <div className="flex mt-4">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            // Reset to default audio settings
            setVolume(100);
            audioPlayer.setVolume(1);
            saveAudioVolume(100);
            setAutoPlayNext(true);
          }}
        >
          استعادة الإعدادات الافتراضية للصوت
        </Button>
      </div>
    </div>
  );
}
