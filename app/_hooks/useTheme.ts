"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

// Function to get the theme from localStorage or system preference
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  // Check for user's preferred theme in localStorage
  const storedTheme = localStorage.getItem("theme") as Theme | null;

  // Check for system preference if no stored theme
  if (!storedTheme) {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return systemPrefersDark ? "dark" : "light";
  }

  return storedTheme;
};

// Function to apply theme to document
const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  // Apply theme to the document element
  const root = window.document.documentElement;

  // Remove the previous theme class
  root.classList.remove("light", "dark");

  // Add the new theme class
  root.classList.add(theme);

  // Save the theme preference to localStorage
  localStorage.setItem("theme", theme);
};

export function useTheme() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  // Use React Query to manage theme state
  const { data: theme = "light" } = useQuery({
    queryKey: ["theme"],
    queryFn: getInitialTheme,
    enabled: mounted,
    staleTime: Infinity,
  });

  // Toggle theme mutation
  const { mutate: setTheme } = useMutation({
    mutationFn: (newTheme: Theme) => {
      applyTheme(newTheme);
      return Promise.resolve(newTheme);
    },
    onSuccess: (newTheme) => {
      queryClient.setQueryData(["theme"], newTheme);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Function to toggle between themes
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    mounted,
  };
}

export default useTheme;
