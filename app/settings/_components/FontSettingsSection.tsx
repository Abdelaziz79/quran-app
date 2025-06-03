"use client";

import { useQuranSettings } from "@/app/_hooks/QuranSettingsProvider";
import {
  QuranFontFamily,
  QuranFontSize,
  QuranLineHeight,
} from "@/app/_lib/localStorageUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

export default function FontSettingsSection() {
  const {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
  } = useQuranSettings();

  // Sample verse for preview
  const exampleVerse =
    "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا";

  // Font options
  const fontOptions: { value: QuranFontFamily; label: string }[] = [
    { value: "KFGQPC", label: "الخط القرآني (KFGQPC)" },
    { value: "Lateef", label: "خط لطيف" },
    { value: "Scheherazade-New", label: "خط شهرزاد" },
    { value: "Uthmani", label: "الخط العثماني" },
  ];

  // Font size options
  const fontSizeOptions: { value: QuranFontSize; label: string }[] = [
    { value: "small", label: "صغير" },
    { value: "medium", label: "متوسط" },
    { value: "large", label: "كبير" },
    { value: "x-large", label: "كبير جداً" },
  ];

  // Line height options
  const lineHeightOptions: { value: QuranLineHeight; label: string }[] = [
    { value: "compact", label: "متقارب" },
    { value: "normal", label: "عادي" },
    { value: "relaxed", label: "متباعد" },
    { value: "loose", label: "متباعد جداً" },
  ];

  // For preview
  const [previewFont, setPreviewFont] = useState<QuranFontFamily>(fontFamily);
  const [previewFontSize, setPreviewFontSize] =
    useState<QuranFontSize>(fontSize);
  const [previewLineHeight, setPreviewLineHeight] =
    useState<QuranLineHeight>(lineHeight);

  // Get CSS classes for preview
  const getFontClass = (font: QuranFontFamily): string => {
    switch (font) {
      case "KFGQPC":
        return "font-kfgqpc";
      case "Lateef":
        return "font-lateef";
      case "Scheherazade-New":
        return "font-scheherazade-new";
      case "Uthmani":
        return "font-uthmani";
      default:
        return "font-kfgqpc";
    }
  };

  const getFontSizeClass = (size: QuranFontSize): string => {
    switch (size) {
      case "small":
        return "text-xl";
      case "medium":
        return "text-2xl";
      case "large":
        return "text-3xl";
      case "x-large":
        return "text-4xl";
      default:
        return "text-2xl";
    }
  };

  const getLineHeightClass = (height: QuranLineHeight): string => {
    switch (height) {
      case "compact":
        return "leading-relaxed";
      case "normal":
        return "leading-loose";
      case "relaxed":
        return "leading-[2.5]";
      case "loose":
        return "leading-[3]";
      default:
        return "leading-loose";
    }
  };

  // Apply settings
  const applySettings = () => {
    setFontFamily(previewFont);
    setFontSize(previewFontSize);
    setLineHeight(previewLineHeight);
  };

  // Reset preview to current settings
  const resetPreview = () => {
    setPreviewFont(fontFamily);
    setPreviewFontSize(fontSize);
    setPreviewLineHeight(lineHeight);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setPreviewFont("KFGQPC");
    setPreviewFontSize("medium");
    setPreviewLineHeight("normal");
  };

  // Initialize preview with current settings
  useEffect(() => {
    setPreviewFont(fontFamily);
    setPreviewFontSize(fontSize);
    setPreviewLineHeight(lineHeight);
  }, [fontFamily, fontSize, lineHeight]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إعدادات خط المصحف</h2>
      <p className="text-muted-foreground">
        قم بتخصيص نوع الخط وحجمه والمسافة بين الأسطر التي تفضلها عند قراءة
        القرآن الكريم.
      </p>

      {/* Font Preview */}
      <div className="font-preview-container">
        <h3 className="text-lg font-semibold mb-2">معاينة</h3>
        <div
          className={`example-verse p-6 ${getFontClass(
            previewFont
          )} ${getFontSizeClass(previewFontSize)} ${getLineHeightClass(
            previewLineHeight
          )} rtl`}
        >
          {exampleVerse}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Font Settings */}
        <Card>
          <CardHeader>
            <CardTitle>نوع الخط</CardTitle>
            <CardDescription>
              اختر نوع الخط الذي تفضله للقرآن الكريم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={previewFont}
              onValueChange={(value) =>
                setPreviewFont(value as QuranFontFamily)
              }
              dir="rtl"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الخط" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Size and Spacing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>حجم الخط والمسافات</CardTitle>
            <CardDescription>اختر حجم الخط والمسافة بين الأسطر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">حجم الخط</label>
              <Select
                value={previewFontSize}
                onValueChange={(value) =>
                  setPreviewFontSize(value as QuranFontSize)
                }
                dir="rtl"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر حجم الخط" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                المسافة بين الأسطر
              </label>
              <Select
                value={previewLineHeight}
                onValueChange={(value) =>
                  setPreviewLineHeight(value as QuranLineHeight)
                }
                dir="rtl"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر المسافة بين الأسطر" />
                </SelectTrigger>
                <SelectContent>
                  {lineHeightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 ">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="cursor-pointer"
        >
          استعادة الإعدادات الافتراضية
        </Button>
        <Button
          variant="outline"
          onClick={resetPreview}
          className="cursor-pointer"
        >
          إلغاء التغييرات
        </Button>
        <Button onClick={applySettings} className="cursor-pointer">
          تطبيق الإعدادات
        </Button>
      </div>
    </div>
  );
}
