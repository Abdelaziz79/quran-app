import { useTheme } from "@/app/_hooks/useTheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

type ReadingModeContextType = {
  readingMode: boolean;
  toggleReadingMode: () => void;
  getReadingModeClasses: () => string;
};

const defaultContext: ReadingModeContextType = {
  readingMode: false,
  toggleReadingMode: () => {},
  getReadingModeClasses: () => "",
};

export const ReadingModeContext =
  createContext<ReadingModeContextType>(defaultContext);

// Function to get the initial reading mode from localStorage
const getInitialReadingMode = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const savedMode = localStorage.getItem("quran-reading-mode");
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
  } catch (e) {
    console.error("Failed to load reading mode from localStorage:", e);
  }

  return false;
};

// Function to save reading mode to localStorage
const saveReadingMode = (mode: boolean): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("quran-reading-mode", JSON.stringify(mode));
  } catch (e) {
    console.error("Failed to save reading mode to localStorage:", e);
  }
};

export function useReadingModeProvider() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use React Query for reading mode state
  const { data: readingMode = false } = useQuery({
    queryKey: ["readingMode"],
    queryFn: getInitialReadingMode,
    enabled: mounted,
    staleTime: Infinity,
  });

  // Toggle reading mode mutation
  const { mutate: toggleReadingMode } = useMutation({
    mutationFn: () => {
      const newMode = !readingMode;
      saveReadingMode(newMode);
      return Promise.resolve(newMode);
    },
    onSuccess: (newMode) => {
      queryClient.setQueryData(["readingMode"], newMode);
    },
  });

  // Get appropriate reading mode classes based on theme
  const getReadingModeClasses = () => {
    if (!readingMode) return "";

    return theme === "dark"
      ? "reading-mode bg-zinc-900 text-amber-50"
      : "reading-mode bg-amber-50 text-zinc-900";
  };

  return {
    readingMode,
    toggleReadingMode,
    getReadingModeClasses,
  };
}

export function useReadingMode() {
  const context = useContext(ReadingModeContext);
  if (!context) {
    throw new Error("useReadingMode must be used within a ReadingModeProvider");
  }
  return context;
}
