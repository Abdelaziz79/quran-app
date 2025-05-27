"use client";

import { useThemeContext } from "@/app/_hooks/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeContext();

  if (!mounted) return null;

  const label = theme === "light" ? "الوضع الليلي" : "الوضع النهاري";
  const isDark = theme === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-secondary/20"
            aria-label={label}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-300" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
