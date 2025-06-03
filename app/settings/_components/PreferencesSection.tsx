"use client";

import { useTheme } from "@/app/_hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  loadSaveReadingPosition,
  loadShowTranslation,
  saveSaveReadingPosition,
  saveShowTranslation,
} from "@/app/_lib/localStorageUtils";

export default function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  // State connected to localStorage
  const [showTranslation, setShowTranslationState] = useState(false);
  const [saveReadingPosition, setSaveReadingPositionState] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    // Load settings from localStorage
    setShowTranslationState(loadShowTranslation());
    setSaveReadingPositionState(loadSaveReadingPosition());
  }, []);

  // Functions to update state and localStorage
  const setShowTranslation = (value: boolean) => {
    setShowTranslationState(value);
    saveShowTranslation(value);
  };

  const setSaveReadingPosition = (value: boolean) => {
    setSaveReadingPositionState(value);
    saveSaveReadingPosition(value);
  };

  // Mock function for clearing data
  const clearAllData = () => {
    setIsClearing(true);

    // Clear all localStorage data
    if (typeof window !== "undefined") {
      try {
        // Clear only app-specific localStorage data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("quran-") || key.includes("bookmark"))) {
            keysToRemove.push(key);
          }
        }

        // Remove collected keys
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Reset settings to defaults
        setShowTranslationState(false);
        setSaveReadingPositionState(true);
        setTheme("light");

        // Show success message
        setTimeout(() => {
          setIsClearing(false);
          alert("تم مسح جميع البيانات المحفوظة وإعادة ضبط الإعدادات");
        }, 1000);
      } catch (error) {
        console.error("Error clearing data:", error);
        setIsClearing(false);
        alert("حدث خطأ أثناء مسح البيانات");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">إعدادات المظهر</h2>
        <p className="text-muted-foreground mb-6">
          قم بتخصيص مظهر التطبيق والوضع الذي تفضله للقراءة.
        </p>

        <div className="flex flex-wrap gap-4 my-4">
          <button
            className={`relative p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
              theme === "light"
                ? "border-primary ring-2 ring-primary ring-offset-1"
                : "border-border"
            }`}
            onClick={() => setTheme("light")}
          >
            <div className="bg-white text-black p-2 rounded-md">
              <Sun className="h-5 w-5" />
            </div>
            <span className="font-medium">الوضع النهاري</span>
            {theme === "light" && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          <button
            className={`relative p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
              theme === "dark"
                ? "border-primary ring-2 ring-primary ring-offset-1"
                : "border-border"
            }`}
            onClick={() => setTheme("dark")}
          >
            <div className="bg-zinc-800 text-zinc-100 p-2 rounded-md">
              <Moon className="h-5 w-5" />
            </div>
            <span className="font-medium">الوضع الليلي</span>
            {theme === "dark" && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <Button
          onClick={() => {
            const systemPrefersDark = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches;
            setTheme(systemPrefersDark ? "dark" : "light");
          }}
          variant="outline"
          className="flex gap-2"
          size="sm"
        >
          تطبيق إعدادات النظام
        </Button>
      </div>

      <Separator />

      {/* General Preferences */}
      <div>
        <h2 className="text-2xl font-bold">إعدادات عامة</h2>
        <p className="text-muted-foreground mb-6">
          إعدادات أخرى لتخصيص تجربة القراءة.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">إظهار التفسير افتراضياً</h3>
              <p className="text-sm text-muted-foreground">
                عرض التفسير تلقائياً عند فتح السورة
              </p>
            </div>
            <Switch
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">حفظ مكان القراءة</h3>
              <p className="text-sm text-muted-foreground">
                حفظ آخر موضع قراءة للعودة إليه لاحقاً
              </p>
            </div>
            <Switch
              checked={saveReadingPosition}
              onCheckedChange={setSaveReadingPosition}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Options */}
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold">خيارات متقدمة</h3>
        <p className="text-sm text-muted-foreground">
          إعدادات متقدمة قد تؤثر على حسابك وبياناتك المحفوظة.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md">
          <h4 className="font-medium text-amber-800 dark:text-amber-200">
            تحذير
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            سيؤدي هذا الإجراء إلى مسح جميع المرجعيات وإعادة ضبط التطبيق
            وإعداداته. لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        <div className="flex">
          <Button
            variant="destructive"
            onClick={clearAllData}
            disabled={isClearing}
          >
            {isClearing ? "جاري المسح..." : "مسح جميع البيانات المحفوظة"}
          </Button>
        </div>
      </div>
    </div>
  );
}
