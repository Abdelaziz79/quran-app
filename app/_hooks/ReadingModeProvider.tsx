"use client";

import {
  ReadingModeContext,
  useReadingModeProvider,
} from "@/app/_hooks/useReadingMode";
import { ReactNode } from "react";

export function ReadingModeProvider({ children }: { children: ReactNode }) {
  const readingModeValues = useReadingModeProvider();

  return (
    <ReadingModeContext.Provider value={readingModeValues}>
      {children}
    </ReadingModeContext.Provider>
  );
}
