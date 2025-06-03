"use client";

import Link from "next/link";
import { Settings, BookOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">القرآن الكريم</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/bookmarks"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            <span className="mr-2 hidden sm:inline">المرجعيات</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="mr-2 hidden sm:inline">الإعدادات</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
