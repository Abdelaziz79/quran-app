"use client";

import {
  QuranFontFamily,
  QuranFontSize,
  QuranLineHeight,
  loadQuranFontFamily,
  loadQuranFontSize,
  loadQuranLineHeight,
  saveQuranFontFamily,
  saveQuranFontSize,
  saveQuranLineHeight,
} from "@/app/_lib/localStorageUtils";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Define the context type
interface QuranSettingsContextType {
  fontFamily: QuranFontFamily;
  setFontFamily: (font: QuranFontFamily) => void;
  fontSize: QuranFontSize;
  setFontSize: (size: QuranFontSize) => void;
  lineHeight: QuranLineHeight;
  setLineHeight: (height: QuranLineHeight) => void;
  fontClass: string;
  fontSizeClass: string;
  lineHeightClass: string;
}

// Create context with default values to prevent undefined errors
const defaultSettings: QuranSettingsContextType = {
  fontFamily: "KFGQPC",
  setFontFamily: () => {},
  fontSize: "medium",
  setFontSize: () => {},
  lineHeight: "normal",
  setLineHeight: () => {},
  fontClass: "font-kfgqpc",
  fontSizeClass: "text-2xl",
  lineHeightClass: "leading-loose",
};

// Create context with default values
const QuranSettingsContext =
  createContext<QuranSettingsContextType>(defaultSettings);

// Provider component
export function QuranSettingsProvider({ children }: { children: ReactNode }) {
  const [fontFamily, setFontFamilyState] = useState<QuranFontFamily>("KFGQPC");
  const [fontSize, setFontSizeState] = useState<QuranFontSize>("medium");
  const [lineHeight, setLineHeightState] = useState<QuranLineHeight>("normal");

  // Load settings from localStorage on initial mount
  useEffect(() => {
    // Load settings only on the client side
    if (typeof window !== "undefined") {
      setFontFamilyState(loadQuranFontFamily());
      setFontSizeState(loadQuranFontSize());
      setLineHeightState(loadQuranLineHeight());
    }
  }, []);

  // Wrapper functions to update state and save to localStorage
  const setFontFamily = useCallback((font: QuranFontFamily) => {
    setFontFamilyState(font);
    if (typeof window !== "undefined") {
      saveQuranFontFamily(font);
    }
  }, []);

  const setFontSize = useCallback((size: QuranFontSize) => {
    setFontSizeState(size);
    if (typeof window !== "undefined") {
      saveQuranFontSize(size);
    }
  }, []);

  const setLineHeight = useCallback((height: QuranLineHeight) => {
    setLineHeightState(height);
    if (typeof window !== "undefined") {
      saveQuranLineHeight(height);
    }
  }, []);

  // Map settings to CSS classes
  const fontClass = getFontClass(fontFamily);
  const fontSizeClass = getFontSizeClass(fontSize);
  const lineHeightClass = getLineHeightClass(lineHeight);

  // Context value
  const value = {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontClass,
    fontSizeClass,
    lineHeightClass,
  };

  // Always provide a context value, even during initial render
  // This prevents the "must be used within a Provider" error
  return (
    <QuranSettingsContext.Provider value={value}>
      {children}
    </QuranSettingsContext.Provider>
  );
}

// Hook to use the settings context
export function useQuranSettings() {
  const context = useContext(QuranSettingsContext);
  return context;
}

// Helper functions to map settings to CSS classes
function getFontClass(fontFamily: QuranFontFamily): string {
  switch (fontFamily) {
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
}

function getFontSizeClass(fontSize: QuranFontSize): string {
  switch (fontSize) {
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
}

function getLineHeightClass(lineHeight: QuranLineHeight): string {
  switch (lineHeight) {
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
}
